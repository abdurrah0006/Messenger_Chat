import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const generateToken = (id) =>
  jwt.sign({ id }, env.jwtSecret, { expiresIn: "30d" });

export default generateToken;
