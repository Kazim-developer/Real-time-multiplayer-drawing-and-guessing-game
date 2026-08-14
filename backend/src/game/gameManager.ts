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

// export async function tryStartGame(io: Server) {
//   const status = await getGameStatus();

//   if (status !== "waiting") {
//     return;
//   }

//   const players = await getAllPlayers();

//   if (players.length < 2) {
//     return;
//   }

//   await startRound(1);

//   io.emit("round:started", {
//     round: 1,
//   });

//   await clearRoundPlayers();
//   await createRoundPlayers();

//   await startNextTurn(io);

//   console.log("Game started.");
// }

export async function tryStartGame(io: Server) {
  console.log("tryStartGame() called");

  const status = await getGameStatus();

  console.log("Game status:", status);

  if (status !== "waiting") {
    console.log("Game is not waiting. Returning.");
    return;
  }

  const players = await getAllPlayers();

  console.log("Players:", players.length);

  if (players.length < 2) {
    console.log("Not enough players. Returning.");
    return;
  }

  console.log("Starting game...");

  await startRound(1);

  console.log("Round 1 started");

  io.emit("round:started", {
    round: 1,
  });

  await clearRoundPlayers();

  console.log("Round players cleared");

  await createRoundPlayers();

  console.log("Round players created");

  await startNextTurn(io);

  console.log("Game started.");
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

  io.emit("game:drawer", {
    socketId: drawerSocketId,
  });

  sendWordOptions(io, drawerSocketId);

  const drawer = await getPlayer(drawerSocketId);

  if (!drawer) {
    console.error("Drawer not found:", drawerSocketId);
    return;
  }

  await setChoosing(drawer.username as string);

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

    console.log("3 rounds completed. Starting again from Round 1.");

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

  console.log(`Round ${nextRound} started.`);
}
