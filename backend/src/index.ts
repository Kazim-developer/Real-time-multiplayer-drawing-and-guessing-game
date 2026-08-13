import express from "express";
import { Server } from "socket.io";
import dotenv from "dotenv";

import { addPlayer, getAllPlayers, removePlayer } from "./redis/playerState.js";

import {
  getTurnEndsAt,
  getCurrentDrawerId,
  getCurrentRound,
  initializeGame,
} from "./game/gameState.js";

import { registerDrawingEvents } from "./sockets/drawingSocket.js";
import { registerGameEvents } from "./sockets/gameSocket.js";

import { tryStartGame } from "./game/gameManager.js";
import { getOfferedWords } from "./game/wordManager.js";

import { redis } from "./redis/client.js";

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

    console.log("User connected:", username);

    /*
     * Add player to Redis
     */
    await addPlayer(socket.id, username);

    /*
     * Get updated player list
     */
    const players = await getAllPlayers();

    /*
     * Tell existing players
     * about the new player.
     */
    socket.broadcast.emit("players:update", players);

    /*
     * Tell newly connected player
     * about the current players.
     */
    socket.emit("join-success", {
      username,
      players,
    });

    /*
     * Try to start the game.
     *
     * gameManager itself checks:
     * - game status
     * - minimum 2 players
     */
    await tryStartGame(io);

    /*
     * Player list request
     */
    socket.on("players:get", async () => {
      const players = await getAllPlayers();

      socket.emit("players:update", players);
    });

    /*
     * Register drawing events
     */
    registerDrawingEvents(io, socket);

    /*
     * Register game events
     *
     * Includes:
     * word:select
     */
    registerGameEvents(io, socket);

    /*
     * Send current game state
     * to a newly connected/reconnected client.
     */
    socket.on("game:get-state", async () => {
      const currentDrawerId = await getCurrentDrawerId();

      const endsAt = await getTurnEndsAt();
      const currentRound = await getCurrentRound();

      /*
       * Tell this client
       * who is currently drawing.
       */
      socket.emit("game:drawer", {
        socketId: currentDrawerId,
      });

      socket.emit("round:started", {
        round: Number(currentRound),
      });

      /*
       * Only the drawer
       * receives the word options.
       */
      if (socket.id === currentDrawerId) {
        const words = getOfferedWords();

        socket.emit("word:options", words);
      }

      /*
       * Send current timer state
       * to EVERY player.
       */
      if (endsAt) {
        socket.emit("turn:started", {
          drawerId: currentDrawerId,

          endsAt: Number(endsAt),
        });
      }
    });

    /*
     * Player disconnected
     */
    socket.on("disconnect", async (reason) => {
      console.log("DISCONNECT:", socket.id, username, reason);

      await removePlayer(socket.id);

      console.log("Removed player:", socket.id);

      const players = await getAllPlayers();

      io.emit("players:update", players);
    });
  });
}

startServer();
