import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  allMessages,
  deleteMessage,
  sendMessage,
} from "../controllers/messageController.js";

const router = express.Router();

router.use(protect);

router.post("/", sendMessage);
router.get("/:chatId", allMessages);
router.delete("/:id", deleteMessage);

export default router;
