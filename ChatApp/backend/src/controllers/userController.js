import User from "../models/User.js";
import { publicUser } from "./authController.js";
import { httpError } from "../utils/httpError.js";
import { USER_FIELDS } from "../utils/chat.js";

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const searchUsers = async (req, res) => {
  const term = String(req.query.search ?? "").trim().slice(0, 50);
  if (!term) return res.json([]);

  const pattern = new RegExp(escapeRegex(term), "i");

  const users = await User.find({
    _id: { $ne: req.user._id },
    $or: [{ name: pattern }, { email: pattern }],
  })
    .select(USER_FIELDS)
    .sort({ name: 1 })
    .limit(20);

  res.json(users);
};

export const updateProfile = async (req, res) => {
  const name = req.body?.name?.trim();

  if (!name) throw httpError(400, "Name is required");
  if (name.length > 50) throw httpError(400, "Name is too long");

  req.user.name = name;
  await req.user.save();

  res.json(publicUser(req.user));
};
