import express from "express";
import { rateLimit } from "express-rate-limit";

import protect from "../middleware/authMiddleware.js";
import { env } from "../config/env.js";
import { getMe, loginUser, registerUser } from "../controllers/authController.js";

const router = express.Router();

// Slow down brute-force attempts on credentials
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.isProd ? 30 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again later" },
});

router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.get("/me", protect, getMe);

export default router;
