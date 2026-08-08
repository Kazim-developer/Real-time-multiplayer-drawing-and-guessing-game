import express from "express";
import { Server } from "socket.io";
import dotenv from "dotenv";

const app = express();

dotenv.config();

const expressServer = app.listen(5000, () => {
  console.log("Backend running on port 5000");
});

const io = new Server(expressServer, {
  cors: {
    origin: process.env.CLIENT_ENDPOINT,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  const username = socket.handshake.auth.username;

  console.log("User connected:", username);

  socket.emit("join-success", {
    username,
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", username);
  });
});
