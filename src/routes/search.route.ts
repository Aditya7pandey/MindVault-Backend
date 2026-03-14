import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { search } from "../controllers/search.controller.js";

const router = express.Router();

router.post("/ai_search", authMiddleware, search);

export default router;
