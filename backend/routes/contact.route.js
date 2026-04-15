import express from "express";
import { deleteContactMessage, getContactMessages, submitContactForm } from "../controllers/contact.controller.js";
import isAuth from "../middleware/isAuth.js";
import isAdmin from "../middleware/isAdmin.js";

const contactRouter = express.Router();

contactRouter.post("/", submitContactForm);
contactRouter.get("/admin/messages", isAuth, isAdmin, getContactMessages);
contactRouter.delete("/admin/messages/:id", isAuth, isAdmin, deleteContactMessage);

export default contactRouter;
