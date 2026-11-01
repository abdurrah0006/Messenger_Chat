import bcrypt from "bcryptjs";

import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { httpError } from "../utils/httpError.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

const withToken = (user) => ({ ...publicUser(user), token: generateToken(user._id) });

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body ?? {};

  if (!name?.trim() || !email?.trim() || !password) {
    throw httpError(400, "Name, email and password are required");
  }
  if (name.trim().length > 50) throw httpError(400, "Name is too long");
  if (!EMAIL_PATTERN.test(email.trim())) throw httpError(400, "Enter a valid email");
  if (password.length < 6) {
    throw httpError(400, "Password must be at least 6 characters");
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (await User.exists({ email: normalizedEmail })) {
    throw httpError(409, "An account with this email already exists");
  }

  const user = await User.create({
    name,
    email: normalizedEmail,
    password: await bcrypt.hash(password, 10),
  });

  res.status(201).json(withToken(user));
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) throw httpError(400, "Email and password are required");

  const user = await User.findOne({ email: String(email).trim().toLowerCase() }).select(
    "+password"
  );

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw httpError(401, "Invalid email or password");
  }

  res.json(withToken(user));
};

export const getMe = (req, res) => res.json(publicUser(req.user));
