import express from "express";
import { getAllLegalPages, getLegalPageBySlug } from "../controllers/legal.controller.js";

const legalRouter = express.Router();

legalRouter.get("/", getAllLegalPages);
legalRouter.get("/:slug", getLegalPageBySlug);

export default legalRouter;

