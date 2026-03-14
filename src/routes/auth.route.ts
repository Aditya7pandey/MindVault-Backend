import express from "express";
import {
  login,
  logout,
  signup,
  verify,
  googleSignup,
  googleLogin,
} from "../controllers/auth.controller.js";
const router = express.Router();

router.post("/signup", signup);

router.post("/verify", verify);

router.post("/login", login);

router.get("/logout", logout);

router.post("/google-signup", googleSignup);

router.post("/google-login", googleLogin);

export default router;
