import { Server, Socket } from "socket.io";

import { selectWord, getSelectedWord } from "../game/wordManager.js";

import { getCurrentDrawerId, startTurn } from "../game/gameState.js";

export function registerGameEvents(io: Server, socket: Socket) {
  socket.on("word:select", async (word: string) => {
    const drawerId = await getCurrentDrawerId();

    if (socket.id !== drawerId) {
      return;
    }

    const selected = selectWord(word);

    if (!selected) {
      return;
    }

    const { startedAt, endsAt } = await startTurn();

    io.emit("turn:started", {
      drawerId,
      startedAt,
      endsAt,
    });

    console.log("Turn started. Ends at:", new Date(endsAt).toISOString());
  });
}
