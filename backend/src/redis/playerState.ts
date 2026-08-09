import { redis } from "./client.js";

export const PLAYER_KEY = (socketId: string) => `game:player:${socketId}`;

export async function addPlayer(socketId: string, username: string) {
  const id = await redis.incr("player:id");

  await redis.hset(PLAYER_KEY(socketId), {
    id,
    socketId,
    username,
    score: 0,
  });

  return id;
}

export async function removePlayer(socketId: string) {
  await redis.del(PLAYER_KEY(socketId));
}

export async function getPlayer(socketId: string) {
  return await redis.hgetall(PLAYER_KEY(socketId));
}

export async function getAllPlayers() {
  const players = [];

  let cursor = "0";

  do {
    const [nextCursor, keys] = await redis.scan(
      cursor,
      "MATCH",
      "game:player:*",
    );

    cursor = nextCursor;

    for (const key of keys) {
      const player = await redis.hgetall(key);

      if (Object.keys(player).length > 0) {
        players.push(player);
      }
    }
  } while (cursor !== "0");

  return players;
}

export async function totalPlayers() {
  let count = 0;
  let cursor = "0";

  do {
    const [nextCursor, keys] = await redis.scan(
      cursor,
      "MATCH",
      "game:player:*",
    );

    cursor = nextCursor;
    count += keys.length;
  } while (cursor !== "0");

  return count;
}
