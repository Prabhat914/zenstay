import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
    {
        listing: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Listing",
            required: true,
            index: true
        },
        host: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        guest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        senderRole: {
            type: String,
            enum: ["guest", "host", "bot"],
            required: true
        },
        text: {
            type: String,
            trim: true
        },
        attachmentUrl: {
            type: String,
            default: ""
        },
        attachmentName: {
            type: String,
            default: ""
        },
        attachmentMimeType: {
            type: String,
            default: ""
        },
        attachmentSize: {
            type: Number,
            default: 0
        },
        attachmentKind: {
            type: String,
            enum: ["none", "image", "file"],
            default: "none"
        },
        isBot: {
            type: Boolean,
            default: false
        },
        unreadByHost: {
            type: Boolean,
            default: false
        },
        unreadByGuest: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

chatMessageSchema.index({ listing: 1, guest: 1, createdAt: 1 });
chatMessageSchema.index({ host: 1, unreadByHost: 1, createdAt: -1 });
chatMessageSchema.index({ guest: 1, unreadByGuest: 1, createdAt: -1 });

chatMessageSchema.pre("validate", function (next) {
    if (!String(this.text || "").trim() && !String(this.attachmentUrl || "").trim()) {
        this.invalidate("text", "Message text or attachment is required")
    }
    next()
})

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

export default ChatMessage;
