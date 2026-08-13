import { Server } from "socket.io";

import { getAllPlayers } from "../redis/playerState.js";

import {
  getGameStatus,
  getCurrentRound,
  getCurrentTurn,
  setCurrentDrawerId,
  setTurn,
  startRound,
  finishGame,
  TOTAL_ROUNDS,
} from "./gameState.js";

import {
  createRoundPlayers,
  getNextDrawingPlayer,
  clearRoundPlayers,
} from "./playerRound.js";

import { sendWordOptions } from "./wordManager.js";

/*
 * Start the game.
 *
 * This should only be called when the game
 * is currently in the "waiting" state.
 */
export async function tryStartGame(io: Server) {
  const status = await getGameStatus();

  // Don't restart an already running game.
  if (status !== "waiting") {
    return;
  }

  const players = await getAllPlayers();

  // Minimum 2 players required.
  if (players.length < 2) {
    return;
  }

  /*
   * Start Round 1.
   */
  await startRound(1);

  /*
   * Create the queue containing every player.
   */
  await clearRoundPlayers();
  await createRoundPlayers();

  /*
   * Start the first turn.
   */
  await startNextTurn(io);

  console.log("Game started.");
}

/*
 * Start the next player's turn.
 *
 * The current player is removed from
 * game:round:players using LPOP.
 */
export async function startNextTurn(io: Server) {
  const drawerSocketId = await getNextDrawingPlayer();

  /*
   * No player left in the queue.
   *
   * This means the current round is finished.
   */
  if (!drawerSocketId) {
    await finishCurrentRound(io);
    return;
  }

  /*
   * Increment turn number.
   */
  const currentTurn = Number(await getCurrentTurn()) || 0;

  await setTurn(currentTurn + 1);

  /*
   * Store current drawer.
   */
  await setCurrentDrawerId(drawerSocketId);

  /*
   * Tell every client who is drawing.
   */
  io.emit("game:drawer", {
    socketId: drawerSocketId,
  });

  /*
   * Generate and send 3 words ONLY
   * to the current drawer.
   */
  sendWordOptions(io, drawerSocketId);

  console.log("Current drawer:", drawerSocketId);
}

/*
 * Finish the current round.
 *
 * If Round 3 has finished, the entire
 * game is finished.
 *
 * Otherwise, create a new round.
 */
export async function finishCurrentRound(io: Server) {
  const currentRound = Number(await getCurrentRound());

  if (currentRound >= TOTAL_ROUNDS) {
    // Reset all player scores here
    // once we implement the score reset function.

    const nextRound = 1;

    await startRound(nextRound);

    await clearRoundPlayers();
    await createRoundPlayers();

    await startNextTurn(io);

    console.log("3 rounds completed. Starting again from Round 1.");

    return;
  }

  const nextRound = currentRound + 1;

  await startRound(nextRound);

  await clearRoundPlayers();
  await createRoundPlayers();

  await startNextTurn(io);

  console.log(`Round ${nextRound} started.`);
}
