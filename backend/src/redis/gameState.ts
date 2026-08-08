import { redis } from "./client.js";

const PLAYERS_KEY = "game:players";

export async function addPlayer(socketId: string, username: string) {
  await redis.hset(PLAYERS_KEY, socketId, username);
}

export async function removePlayer(socketId: string) {
  await redis.hdel(PLAYERS_KEY, socketId);
}

export async function getPlayers() {
  return await redis.hgetall(PLAYERS_KEY);
}
