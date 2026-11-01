import express from "express";
import cors from "cors";
import helmet from "helmet";

import { env } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import errorMiddleware, { notFound } from "./middleware/errorMiddleware.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientOrigins, credentials: true }));
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);

app.use(notFound);
app.use(errorMiddleware);

export default app;
