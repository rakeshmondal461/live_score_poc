import type { Server as HttpServer } from "http";
import { Server } from "socket.io";

let io: Server;
export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173", // your frontend origin
      methods: ["GET", "POST"],
    },
  });

  // Optional: auth middleware runs BEFORE 'connection' fires
  // io.use((socket, next) => {
  //   const token = socket.handshake.auth.token;
  //   if (isValidToken(token)) {
  //     socket.data.userId = getUserIdFromToken(token); // attach data to this socket
  //     return next();
  //   }
  //   next(new Error("unauthorized"));
  // });

  io.on("connection", (socket) => {
    console.log(`connected: ${socket.id}`);

    socket.on("send:match:update", (data, ack) => {
      console.log("roomId>>>>>>:", data);
      const roomid = data.roomId;
      io.to(roomid).emit("match-update", data);
    });

    socket.on("join-room", (roomId) => {
      console.log("room joined", roomId);
      socket.join(roomId);
    });

    socket.on("disconnect", (reason) => {
      console.log(`disconnected: ${socket.id}, reason: ${reason}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io not initialized. Call initSocket first.");
  }
  return io;
};
