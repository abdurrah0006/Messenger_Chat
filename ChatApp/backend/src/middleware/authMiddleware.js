import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import User from "../models/User.js";
import { httpError } from "../utils/httpError.js";

const protect = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    throw httpError(401, "Not authorized, no token provided");
  }

  let decoded;
  try {
    decoded = jwt.verify(header.slice(7), env.jwtSecret);
  } catch {
    throw httpError(401, "Not authorized, invalid or expired token");
  }

  const user = await User.findById(decoded.id);
  if (!user) throw httpError(401, "Not authorized, user no longer exists");

  req.user = user;
  next();
};

export default protect;
