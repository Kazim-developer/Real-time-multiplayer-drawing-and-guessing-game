import express from "express";
import { Server } from "socket.io";
import dotenv from "dotenv";

import { initializeGame } from "./game/gameState.js";
import { connectionHandler } from "./handlers/connectionHandler.js";

const app = express();

dotenv.config();

async function startServer() {
  await initializeGame();

  const expressServer = app.listen(5000, () => {
    console.log("Backend running on port 5000");
  });

  const io = new Server(expressServer, {
    cors: {
      origin: process.env.CLIENT_ENDPOINT,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => connectionHandler(socket, io));
}

startServer();
