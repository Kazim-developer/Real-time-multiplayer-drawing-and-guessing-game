import express from "express";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { redis } from "./redis/client.js";
import { addPlayer, getPlayers, removePlayer } from "./redis/gameState.js";

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

  const players = await getPlayers();

  socket.broadcast.emit("players:update", players);

  socket.emit("join-success", {
    username,
    players,
  });

  socket.on("players:get", async () => {
    const players = await getPlayers();

    socket.emit("players:update", players);
  });

  socket.on("disconnect", async () => {
    console.log("User disconnected:", username);

    await removePlayer(socket.id);

    const players = await getPlayers();

    io.emit("players:update", players);
  });
});
