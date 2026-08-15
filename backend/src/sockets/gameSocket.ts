import { Server, Socket } from "socket.io";

import { selectWord } from "../game/wordManager.js";

import {
  finishChoosing,
  getCurrentDrawerId,
  startTurn,
} from "../game/gameState.js";

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

    await finishChoosing();

    socket.emit("word:selected", {
      word,
    });

    socket.broadcast.emit("word:length", {
      length: word.length,
    });

    const { startedAt, endsAt } = await startTurn();

    socket.broadcast.emit("choosing:finished");

    io.emit("turn:started", {
      drawerId,
      startedAt,
      endsAt,
    });
  });

  socket.on("choosing:finished", () => {
    socket.broadcast.emit("choosing:finished");
  });
}
