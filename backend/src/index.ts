// Node 18 polyfill: MongoDB driver requires globalThis.crypto
import { webcrypto } from "crypto";
if (!globalThis.crypto) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).crypto = webcrypto;
}
import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { initSocket } from "./socket/initSocket";

import { connectDB } from "./db";
import authRoutes from "./routes/authRoutes";
import matchRoutes from "./routes/matchRoutes";

const app = express();
const httpServer = createServer(app);

const io = initSocket(httpServer);

app.use(
  cors({
    origin: process.env["CLIENT_URL"] ?? "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/matches", matchRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const PORT = Number(process.env["PORT"] ?? 5000);

connectDB().then(() => {
  httpServer.listen(PORT, () =>
    console.log(`🚀 Server running on http://localhost:${PORT}`),
  );
});
