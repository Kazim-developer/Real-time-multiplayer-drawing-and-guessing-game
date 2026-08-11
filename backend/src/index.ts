import express from "express";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { redis } from "./redis/client.js";
import {
  addPlayer,
  getAllPlayers,
  PLAYER_KEY,
  removePlayer,
} from "./redis/playerState.js";
import { getTurnEndsAt } from "./game/gameState.js";
import { registerDrawingEvents } from "./sockets/drawingSocket.js";
import { tryStartGame } from "./game/gameManager.js";
import { getCurrentDrawerId } from "./game/gameState.js";
import { registerGameEvents } from "./sockets/gameSocket.js";
import { getOfferedWords } from "./game/wordManager.js";

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

io.on("connection", async (socket) => {
  const username = socket.handshake.auth.username;

  console.log("User connected:", username);

  await addPlayer(socket.id, username);

  const players = await getAllPlayers();

  socket.broadcast.emit("players:update", players);

  socket.emit("join-success", {
    username,
    players,
  });

  await tryStartGame(io);

  socket.on("players:get", async () => {
    const players = await getAllPlayers();

    socket.emit("players:update", players);
  });

  registerDrawingEvents(io, socket);
  registerGameEvents(io, socket);

  socket.on("game:get-state", async () => {
    const currentDrawerId = await getCurrentDrawerId();
    const endsAt = await getTurnEndsAt();

    socket.emit("game:drawer", {
      socketId: currentDrawerId,
    });

    if (socket.id === currentDrawerId) {
      const words = getOfferedWords();

      socket.emit("word:options", words);
    }

    if (endsAt) {
      socket.emit("turn:started", {
        drawerId: currentDrawerId,
        endsAt: Number(endsAt),
      });
    }
  });

  socket.on("disconnect", async () => {
    console.log("User disconnected:", username);

    await removePlayer(socket.id);

    const players = await getAllPlayers();

    io.emit("players:update", players);
  });
});
