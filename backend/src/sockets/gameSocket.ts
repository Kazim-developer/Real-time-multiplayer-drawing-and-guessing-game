import { Server, Socket } from "socket.io";

import { isCorrectWord, selectWord } from "../game/wordManager.js";

import {
  addCorrectGuesser,
  finishChoosing,
  getCurrentDrawerId,
  getTurnEndsAt,
  hasCorrectlyGuessed,
  setTurnPoints,
  startTurn,
} from "../game/gameState.js";
import { addScore, getAllPlayers, getPlayer } from "../redis/playerState.js";
import { scheduleTurnEnd } from "../game/gameManager.js";

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

    scheduleTurnEnd(io, endsAt);
  });

  socket.on("guess:submit", async ({ guess }: { guess: string }) => {
    const currentDrawerId = await getCurrentDrawerId();
    const endsAt = Number(await getTurnEndsAt());

    if (socket.id === currentDrawerId) {
      return;
    }

    if (!endsAt || Date.now() >= endsAt) {
      return;
    }

    const player = await getPlayer(socket.id);

    if (!player.username) {
      return;
    }

    const alreadyGuessed = await hasCorrectlyGuessed(socket.id);

    if (alreadyGuessed) {
      return;
    }

    const correct = isCorrectWord(guess);

    if (!correct) {
      io.emit("guess:message", {
        username: player.username,
        message: guess,
        correct: false,
        socketId: socket.id,
        points: 0,
      });

      return;
    }

    await addCorrectGuesser(socket.id);

    const remainingTime = Math.max(0, endsAt - Date.now());

    const remainingSeconds = remainingTime / 1000;

    const points = Math.max(1, Math.ceil((remainingSeconds / 60) * 100));

    const newScore = await addScore(socket.id, points);

    await setTurnPoints(socket.id, points);

    io.emit("guess:message", {
      username: player.username,
      message: `${player.username} guessed correctly`,
      correct: true,
      socketId: socket.id,
      points,
    });

    const players = await getAllPlayers();

    io.emit("players:update", players);

    io.emit("player:score", {
      socketId: socket.id,
      score: newScore,
      points,
    });

    console.log(`${player.username} guessed correctly.`);

    console.log(`Time remaining: ${remainingSeconds.toFixed(2)}s`);

    console.log(`Points awarded: ${points}`);
  });

  socket.on("choosing:finished", () => {
    socket.broadcast.emit("choosing:finished");
  });
}
