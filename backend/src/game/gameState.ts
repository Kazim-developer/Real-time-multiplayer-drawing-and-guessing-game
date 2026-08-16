import { redis } from "../redis/client.js";

const GAME_STATE_KEY = "game:state";

const TURN_DURATION = 60_000;
const TOTAL_ROUNDS = 3;
const CORRECT_GUESSERS_KEY = "game:turn:correct";
const TURN_RESULTS_KEY = "game:turn:results";

export async function initializeGame() {
  const exists = await redis.exists(GAME_STATE_KEY);

  if (!exists) {
    await redis.hset(GAME_STATE_KEY, {
      status: "waiting",
      round: 0,
      turn: 0,
      startedAt: 0,
      endsAt: 0,
      currentDrawerId: "",
      drawerName: "",
    });
  }
}

export async function resetGameState() {
  await redis.hset(GAME_STATE_KEY, {
    status: "waiting",
    round: 0,
    turn: 0,
    startedAt: 0,
    endsAt: 0,
    currentDrawerId: "",
    drawerName: "",
  });
}

export async function getGameState() {
  return await redis.hgetall(GAME_STATE_KEY);
}

export async function updateGameState(state: Record<string, string | number>) {
  await redis.hset(GAME_STATE_KEY, state);
}

export async function getGameStatus() {
  return await redis.hget(GAME_STATE_KEY, "status");
}

export async function setCurrentDrawerId(socketId: string) {
  await redis.hset(GAME_STATE_KEY, {
    currentDrawerId: socketId,
  });
}

export async function getCurrentDrawerId() {
  return await redis.hget(GAME_STATE_KEY, "currentDrawerId");
}

export async function getCurrentRound() {
  return await redis.hget(GAME_STATE_KEY, "round");
}

export async function getCurrentTurn() {
  return await redis.hget(GAME_STATE_KEY, "turn");
}

export async function getTurnEndsAt() {
  return await redis.hget(GAME_STATE_KEY, "endsAt");
}

export async function setChoosing(drawerName: string) {
  await redis.hset(GAME_STATE_KEY, {
    status: "choosing",
    drawerName,
    startedAt: 0,
    endsAt: 0,
  });
}

export async function finishChoosing() {
  await redis.hset(GAME_STATE_KEY, {
    status: "drawing",
    drawerName: "",
  });
}

export async function startTurn() {
  const startedAt = Date.now();
  const endsAt = startedAt + TURN_DURATION;

  await redis.hset(GAME_STATE_KEY, {
    startedAt,
    endsAt,
    status: "drawing",
  });

  return {
    startedAt,
    endsAt,
  };
}

export async function startRound(round: number) {
  await redis.hset(GAME_STATE_KEY, {
    status: "round-starting",
    round,
    turn: 0,
    startedAt: 0,
    endsAt: 0,
    drawerName: "",
  });
}

export async function setTurn(turn: number) {
  await redis.hset(GAME_STATE_KEY, {
    turn,
  });
}

export async function hasCorrectlyGuessed(socketId: string) {
  return (await redis.sismember(CORRECT_GUESSERS_KEY, socketId)) === 1;
}

export async function addCorrectGuesser(socketId: string) {
  await redis.sadd(CORRECT_GUESSERS_KEY, socketId);
}

export async function clearCorrectGuessers() {
  await redis.del(CORRECT_GUESSERS_KEY);
}

export async function setTurnResult() {
  await redis.hset(GAME_STATE_KEY, {
    status: "turn-result",
  });
}

export async function setGameResult() {
  await redis.hset(GAME_STATE_KEY, {
    status: "game-result",
  });
}

export async function clearTurnResults() {
  await redis.del(TURN_RESULTS_KEY);
}

export async function setTurnPoints(socketId: string, points: number) {
  await redis.hset(TURN_RESULTS_KEY, {
    [socketId]: points,
  });
}

export async function getTurnPoints(socketId: string) {
  const points = await redis.hget(TURN_RESULTS_KEY, socketId);

  return Number(points ?? 0);
}

export async function getAllTurnResults() {
  return await redis.hgetall(TURN_RESULTS_KEY);
}

export { TOTAL_ROUNDS };
