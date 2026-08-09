import { redis } from "../redis/client.js";

const GAME_STATE_KEY = "game:state";

export async function initializeGame() {
  const exists = await redis.exists(GAME_STATE_KEY);

  if (!exists) {
    await redis.hset(GAME_STATE_KEY, {
      status: "waiting",
      round: 0,
      turnEndsAt: 0,
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

export async function getCurrentDrawerId() {
  return await redis.hget(GAME_STATE_KEY, "currentDrawerId");
}

export async function getCurrentRound() {
  return await redis.hget(GAME_STATE_KEY, "round");
}

export async function getTurnEndsAt() {
  return await redis.hget(GAME_STATE_KEY, "turnEndsAt");
}
