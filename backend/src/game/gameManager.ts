import { Server } from "socket.io";

import { getAllPlayers } from "../redis/playerState.js";
import { setCurrentDrawerId } from "./gameState.js";

import {
  createRoundPlayers,
  getNextDrawingPlayer,
  clearRoundPlayers,
} from "./playerRound.js";

import { sendWordOptions } from "./wordManager.js";

export async function tryStartGame(io: Server) {
  const players = await getAllPlayers();

  if (players.length < 2) {
    return;
  }

  await clearRoundPlayers();

  await createRoundPlayers();

  const drawerSocketId = await getNextDrawingPlayer();

  if (!drawerSocketId) {
    return;
  }

  await setCurrentDrawerId(drawerSocketId);

  io.emit("game:drawer", {
    socketId: drawerSocketId,
  });

  sendWordOptions(io, drawerSocketId);

  console.log("Game started. Drawer:", drawerSocketId);
}
