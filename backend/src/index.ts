import express from "express";
import { Server } from "socket.io";
import dotenv from "dotenv";

import { addPlayer, getAllPlayers, removePlayer } from "./redis/playerState.js";

import {
  getTurnEndsAt,
  getCurrentDrawerId,
  getCurrentRound,
  initializeGame,
  resetGameState,
  getGameState,
} from "./game/gameState.js";

import { registerDrawingEvents } from "./sockets/drawingSocket.js";
import { registerGameEvents } from "./sockets/gameSocket.js";

import { tryStartGame } from "./game/gameManager.js";
import { getOfferedWords } from "./game/wordManager.js";

import { redis } from "./redis/client.js";
import { clearDrawingState } from "./game/drawingState.js";
import { clearRoundPlayers } from "./game/playerRound.js";

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

  io.on("connection", async (socket) => {
    const username = socket.handshake.auth.username;

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
      const gameState = await getGameState();

      const currentDrawerId = gameState.currentDrawerId;
      const currentRound = gameState.round;
      const status = gameState.status;
      const choosingDrawerName = gameState.choosingDrawerName;
      const endsAt = gameState.endsAt;

      // Current drawer
      socket.emit("game:drawer", {
        socketId: currentDrawerId,
      });

      // Current round
      socket.emit("round:started", {
        round: Number(currentRound),
      });

      // If I am the drawer, send the available words.
      if (socket.id === currentDrawerId) {
        const words = getOfferedWords();

        socket.emit("word:options", words);
      }

      // If the game is currently in word-selection phase,
      // tell non-drawers who is choosing.
      if (status === "choosing" && socket.id !== currentDrawerId) {
        socket.emit("choosing:started", {
          drawerName: choosingDrawerName,
        });
      }

      // If the turn has already started, restore the timer.
      if (endsAt && status === "drawing") {
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

      if (players.length === 0) {
        await resetGameState();

        await clearRoundPlayers();

        clearDrawingState();

        console.log("All players disconnected. Game reset.");
      }

      io.emit("players:update", players);
    });
  });
}

startServer();
