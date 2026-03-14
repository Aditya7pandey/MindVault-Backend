import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  share,
  sharedValult,
  getShareStatus,
} from "../controllers/share.controller.js";

const router = express.Router();

router.post("/toggle", authMiddleware, share);

router.get("/status", authMiddleware, getShareStatus);

router.get("/:link", sharedValult);

export default router;
