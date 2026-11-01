import http from "http";

import { env } from "./config/env.js";
import connectDB from "./config/db.js";
import app from "./app.js";
import { initSocket } from "./socket/index.js";

await connectDB();

const server = http.createServer(app);
initSocket(server);

server.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`);
});
