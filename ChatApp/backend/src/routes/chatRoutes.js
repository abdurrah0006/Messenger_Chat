import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  accessChat,
  addMembers,
  createGroup,
  fetchChats,
  markRead,
  removeMember,
  renameGroup,
} from "../controllers/chatController.js";

const router = express.Router();

router.use(protect);

router.route("/").get(fetchChats).post(accessChat);
router.post("/group", createGroup);
router.put("/:id/rename", renameGroup);
router.put("/:id/members", addMembers);
router.delete("/:id/members/:userId", removeMember);
router.put("/:id/read", markRead);

export default router;
