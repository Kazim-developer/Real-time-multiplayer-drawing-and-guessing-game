import { redis } from "../redis/client.js";

const GAME_STATE_KEY = "game:state";

const TURN_DURATION = 60_000;
const TOTAL_ROUNDS = 3;

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
    });
  }
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
  });
}

export async function setTurn(turn: number) {
  await redis.hset(GAME_STATE_KEY, {
    turn,
  });
}

export async function finishGame() {
  await redis.hset(GAME_STATE_KEY, {
    status: "finished",
    currentDrawerId: "",
    startedAt: 0,
    endsAt: 0,
  });
}

export { TOTAL_ROUNDS };
