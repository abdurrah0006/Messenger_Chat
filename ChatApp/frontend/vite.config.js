import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In development the API and websocket are proxied to the backend,
// so the frontend never needs to know the backend URL.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:5000",
      "/socket.io": { target: "http://localhost:5000", ws: true },
    },
  },
});
