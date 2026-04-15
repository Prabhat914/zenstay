import ChatMessage from "../model/chatMessage.model.js";
import Listing from "../model/listing.model.js";
import User from "../model/user.model.js";
import uploadOnCloudinary from "../config/cloudinary.js";

const BOT_REPLY_DELAY_MS = 1200;
const BOT_NAME = "Zenstay Auto Reply";

const buildThreadRoomId = ({ listingId, guestId }) => `chat:${listingId}:${guestId}`;
const buildUserRoomId = (userId) => `user:${userId}`;

const serializeMessage = (message) => ({
    _id: message._id,
    listing: message.listing,
    host: message.host,
    guest: message.guest,
    sender: message.sender,
    senderRole: message.senderRole,
    text: message.text,
    attachmentUrl: message.attachmentUrl || "",
    attachmentName: message.attachmentName || "",
    attachmentMimeType: message.attachmentMimeType || "",
    attachmentSize: message.attachmentSize || 0,
    attachmentKind: message.attachmentKind || "none",
    isBot: Boolean(message.isBot),
    unreadByHost: Boolean(message.unreadByHost),
    unreadByGuest: Boolean(message.unreadByGuest),
    createdAt: message.createdAt,
    updatedAt: message.updatedAt
});

const buildBotReply = ({ listingTitle, hostName }) =>
    `Thanks for messaging about ${listingTitle || "this stay"}. ${hostName ? `${hostName} will get back to you shortly.` : "The host will get back to you shortly."} In the meantime, feel free to ask about check-in, pricing, or amenities.`;

const buildUnreadState = (senderRole) => ({
    unreadByHost: senderRole !== "host",
    unreadByGuest: senderRole !== "guest"
});

const normalizeAttachment = async (file) => {
    if (!file) {
        return {
            attachmentUrl: "",
            attachmentName: "",
            attachmentMimeType: "",
            attachmentSize: 0,
            attachmentKind: "none"
        };
    }

    const uploadedUrl = await uploadOnCloudinary(file);
    const mimeType = String(file.mimetype || "").trim();
    return {
        attachmentUrl: uploadedUrl,
        attachmentName: String(file.originalname || "").trim(),
        attachmentMimeType: mimeType,
        attachmentSize: Number(file.size || 0),
        attachmentKind: mimeType.startsWith("image/") ? "image" : "file"
    };
};

export const emitThreadUpdated = ({ io, listingId, hostId, guestId }) => {
    io.to(buildUserRoomId(hostId)).emit("chat:thread-updated", {
        listingId: String(listingId),
        guestId: String(guestId)
    });
    io.to(buildUserRoomId(guestId)).emit("chat:thread-updated", {
        listingId: String(listingId),
        guestId: String(guestId)
    });
};

export const resolveChatAccess = async ({ listingId, userId, guestId }) => {
    const listing = await Listing.findById(listingId).populate("host", "name");
    if (!listing) {
        throw Object.assign(new Error("Listing not found"), { status: 404 });
    }

    const isHost = String(listing.host?._id || listing.host) === String(userId);
    let resolvedGuestId = guestId;

    if (isHost) {
        if (!resolvedGuestId) {
            throw Object.assign(new Error("Guest is required for host chat access"), { status: 400 });
        }
    } else {
        resolvedGuestId = userId;
    }

    if (String(resolvedGuestId) === String(listing.host?._id || listing.host)) {
        throw Object.assign(new Error("Host cannot open a guest chat with themselves"), { status: 400 });
    }

    const guest = await User.findById(resolvedGuestId).select("name email");
    if (!guest) {
        throw Object.assign(new Error("Guest not found"), { status: 404 });
    }

    const host = await User.findById(listing.host?._id || listing.host).select("name email");
    if (!host) {
        throw Object.assign(new Error("Host not found"), { status: 404 });
    }

    return {
        listing,
        host,
        guest,
        isHost,
        roomId: buildThreadRoomId({ listingId: listing._id, guestId: guest._id })
    };
};

export const markThreadAsRead = async ({ listingId, guestId, viewerRole }) => {
    const filter = { listing: listingId, guest: guestId };
    if (viewerRole === "host") {
        await ChatMessage.updateMany(
            { ...filter, unreadByHost: true, senderRole: { $ne: "host" } },
            { $set: { unreadByHost: false } }
        );
        return;
    }
    await ChatMessage.updateMany(
        { ...filter, unreadByGuest: true, senderRole: { $ne: "guest" } },
        { $set: { unreadByGuest: false } }
    );
};

export const createChatMessage = async ({ listing, host, guest, senderId, senderRole, text, file }) => {
    const attachment = await normalizeAttachment(file);
    const message = await ChatMessage.create({
        listing: listing._id,
        host: host._id,
        guest: guest._id,
        sender: senderId || undefined,
        senderRole,
        text: String(text || "").trim(),
        ...attachment,
        ...buildUnreadState(senderRole),
        isBot: senderRole === "bot"
    });
    return message;
};

export const scheduleBotReply = ({ io, listing, host, guest }) => {
    setTimeout(async () => {
        try {
            const lastMessage = await ChatMessage.findOne({
                listing: listing._id,
                guest: guest._id
            }).sort({ createdAt: -1 });

            if (!lastMessage || lastMessage.senderRole !== "guest") {
                return;
            }

            const recentBotReply = await ChatMessage.findOne({
                listing: listing._id,
                guest: guest._id,
                senderRole: "bot",
                createdAt: { $gte: new Date(Date.now() - 2 * 60 * 1000) }
            });

            if (recentBotReply) {
                return;
            }

            const botMessage = await createChatMessage({
                listing,
                host,
                guest,
                senderId: null,
                senderRole: "bot",
                text: buildBotReply({ listingTitle: listing.title, hostName: host.name })
            });

            const payload = {
                ...serializeMessage(botMessage),
                senderName: BOT_NAME
            };
            io.to(buildThreadRoomId({ listingId: listing._id, guestId: guest._id })).emit("chat:message", payload);
            emitThreadUpdated({ io, listingId: listing._id, hostId: host._id, guestId: guest._id });
        } catch (error) {
            console.error("chat bot reply error", error);
        }
    }, BOT_REPLY_DELAY_MS);
};

export const getHostThreads = async (req, res) => {
    try {
        const { listingId } = req.params;
        const listing = await Listing.findById(listingId).select("host title");
        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }
        if (String(listing.host) !== String(req.userId)) {
            return res.status(403).json({ message: "Only the host can view all chat threads for this listing" });
        }

        const threads = await ChatMessage.aggregate([
            { $match: { listing: listing._id } },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$guest",
                    lastMessage: { $first: "$text" },
                    lastAttachmentKind: { $first: "$attachmentKind" },
                    lastAttachmentName: { $first: "$attachmentName" },
                    lastSenderRole: { $first: "$senderRole" },
                    lastCreatedAt: { $first: "$createdAt" },
                    unreadCount: {
                        $sum: {
                            $cond: [{ $eq: ["$unreadByHost", true] }, 1, 0]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "guest"
                }
            },
            { $unwind: "$guest" },
            {
                $project: {
                    _id: 0,
                    guestId: "$guest._id",
                    guestName: "$guest.name",
                    guestEmail: "$guest.email",
                    lastMessage: 1,
                    lastAttachmentKind: 1,
                    lastAttachmentName: 1,
                    lastSenderRole: 1,
                    lastCreatedAt: 1,
                    unreadCount: 1
                }
            },
            { $sort: { lastCreatedAt: -1 } }
        ]);

        return res.status(200).json(threads);
    } catch (error) {
        return res.status(500).json({ message: `getHostThreads error ${error}` });
    }
};

export const getThreadMessages = async (req, res) => {
    try {
        const { listingId } = req.params;
        const access = await resolveChatAccess({
            listingId,
            userId: req.userId,
            guestId: req.params.guestId || req.query.guestId
        });

        await markThreadAsRead({
            listingId: access.listing._id,
            guestId: access.guest._id,
            viewerRole: access.isHost ? "host" : "guest"
        });

        const messages = await ChatMessage.find({
            listing: access.listing._id,
            guest: access.guest._id
        }).sort({ createdAt: 1 });

        const payload = messages.map((message) => ({
            ...serializeMessage(message),
            senderName: message.senderRole === "bot"
                ? BOT_NAME
                : message.senderRole === "host"
                ? access.host.name || "Host"
                : access.guest.name || "Guest"
        }));

        return res.status(200).json({
            roomId: access.roomId,
            listingId: String(access.listing._id),
            guestId: String(access.guest._id),
            hostId: String(access.host._id),
            hostName: access.host.name || "Host",
            guestName: access.guest.name || "Guest",
            isHost: access.isHost,
            messages: payload
        });
    } catch (error) {
        return res.status(error.status || 500).json({ message: error.message || `getThreadMessages error ${error}` });
    }
};

export const postChatMessage = async (req, res) => {
    try {
        const { listingId } = req.params;
        const text = String(req.body?.text || "").trim();
        if (!text && !req.file) {
            return res.status(400).json({ message: "Message text or attachment is required" });
        }

        const access = await resolveChatAccess({
            listingId,
            userId: req.userId,
            guestId: req.body?.guestId
        });

        const senderRole = access.isHost ? "host" : "guest";
        const message = await createChatMessage({
            listing: access.listing,
            host: access.host,
            guest: access.guest,
            senderId: req.userId,
            senderRole,
            text,
            file: req.file
        });

        if (req.app.get("io")) {
            const io = req.app.get("io");
            const payload = {
                ...serializeMessage(message),
                senderName: senderRole === "host" ? access.host.name || "Host" : access.guest.name || "Guest"
            };
            io.to(access.roomId).emit("chat:message", payload);
            emitThreadUpdated({ io, listingId: access.listing._id, hostId: access.host._id, guestId: access.guest._id });
            if (senderRole === "guest") {
                scheduleBotReply({ io, listing: access.listing, host: access.host, guest: access.guest });
            }
        }

        return res.status(201).json({
            ...serializeMessage(message),
            senderName: senderRole === "host" ? access.host.name || "Host" : access.guest.name || "Guest"
        });
    } catch (error) {
        return res.status(error.status || 500).json({ message: error.message || `postChatMessage error ${error}` });
    }
};

export const getAdminChatMessages = async (req, res) => {
    try {
        const limit = Math.min(Math.max(Number(req.query?.limit || 40), 1), 100);
        const messages = await ChatMessage.find()
            .populate("listing", "title")
            .populate("host", "name email")
            .populate("guest", "name email")
            .populate("sender", "name email")
            .sort({ createdAt: -1 })
            .limit(limit);

        return res.status(200).json(messages.map((message) => ({
            ...serializeMessage(message),
            listingTitle: message.listing?.title || "Listing",
            hostName: message.host?.name || "Host",
            hostEmail: message.host?.email || "",
            guestName: message.guest?.name || "Guest",
            guestEmail: message.guest?.email || "",
            senderName: message.senderRole === "bot" ? BOT_NAME : message.sender?.name || message.senderRole
        })));
    } catch (error) {
        return res.status(500).json({ message: `getAdminChatMessages error ${error}` });
    }
};

export const deleteChatMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await ChatMessage.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: "Chat message not found" });
        }
        return res.status(200).json({ message: "Chat message deleted" });
    } catch (error) {
        return res.status(500).json({ message: `deleteChatMessage error ${error}` });
    }
};

export { buildThreadRoomId, buildUserRoomId, BOT_NAME, serializeMessage };
