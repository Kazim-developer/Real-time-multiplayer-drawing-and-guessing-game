import type { Server, Socket } from "socket.io";
import {
  addPlayer,
  getAllPlayers,
  removePlayer,
} from "../redis/playerState.js";
import { tryStartGame } from "../game/gameManager.js";
import { registerDrawingEvents } from "../sockets/drawingSocket.js";
import { registerGameEvents } from "../sockets/gameSocket.js";
import { getGameState, resetGameState } from "../game/gameState.js";
import { getOfferedWords, getSelectedWord } from "../game/wordManager.js";
import { clearDrawingState } from "../game/drawingState.js";
import { clearRoundPlayers } from "../game/playerRound.js";

import { redis } from "../redis/client.js";

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

  socket.on("game:get-state", async () => {
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
  });

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
