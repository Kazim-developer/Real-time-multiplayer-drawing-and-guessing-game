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

  socket.on("game:get-state", async () => {
    const currentDrawerId = await getCurrentDrawerId();

    socket.emit("game:drawer", {
      socketId: currentDrawerId,
    });
  });

  socket.on("disconnect", async () => {
    console.log("User disconnected:", username);

    await removePlayer(socket.id);

    const players = await getAllPlayers();

    io.emit("players:update", players);
  });
});

// socket.on("guess-word", async ({ guess }) => {
//   const word = await redis.get("game:turn:word");

//   if (!word) return;

//   const turnEndsAt = await getTurnEndsAt();

//   const now = Date.now();

//   const remainingTime = Math.max(0, Number(turnEndsAt) - now);

//   const score = Math.floor(100 * (remainingTime / 60000));

//   if (guess.trim().toLowerCase() === word.trim().toLowerCase()) {
//     await redis.hset(PLAYER_KEY(socket.id), { score });
//   }
// });
