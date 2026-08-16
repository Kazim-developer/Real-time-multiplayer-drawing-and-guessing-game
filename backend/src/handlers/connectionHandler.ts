import type { Server, Socket } from "socket.io";
import {
  addPlayer,
  getAllPlayers,
  removePlayer,
} from "../redis/playerState.js";
import { tryStartGame } from "../game/gameManager.js";
import { registerDrawingEvents } from "../sockets/drawingSocket.js";
import { registerGameEvents } from "../sockets/gameSocket.js";
import { resetGameState } from "../game/gameState.js";
import { clearDrawingState } from "../game/drawingState.js";
import { clearRoundPlayers } from "../game/playerRound.js";

import { redis } from "../redis/client.js";
import { gameStateHandler } from "./gameStateHandler.js";

export async function connectionHandler(socket: Socket, io: Server) {
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

  socket.on("game:get-state", (socket) => gameStateHandler(socket));

  socket.on("disconnect", async () => {
    await removePlayer(socket.id);

    await redis.decr("player:id");

    const players = await getAllPlayers();

    if (players.length === 0) {
      await resetGameState();

      await clearRoundPlayers();

      clearDrawingState();
    }

    io.emit("players:update", players);
  });
}
