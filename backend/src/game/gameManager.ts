import { Server } from "socket.io";

import {
  getAllPlayers,
  getPlayer,
  resetAllScores,
} from "../redis/playerState.js";

import {
  getGameStatus,
  getCurrentRound,
  getCurrentTurn,
  setCurrentDrawerId,
  setTurn,
  startRound,
  TOTAL_ROUNDS,
  setChoosing,
  clearCorrectGuessers,
  setTurnResult,
  setGameResult,
  clearTurnResults,
  getAllTurnResults,
  getCurrentDrawerId,
} from "./gameState.js";

import {
  createRoundPlayers,
  getNextDrawingPlayer,
  clearRoundPlayers,
} from "./playerRound.js";

import { getSelectedWord, sendWordOptions } from "./wordManager.js";
import { clearDrawingState } from "./drawingState.js";

let turnTimeout: ReturnType<typeof setTimeout> | null = null;

export async function showTurnResult(io: Server) {
  const players = await getAllPlayers();
  const turnResults = await getAllTurnResults();
  const word = getSelectedWord();
  const currentDrawerId = await getCurrentDrawerId();

  const results = players
    .map((player) => ({
      socketId: player.socketId,
      username: player.username,
      points: Number(turnResults[player.socketId] ?? 0),
      totalScore: Number(player.score ?? 0),
    }))
    .sort((a, b) => b.points - a.points);

  io.except(currentDrawerId as string).emit("turn:result", {
    word,
    players: results,
    duration: 5000,
  });
}

export function scheduleTurnEnd(io: Server, endsAt: number) {
  if (turnTimeout) {
    clearTimeout(turnTimeout);
  }

  const delay = Math.max(0, endsAt - Date.now());

  turnTimeout = setTimeout(async () => {
    turnTimeout = null;

    console.log("60-second turn finished.");

    // Show the result board.
    await showTurnResult(io);

    // Keep the result board visible for 5 seconds.
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Start the next turn.
    await startNextTurn(io);
  }, delay);
}

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
  await clearDrawingState();

  await clearTurnResults();

  io.emit("drawing:clear");

  const drawerSocketId = await getNextDrawingPlayer();

  if (!drawerSocketId) {
    await finishCurrentRound(io);
    return;
  }

  await clearCorrectGuessers();

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
    console.log("All rounds completed.");

    await showGameResult(io);

    await new Promise((resolve) => setTimeout(resolve, 5000));

    await resetAllScores();

    await startRound(1);

    io.emit("round:started", {
      round: 1,
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

export async function finishCurrentTurn(io: Server) {
  console.log("Finishing current turn...");

  await setTurnResult();

  const players = await getAllPlayers();

  const results = players
    .map((player) => ({
      socketId: player.socketId,
      username: player.username,
      score: Number(player.score ?? 0),
    }))
    .sort((a, b) => b.score - a.score);

  io.emit("turn:result", {
    players: results,
  });

  await new Promise((resolve) => setTimeout(resolve, 5000));

  const nextDrawer = await getNextDrawingPlayer();

  if (!nextDrawer) {
    await finishCurrentRound(io);
    return;
  }

  await startNextTurn(io);
}

export async function showGameResult(io: Server) {
  const players = await getAllPlayers();

  const results = players
    .map((player) => ({
      socketId: player.socketId,
      username: player.username,
      score: Number(player.score ?? 0),
    }))
    .sort((a, b) => b.score - a.score)
    .map((player, index) => ({
      ...player,
      position: index + 1,
    }));

  io.emit("game:result", {
    players: results,
  });
}
