import type { Server as HttpServer } from "http";
import { Server } from "socket.io";

interface MatchUpdateData {
  roomId: string;
  payload: Record<string, unknown>;
}

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

  // [EVENT] connection
  // Fires when any client (admin or viewer) opens a socket connection.
  // Each connected socket gets a unique socket.id for targeting.
  io.on("connection", (socket) => {
    console.log(`connected: ${socket.id}`);

    // [LISTENER] send:match:update
    // Emitted by the admin client after a successful score update via the REST API.
    // Payload: { roomId: string, payload: { name, sport, teamA, teamB } }
    // Action: Forwards the update only to sockets that have joined that match's room
    //         so viewers on the scoreboard page receive real-time score changes.
    socket.on("send:match:update", (data: MatchUpdateData, ack?: () => void) => {
      const roomid = data.roomId;
      // [EMIT] match-update → broadcast to every socket in the match room
      io.to(roomid).emit("match-update", data);
      if (ack) ack();
    });

    // [LISTENER] join-room
    // Emitted by viewer clients when they open a match scoreboard.
    // Payload: roomId (match _id string)
    // Action: Subscribes this socket to the match-specific room so it receives
    //         targeted "match-update" events instead of global broadcasts.
    socket.on("join-room", (roomId) => {
      console.log("room joined", roomId);
      socket.join(roomId);
    });

    // [EVENT] disconnect
    // Fires automatically when a client closes the tab/loses connection.
    // Socket.IO removes the socket from all rooms it had joined.
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
