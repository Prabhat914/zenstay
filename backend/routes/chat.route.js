import express from "express";
import isAuth from "../middleware/isAuth.js";
import upload from "../middleware/multer.js";
import isAdmin from "../middleware/isAdmin.js";
import { deleteChatMessage, getAdminChatMessages, getHostThreads, getThreadMessages, postChatMessage } from "../controllers/chat.controller.js";

const chatRouter = express.Router();

chatRouter.get("/listing/:listingId/threads", isAuth, getHostThreads);
chatRouter.get("/listing/:listingId/thread", isAuth, getThreadMessages);
chatRouter.get("/listing/:listingId/thread/:guestId", isAuth, getThreadMessages);
chatRouter.post("/listing/:listingId/message", isAuth, upload.single("file"), postChatMessage);
chatRouter.get("/admin/messages", isAuth, isAdmin, getAdminChatMessages);
chatRouter.delete("/admin/messages/:id", isAuth, isAdmin, deleteChatMessage);

export default chatRouter;
