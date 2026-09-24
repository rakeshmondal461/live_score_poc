// src/socket.js
import { io } from "socket.io-client";

const URL = process.env.NODE_ENV === "production" 
  ? "https://your-production-server.com" 
  : "http://localhost:5000";

export const socket = io(URL, {
  autoConnect: false, // connect manually when needed
});