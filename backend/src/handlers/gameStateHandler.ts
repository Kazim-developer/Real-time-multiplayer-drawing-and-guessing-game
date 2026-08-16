import type { Socket } from "socket.io";
import { getGameState } from "../game/gameState.js";
import { getOfferedWords, getSelectedWord } from "../game/wordManager.js";

export async function gameStateHandler(socket: Socket) {
  const gameState = await getGameState();

  const currentDrawerId = gameState.currentDrawerId ?? "";
  const currentRound = Number(gameState.round ?? 0);
  const status = gameState.status ?? "waiting";
  const drawerName = gameState.drawerName ?? "";
  const endsAt = Number(gameState.endsAt ?? 0);

  socket.emit("game:drawer", {
    socketId: currentDrawerId,
  });

  socket.emit("round:started", {
    round: currentRound,
  });

  if (status === "choosing" && socket.id === currentDrawerId) {
    const words = getOfferedWords();

    socket.emit("word:options", words);
  }

  if (status === "choosing" && socket.id !== currentDrawerId) {
    socket.emit("choosing:started", {
      drawerName,
    });
  }

  if (status === "drawing") {
    const selectedWord = getSelectedWord();

    if (selectedWord) {
      if (socket.id === currentDrawerId) {
        socket.emit("word:selected", {
          word: selectedWord,
        });
      } else {
        socket.emit("word:length", {
          length: selectedWord.length,
        });
      }
    }
  }

  if (status === "drawing") {
    socket.emit("turn:started", {
      drawerId: currentDrawerId,
      endsAt,
    });
  }
}
