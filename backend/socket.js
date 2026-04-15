import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import User from "./model/user.model.js";
import { BOT_NAME, buildUserRoomId, createChatMessage, emitThreadUpdated, resolveChatAccess, scheduleBotReply, serializeMessage } from "./controllers/chat.controller.js";

export const attachSocketServer = (httpServer, { corsOptions }) => {
    const io = new Server(httpServer, {
        cors: corsOptions
    })

    io.use(async (socket, next) => {
        try {
            const token = String(socket.handshake.auth?.token || socket.handshake.headers?.authorization || "")
                .replace(/^Bearer\s+/i, "")
                .trim()

            if (!token) {
                return next(new Error("Authentication token missing"))
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            const user = await User.findById(decoded.userId).select("name email")
            if (!user) {
                return next(new Error("User not found"))
            }

            socket.user = user
            next()
        } catch (error) {
            next(new Error("Socket authentication failed"))
        }
    })

    io.on("connection", (socket) => {
        socket.join(buildUserRoomId(socket.user._id))

        socket.on("chat:join-thread", async (payload = {}, callback = () => {}) => {
            try {
                const access = await resolveChatAccess({
                    listingId: payload.listingId,
                    userId: socket.user._id,
                    guestId: payload.guestId
                })
                socket.join(access.roomId)
                callback({
                    ok: true,
                    roomId: access.roomId,
                    guestId: String(access.guest._id),
                    hostId: String(access.host._id)
                })
            } catch (error) {
                callback({ ok: false, message: error.message || "Unable to join chat thread" })
            }
        })

        socket.on("chat:send-message", async (payload = {}, callback = () => {}) => {
            try {
                const text = String(payload.text || "").trim()
                if (!text) {
                    return callback({ ok: false, message: "Message text is required" })
                }

                const access = await resolveChatAccess({
                    listingId: payload.listingId,
                    userId: socket.user._id,
                    guestId: payload.guestId
                })
                const senderRole = access.isHost ? "host" : "guest"
                const message = await createChatMessage({
                    listing: access.listing,
                    host: access.host,
                    guest: access.guest,
                    senderId: socket.user._id,
                    senderRole,
                    text
                })

                const outgoing = {
                    ...serializeMessage(message),
                    senderName: senderRole === "host" ? access.host.name || "Host" : access.guest.name || "Guest"
                }

                io.to(access.roomId).emit("chat:message", outgoing)
                emitThreadUpdated({ io, listingId: access.listing._id, hostId: access.host._id, guestId: access.guest._id })

                if (senderRole === "guest") {
                    scheduleBotReply({ io, listing: access.listing, host: access.host, guest: access.guest })
                }

                callback({ ok: true, message: outgoing })
            } catch (error) {
                callback({ ok: false, message: error.message || "Unable to send chat message" })
            }
        })
    })

    return io
}

export { BOT_NAME }
