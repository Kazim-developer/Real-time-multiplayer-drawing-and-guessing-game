import { Server, Socket } from "socket.io";

import { selectWord, getSelectedWord } from "../game/wordManager.js";

import { getCurrentDrawerId, startTurn } from "../game/gameState.js";

export function registerGameEvents(io: Server, socket: Socket) {
  socket.on("word:select", async (word: string) => {
    const drawerId = await getCurrentDrawerId();

    // Make sure only the current drawer can select
    if (socket.id !== drawerId) {
      return;
    }

    // Make sure the word was one of the 3 offered words
    const selected = selectWord(word);

    if (!selected) {
      return;
    }

    // Start the 60-second turn
    const { startedAt, endsAt } = await startTurn();

    // Tell EVERY player that the turn has started
    io.emit("turn:started", {
      drawerId,
      startedAt,
      endsAt,
    });

    console.log("Turn started. Ends at:", new Date(endsAt).toISOString());
  });
}
