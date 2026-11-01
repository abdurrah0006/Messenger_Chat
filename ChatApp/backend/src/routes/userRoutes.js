import express from "express";
import protect from "../middleware/authMiddleware.js";
import { searchUsers, updateProfile } from "../controllers/userController.js";

const router = express.Router();

router.use(protect);
router.get("/", searchUsers);
router.put("/me", updateProfile);

export default router;
