import express from "express";
import { getAllLegalPages, getLegalPageBySlug, updateLegalPage } from "../controllers/legal.controller.js";
import isAuth from "../middleware/isAuth.js";
import isAdmin from "../middleware/isAdmin.js";

const legalRouter = express.Router();

legalRouter.get("/", getAllLegalPages);
legalRouter.get("/:slug", getLegalPageBySlug);
legalRouter.put("/:slug", isAuth, isAdmin, updateLegalPage);

export default legalRouter;
