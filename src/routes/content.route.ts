import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  createContent,
  deleteContent,
  getContent,
  getDocument,
  getLinks,
  getTags,
  getTweet,
  getYoutube,
} from "../controllers/content.controller.js";

const router = express.Router();

router.post("/create-content", authMiddleware, createContent);

router.get("/delete-content/:contentId", authMiddleware, deleteContent);

// router.post('/update-content',authMiddleware,)

router.get("/get-tweet", authMiddleware, getTweet);

router.get("/get-document", authMiddleware, getDocument);

router.get("/get-link", authMiddleware, getLinks);

router.get("/get-youtube", authMiddleware, getYoutube);

router.get("/", authMiddleware, getContent);

router.get("/tags", authMiddleware, getTags);

export default router;
