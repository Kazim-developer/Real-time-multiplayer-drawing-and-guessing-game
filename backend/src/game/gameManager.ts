import { Server } from "socket.io";

import { getAllPlayers, getPlayer } from "../redis/playerState.js";

import {
  getGameStatus,
  getCurrentRound,
  getCurrentTurn,
  setCurrentDrawerId,
  setTurn,
  startRound,
  TOTAL_ROUNDS,
  setChoosing,
} from "./gameState.js";

import {
  createRoundPlayers,
  getNextDrawingPlayer,
  clearRoundPlayers,
} from "./playerRound.js";

import { sendWordOptions } from "./wordManager.js";

export async function tryStartGame(io: Server) {
  const status = await getGameStatus();

  if (status !== "waiting") {
    return;
  }

  const players = await getAllPlayers();

  if (players.length < 2) {
    return;
  }

  await startRound(1);

  io.emit("round:started", {
    round: 1,
  });

  await clearRoundPlayers();

  await createRoundPlayers();

  await startNextTurn(io);
}

export async function startNextTurn(io: Server) {
  const drawerSocketId = await getNextDrawingPlayer();

  if (!drawerSocketId) {
    await finishCurrentRound(io);
    return;
  }

  const currentTurn = Number(await getCurrentTurn()) || 0;

  await setTurn(currentTurn + 1);
  await setCurrentDrawerId(drawerSocketId);

  const drawer = await getPlayer(drawerSocketId);

  if (!drawer.username) {
    return;
  }

  await setChoosing(drawer.username);

  io.emit("game:drawer", {
    socketId: drawerSocketId,
  });

  sendWordOptions(io, drawerSocketId);

  io.except(drawerSocketId).emit("choosing:started", {
    drawerName: drawer.username,
  });
}

export async function finishCurrentRound(io: Server) {
  const currentRound = Number(await getCurrentRound());

  if (currentRound >= TOTAL_ROUNDS) {
    const nextRound = 1;

    await startRound(nextRound);

    io.emit("round:started", {
      round: nextRound,
    });

    await clearRoundPlayers();
    await createRoundPlayers();

    await startNextTurn(io);

    return;
  }

  const nextRound = currentRound + 1;

  await startRound(nextRound);

  io.emit("round:started", {
    round: nextRound,
  });

  await clearRoundPlayers();
  await createRoundPlayers();

  await startNextTurn(io);
}
