import React, { useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Navigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { authDataContext } from '../Context/AuthContext'
import { userDataContext } from '../Context/UserContext'

const defaultLegalPages = [
  { slug: "about-us", title: "About Us", content: "" },
  { slug: "privacy-policy", title: "Privacy Policy", content: "" },
  { slug: "terms-and-conditions", title: "Terms & Conditions", content: "" },
  { slug: "refund-policy", title: "Refund Policy", content: "" }
]

function AdminDashboard() {
  const { serverUrl } = useContext(authDataContext)
  const { userData, isAuthenticated } = useContext(userDataContext)
  const [messages, setMessages] = useState([])
  const [chatMessages, setChatMessages] = useState([])
  const [pages, setPages] = useState(defaultLegalPages)
  const [activeSlug, setActiveSlug] = useState(defaultLegalPages[0].slug)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState("")

  const buildAuthConfig = () => {
    const token = localStorage.getItem("zenstay_token") || ""
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    return { withCredentials: true, headers }
  }

  const activePage = useMemo(
    () => pages.find((page) => page.slug === activeSlug) || pages[0] || defaultLegalPages[0],
    [pages, activeSlug]
  )

  const loadAdminData = async () => {
    setLoading(true)
    try {
      const [contactResult, pagesResult, chatResult] = await Promise.all([
        axios.get(`${serverUrl}/api/contact/admin/messages`, buildAuthConfig()),
        axios.get(`${serverUrl}/api/legal`, buildAuthConfig()),
        axios.get(`${serverUrl}/api/chat/admin/messages`, buildAuthConfig())
      ])

      setMessages(Array.isArray(contactResult.data) ? contactResult.data : [])
      setChatMessages(Array.isArray(chatResult.data) ? chatResult.data : [])

      const incomingPages = Array.isArray(pagesResult.data) ? pagesResult.data : []
      const mergedPages = defaultLegalPages.map((page) => {
        const existing = incomingPages.find((item) => item.slug === page.slug)
        return existing ? { ...page, ...existing } : page
      })
      setPages(mergedPages)
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to load admin data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userData?.isAdmin) {
      loadAdminData()
    }
  }, [userData?.isAdmin, serverUrl])

  const updatePageField = (field, value) => {
    setPages((prev) =>
      prev.map((page) => (page.slug === activeSlug ? { ...page, [field]: value } : page))
    )
  }

  const saveLegalPage = async () => {
    setSaving(true)
    try {
      const result = await axios.put(
        `${serverUrl}/api/legal/${activeSlug}`,
        {
          title: activePage?.title || "",
          content: activePage?.content || ""
        },
        buildAuthConfig()
      )
      setPages((prev) =>
        prev.map((page) => (page.slug === activeSlug ? { ...page, ...result.data } : page))
      )
      toast.success("Legal page updated")
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to update legal page")
    } finally {
      setSaving(false)
    }
  }

  const deleteContactMessage = async (id) => {
    setDeletingId(id)
    try {
      await axios.delete(`${serverUrl}/api/contact/admin/messages/${id}`, buildAuthConfig())
      setMessages((prev) => prev.filter((message) => String(message._id) !== String(id)))
      toast.success("Contact message deleted")
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to delete message")
    } finally {
      setDeletingId("")
    }
  }

  const deleteChatMessage = async (id) => {
    setDeletingId(id)
    try {
      await axios.delete(`${serverUrl}/api/chat/admin/messages/${id}`, buildAuthConfig())
      setChatMessages((prev) => prev.filter((message) => String(message._id) !== String(id)))
      toast.success("Chat message deleted")
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to delete chat message")
    } finally {
      setDeletingId("")
    }
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  if (!userData?.isAdmin) {
    return <Navigate to="/" />
  }

  return (
    <div className='min-h-screen bg-[#f7f7f7] px-[20px] py-[30px] md:px-[40px]'>
      <div className='max-w-[1280px] mx-auto flex flex-col gap-[20px]'>
        <div>
          <h1 className='text-[32px] font-semibold text-[#1f2937]'>Admin Dashboard</h1>
          <p className='text-[16px] text-[#4b5563] mt-[6px]'>Manage legal pages, support messages, and chat moderation from one place.</p>
        </div>

        {loading && <div className='rounded-xl bg-white p-[20px] border border-[#e5e7eb]'>Loading admin data...</div>}

        {!loading && (
          <>
            <div className='grid grid-cols-1 gap-[20px] lg:grid-cols-[1.05fr_0.95fr]'>
              <div className='rounded-xl bg-white border border-[#e5e7eb] p-[20px] flex flex-col gap-[16px]'>
                <div className='flex flex-wrap gap-[10px]'>
                  {pages.map((page) => (
                    <button
                      key={page.slug}
                      className={`px-[14px] py-[8px] rounded-full border text-[14px] ${activeSlug === page.slug ? "bg-[var(--zenstay-accent)] text-white border-[var(--zenstay-accent)]" : "bg-white border-[#d1d5db] text-[#374151]"}`}
                      onClick={() => setActiveSlug(page.slug)}
                    >
                      {page.title}
                    </button>
                  ))}
                </div>

                <div className='flex flex-col gap-[10px]'>
                  <label className='text-[15px] font-medium text-[#374151]'>Page Title</label>
                  <input
                    type="text"
                    className='border border-[#d1d5db] rounded-lg px-[14px] py-[10px]'
                    value={activePage?.title || ""}
                    onChange={(e) => updatePageField("title", e.target.value)}
                  />
                </div>

                <div className='flex flex-col gap-[10px]'>
                  <label className='text-[15px] font-medium text-[#374151]'>Page Content</label>
                  <textarea
                    className='min-h-[320px] border border-[#d1d5db] rounded-lg px-[14px] py-[10px]'
                    value={activePage?.content || ""}
                    onChange={(e) => updatePageField("content", e.target.value)}
                  />
                </div>

                <button
                  className='w-fit px-[24px] py-[10px] rounded-lg bg-[var(--zenstay-accent)] text-white'
                  onClick={saveLegalPage}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Legal Page"}
                </button>
              </div>

              <div className='rounded-xl bg-white border border-[#e5e7eb] p-[20px] flex flex-col gap-[14px]'>
                <h2 className='text-[24px] font-semibold text-[#1f2937]'>Contact Messages</h2>
                {messages.length === 0 && (
                  <div className='rounded-lg border border-dashed border-[#d1d5db] p-[20px] text-[#6b7280]'>
                    No contact messages yet.
                  </div>
                )}

                {messages.map((message) => (
                  <div key={message._id} className='rounded-lg border border-[#e5e7eb] p-[16px] flex flex-col gap-[8px]'>
                    <div className='flex items-start justify-between gap-[12px]'>
                      <div>
                        <h3 className='font-semibold text-[#111827]'>{message.name}</h3>
                        <p className='text-[14px] text-[#6b7280]'>{message.email}</p>
                      </div>
                      <button
                        className='px-[12px] py-[6px] rounded-lg bg-[#111827] text-white text-[14px]'
                        onClick={() => deleteContactMessage(message._id)}
                        disabled={deletingId === message._id}
                      >
                        {deletingId === message._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                    {message.subject && <p className='text-[15px] font-medium text-[#374151]'>Subject: {message.subject}</p>}
                    <p className='text-[15px] text-[#374151] whitespace-pre-line'>{message.message}</p>
                    <p className='text-[13px] text-[#9ca3af]'>{new Date(message.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className='rounded-xl bg-white border border-[#e5e7eb] p-[20px] flex flex-col gap-[14px]'>
              <div className='flex items-center justify-between gap-[12px] flex-wrap'>
                <div>
                  <h2 className='text-[24px] font-semibold text-[#1f2937]'>Chat Moderation</h2>
                  <p className='text-[14px] text-[#6b7280] mt-[4px]'>Review recent guest-host chat activity, including images, files, and bot replies.</p>
                </div>
              </div>

              {chatMessages.length === 0 && (
                <div className='rounded-lg border border-dashed border-[#d1d5db] p-[20px] text-[#6b7280]'>
                  No chat messages yet.
                </div>
              )}

              <div className='grid grid-cols-1 gap-[14px] xl:grid-cols-2'>
                {chatMessages.map((message) => (
                  <div key={message._id} className='rounded-lg border border-[#e5e7eb] p-[16px] flex flex-col gap-[8px]'>
                    <div className='flex items-start justify-between gap-[12px]'>
                      <div>
                        <h3 className='font-semibold text-[#111827]'>{message.listingTitle}</h3>
                        <p className='text-[13px] text-[#6b7280]'>Host: {message.hostName} | Guest: {message.guestName}</p>
                      </div>
                      <button
                        className='px-[12px] py-[6px] rounded-lg bg-[#111827] text-white text-[14px]'
                        onClick={() => deleteChatMessage(message._id)}
                        disabled={deletingId === message._id}
                      >
                        {deletingId === message._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                    <p className='text-[14px] text-[#4b5563]'>Sender: {message.senderName}</p>
                    {message.text && <p className='text-[15px] text-[#374151] whitespace-pre-line'>{message.text}</p>}
                    {message.attachmentUrl && (
                      <a href={message.attachmentUrl} target="_blank" rel="noreferrer" className='text-[14px] text-[var(--zenstay-accent)] underline-offset-4 hover:underline'>
                        {message.attachmentKind === "image" ? "Open shared image" : `Open file: ${message.attachmentName || "Attachment"}`}
                      </a>
                    )}
                    <p className='text-[13px] text-[#9ca3af]'>{new Date(message.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
