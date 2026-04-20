import React, { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'
import { toast } from 'react-toastify'

const playNotificationTone = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return
    const context = new AudioContextClass()
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()
    oscillator.type = "sine"
    oscillator.frequency.setValueAtTime(720, context.currentTime)
    gainNode.gain.setValueAtTime(0.001, context.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.02)
    gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.22)
    oscillator.connect(gainNode)
    gainNode.connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + 0.24)
  } catch {
    // Ignore browsers that block programmatic audio before interaction.
  }
}

function ChatPanel({ cardDetails, userData, serverUrl, buildAuthConfig, isLocalListing }) {
  const [threads, setThreads] = useState([])
  const [activeGuestId, setActiveGuestId] = useState("")
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [guestUnreadCount, setGuestUnreadCount] = useState(0)
  const [hostThreadUnread, setHostThreadUnread] = useState({})
  const socketRef = useRef(null)
  const listRef = useRef(null)
  const lastSoundRef = useRef(0)
  const listingId = String(cardDetails?._id || "")
  const hostId = String(cardDetails?.host?._id || cardDetails?.host || "")
  const isHost = Boolean(userData?._id && hostId && String(userData._id) === hostId)

  const buildSocket = () => {
    const token = localStorage.getItem("zenstay_token") || ""
    if (!token) return null
    return io(serverUrl, {
      transports: ["websocket", "polling"],
      auth: { token }
    })
  }

  const joinCurrentThread = () => {
    const socket = socketRef.current
    if (!socket?.connected || !listingId) return
    socket.emit("chat:join-thread", {
      listingId,
      guestId: isHost ? activeGuestId : undefined
    }, () => {})
  }

  const activeThreadLabel = useMemo(() => {
    if (!isHost) {
      return cardDetails?.hostName || "Host"
    }
    const thread = threads.find((item) => String(item.guestId) === String(activeGuestId))
    return thread?.guestName || "Guest"
  }, [isHost, threads, activeGuestId, cardDetails?.hostName])

  const activeThreadUnread = isHost
    ? Number(hostThreadUnread[String(activeGuestId)] || 0)
    : Number(guestUnreadCount || 0)

  const maybePlayTone = (incoming) => {
    const mine = String(incoming?.sender) === String(userData?._id)
    if (mine) return
    const now = Date.now()
    if (now - lastSoundRef.current < 500) return
    lastSoundRef.current = now
    playNotificationTone()
  }

  const appendMessage = (incoming) => {
    setMessages((prev) => {
      const exists = prev.some((item) => String(item._id) === String(incoming._id))
      if (exists) return prev
      return [...prev, incoming]
    })
  }

  const syncHostUnreadMap = (nextThreads) => {
    const unreadMap = {}
    nextThreads.forEach((thread) => {
      unreadMap[String(thread.guestId)] = Number(thread.unreadCount || 0)
    })
    setHostThreadUnread(unreadMap)
  }

  const fetchThreads = async () => {
    if (!isHost || !listingId) return
    const result = await axios.get(`${serverUrl}/api/chat/listing/${listingId}/threads`, buildAuthConfig())
    const nextThreads = Array.isArray(result.data) ? result.data : []
    setThreads(nextThreads)
    syncHostUnreadMap(nextThreads)
    if (!activeGuestId && nextThreads[0]?.guestId) {
      setActiveGuestId(String(nextThreads[0].guestId))
    }
  }

  const fetchMessages = async (guestIdOverride = activeGuestId) => {
    if (!listingId || !userData?._id) return
    setLoading(true)
    try {
      const path = isHost && guestIdOverride
        ? `${serverUrl}/api/chat/listing/${listingId}/thread/${guestIdOverride}`
        : `${serverUrl}/api/chat/listing/${listingId}/thread`
      const result = await axios.get(path, buildAuthConfig())
      const nextMessages = Array.isArray(result.data?.messages) ? result.data.messages : []
      setMessages(nextMessages)
      if (isHost && guestIdOverride) {
        setHostThreadUnread((prev) => ({ ...prev, [String(guestIdOverride)]: 0 }))
      } else {
        setGuestUnreadCount(0)
      }
    } catch (error) {
      setMessages([])
      if (error?.response?.status !== 404) {
        toast.error(error?.response?.data?.message || "Unable to load chat")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!userData?._id || !listingId || isLocalListing) {
      return
    }

    let isMounted = true
    const setup = async () => {
      try {
        if (isHost) {
          await fetchThreads()
        }
        if (isMounted) {
          await fetchMessages(isHost ? activeGuestId : "")
        }
      } catch (error) {
        console.log(error)
      }
    }
    setup()

    return () => {
      isMounted = false
    }
  }, [listingId, userData?._id, isLocalListing, isHost])

  useEffect(() => {
    if (!isHost || !activeGuestId) return
    fetchMessages(activeGuestId)
  }, [activeGuestId, isHost])

  useEffect(() => {
    if (!userData?._id || !listingId || isLocalListing) return

    const socket = buildSocket()
    if (!socket) return
    socketRef.current = socket

    socket.on("connect", () => {
      joinCurrentThread()
    })

    socket.on("chat:message", (payload) => {
      const sameListing = String(payload?.listing) === listingId
      if (!sameListing) return

      const sameThread = !isHost || String(payload?.guest) === String(activeGuestId)
      if (sameThread) {
        appendMessage(payload)
        const mine = String(payload?.sender) === String(userData?._id)
        if (!mine) {
          maybePlayTone(payload)
          if (isHost) {
            setHostThreadUnread((prev) => ({
              ...prev,
              [String(payload.guest)]: sameThread ? 0 : Number(prev[String(payload.guest)] || 0) + 1
            }))
          } else {
            setGuestUnreadCount(0)
          }
        }
      } else if (isHost) {
        setHostThreadUnread((prev) => ({
          ...prev,
          [String(payload.guest)]: Number(prev[String(payload.guest)] || 0) + 1
        }))
        maybePlayTone(payload)
      } else {
        setGuestUnreadCount((prev) => prev + 1)
        maybePlayTone(payload)
      }

      if (isHost) {
        fetchThreads().catch(() => {})
      }
    })

    socket.on("chat:thread-updated", (payload) => {
      if (String(payload?.listingId) === listingId && isHost) {
        fetchThreads().catch(() => {})
      }
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [listingId, userData?._id, isLocalListing, isHost, activeGuestId])

  useEffect(() => {
    if (!userData?._id || !listingId || isLocalListing) return
    if (isHost && !activeGuestId) return
    joinCurrentThread()
  }, [listingId, userData?._id, isLocalListing, isHost, activeGuestId])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  const sendTextMessage = async () => {
    const text = String(messageText || "").trim()
    if (!text) return
    if (isHost && !activeGuestId) {
      return toast.info("Select a guest thread first")
    }

    setSending(true)
    try {
      const socket = socketRef.current
      if (socket?.connected) {
        await new Promise((resolve, reject) => {
          socket.emit("chat:send-message", {
            listingId,
            guestId: isHost ? activeGuestId : undefined,
            text
          }, (response) => {
            if (!response?.ok) {
              reject(new Error(response?.message || "Unable to send message"))
              return
            }
            appendMessage(response.message)
            resolve(response.message)
          })
        })
      } else {
        const result = await axios.post(`${serverUrl}/api/chat/listing/${listingId}/message`, {
          guestId: isHost ? activeGuestId : undefined,
          text
        }, buildAuthConfig())
        appendMessage(result.data)
      }

      setMessageText("")
      if (isHost) {
        fetchThreads().catch(() => {})
      }
    } catch (error) {
      toast.error(error?.message || error?.response?.data?.message || "Unable to send message")
    } finally {
      setSending(false)
    }
  }

  const sendAttachment = async () => {
    if (!selectedFile) return
    if (isHost && !activeGuestId) {
      return toast.info("Select a guest thread first")
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      if (String(messageText || "").trim()) {
        formData.append("text", messageText)
      }
      if (isHost && activeGuestId) {
        formData.append("guestId", activeGuestId)
      }
      const result = await axios.post(`${serverUrl}/api/chat/listing/${listingId}/message`, formData, {
        ...buildAuthConfig(),
        headers: {
          ...(buildAuthConfig().headers || {}),
          "Content-Type": "multipart/form-data"
        }
      })
      appendMessage(result.data)
      setSelectedFile(null)
      setMessageText("")
      if (isHost) {
        fetchThreads().catch(() => {})
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to send attachment")
    } finally {
      setUploading(false)
    }
  }

  if (!userData?._id) {
    return null
  }

  if (isLocalListing) {
    return (
      <div className='w-[95%] max-w-[1100px] rounded-[28px] border border-[#dce6e6] bg-white p-[20px] md:w-[80%]'>
        <h2 className='text-[24px] font-semibold text-[#183335]'>Guest to Host Chat</h2>
        <p className='text-[15px] text-[#6a7f81] mt-[8px]'>Chat is available for saved backend listings. Local demo listings do not support real-time messaging.</p>
      </div>
    )
  }

  return (
    <div className='w-[95%] max-w-[1100px] md:w-[80%] mt-[18px] rounded-[30px] border border-[#dce6e6] bg-[linear-gradient(135deg,#ffffff_0%,#f3fbfb_100%)] p-[16px] md:p-[22px]'>
      <div className='flex items-center justify-between gap-[12px] flex-wrap'>
        <div>
          <div className='flex items-center gap-[10px] flex-wrap'>
            <h2 className='text-[24px] font-semibold text-[#183335]'>Guest to Host Chat</h2>
            {activeThreadUnread > 0 && (
              <span className='min-w-[28px] h-[28px] px-[9px] rounded-full bg-[var(--zenstay-accent)] text-white text-[13px] flex items-center justify-center'>
                {activeThreadUnread}
              </span>
            )}
          </div>
          <p className='text-[14px] text-[#62797b] mt-[4px]'>
            {isHost ? "Manage guest conversations for this listing." : "Ask the host anything about this stay."}
          </p>
        </div>
        <div className='rounded-full bg-[#123b3d] text-white px-[14px] py-[8px] text-[13px] tracking-[0.14em] uppercase'>Auto Reply Bot Active</div>
      </div>

      <div className='grid grid-cols-1 gap-[14px] mt-[16px] lg:grid-cols-[0.36fr_0.64fr]'>
        {isHost && (
          <div className='rounded-[24px] border border-[#d6e3e3] bg-white p-[14px] flex flex-col gap-[10px] min-h-[420px]'>
            <div className='text-[15px] font-semibold text-[#264547]'>Guest Threads</div>
            {threads.length === 0 && (
              <div className='text-[14px] text-[#718688] rounded-[18px] border border-dashed border-[#d8e4e4] p-[14px]'>
                No guest messages yet.
              </div>
            )}
            {threads.map((thread) => {
              const unreadCount = Number(hostThreadUnread[String(thread.guestId)] || thread.unreadCount || 0)
              const preview = thread.lastMessage || (thread.lastAttachmentKind === "image" ? "Image shared" : thread.lastAttachmentKind === "file" ? `File shared: ${thread.lastAttachmentName || "Attachment"}` : "No preview")
              return (
                <button
                  key={thread.guestId}
                  className={`text-left rounded-[18px] border px-[14px] py-[12px] transition-colors ${String(activeGuestId) === String(thread.guestId) ? "border-[var(--zenstay-accent)] bg-[#effafb]" : "border-[#e1ebeb] bg-[#fcfefe]"}`}
                  onClick={() => setActiveGuestId(String(thread.guestId))}
                >
                  <div className='flex items-start justify-between gap-[10px]'>
                    <div className='font-semibold text-[#183335]'>{thread.guestName}</div>
                    {unreadCount > 0 && (
                      <span className='min-w-[24px] h-[24px] px-[7px] rounded-full bg-[var(--zenstay-accent)] text-white text-[12px] flex items-center justify-center'>
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div className='text-[13px] text-[#6d8082] mt-[4px] line-clamp-2'>{preview}</div>
                </button>
              )
            })}
          </div>
        )}

        <div className='rounded-[24px] border border-[#d6e3e3] bg-white p-[14px] flex flex-col min-h-[420px]'>
          <div className='flex items-center justify-between gap-[10px] pb-[12px] border-b border-[#e6eeee]'>
            <div>
              <div className='text-[16px] font-semibold text-[#183335]'>{activeThreadLabel}</div>
              <div className='text-[13px] text-[#6f8284]'>{isHost ? "Selected guest thread" : "Host conversation"}</div>
            </div>
          </div>

          <div ref={listRef} className='flex-1 overflow-auto py-[12px] flex flex-col gap-[10px] min-h-[220px]'>
            {loading && <div className='text-[14px] text-[#718688]'>Loading chat...</div>}
            {!loading && messages.length === 0 && (
              <div className='text-[14px] text-[#718688] rounded-[18px] border border-dashed border-[#d8e4e4] p-[14px]'>
                Start the conversation. The auto-reply bot will acknowledge guest messages instantly.
              </div>
            )}
            {!loading && messages.map((message) => {
              const mine = String(message.sender) === String(userData?._id)
              const bot = message.senderRole === "bot"
              return (
                <div key={message._id} className={`max-w-[86%] rounded-[20px] px-[14px] py-[12px] ${bot ? "bg-[#fff8ea] border border-[#f1dfb4] text-[#5d4a22] self-start" : mine ? "bg-[#123b3d] text-white self-end" : "bg-[#f4f8f8] text-[#183335] border border-[#e1ecec] self-start"}`}>
                  <div className='text-[12px] uppercase tracking-[0.12em] opacity-75 mb-[4px]'>{message.senderName || message.senderRole}</div>
                  {message.text && <div className='text-[15px] leading-[1.45]'>{message.text}</div>}
                  {message.attachmentUrl && (
                    <div className='mt-[8px]'>
                      {message.attachmentKind === "image" ? (
                        <a href={message.attachmentUrl} target="_blank" rel="noreferrer">
                          <img src={message.attachmentUrl} alt={message.attachmentName || "Shared image"} className='w-[220px] max-w-full rounded-[16px] border border-white/20' />
                        </a>
                      ) : (
                        <a href={message.attachmentUrl} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-[8px] rounded-[14px] px-[12px] py-[10px] text-[14px] ${mine ? "bg-white/12" : "bg-[#edf5f5]"}`}>
                          <span>Attachment</span>
                          <span className='font-medium'>{message.attachmentName || "Download file"}</span>
                        </a>
                      )}
                    </div>
                  )}
                  <div className='text-[11px] opacity-70 mt-[6px]'>{message.createdAt ? new Date(message.createdAt).toLocaleString() : ""}</div>
                </div>
              )
            })}
          </div>

          <div className='pt-[12px] border-t border-[#e6eeee] flex flex-col gap-[10px]'>
            {selectedFile && (
              <div className='flex items-center justify-between gap-[10px] rounded-[16px] border border-[#dbe7e7] bg-[#f5fbfb] px-[12px] py-[10px]'>
                <div className='text-[13px] text-[#355153] truncate'>{selectedFile.name}</div>
                <button className='text-[13px] text-[red]' onClick={() => setSelectedFile(null)}>Remove</button>
              </div>
            )}
            <textarea
              className='min-h-[96px] rounded-[18px] border border-[#d4e0e0] px-[14px] py-[12px] outline-none focus:border-[var(--zenstay-accent)]'
              placeholder={isHost ? "Reply to the selected guest..." : "Ask about pricing, amenities, check-in, or availability..."}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />
            <div className='flex items-center justify-between gap-[12px] flex-wrap'>
              <div className='flex items-center gap-[10px] flex-wrap'>
                <label className='px-[14px] py-[10px] rounded-[14px] border border-[#d4e0e0] text-[14px] cursor-pointer bg-white'>
                  Share Image/File
                  <input
                    type="file"
                    className='hidden'
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                </label>
                <div className='text-[12px] text-[#6f8284]'>Real-time chat with sound alerts</div>
              </div>
              <div className='flex items-center gap-[10px]'>
                <button className='px-[18px] py-[11px] rounded-[16px] border border-[#d4e0e0] text-[#264547] text-[15px]' onClick={sendAttachment} disabled={uploading || !selectedFile}>
                  {uploading ? "Uploading..." : "Send File"}
                </button>
                <button className='px-[22px] py-[11px] rounded-[16px] bg-[var(--zenstay-accent)] text-white text-[15px]' onClick={sendTextMessage} disabled={sending}>
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatPanel
