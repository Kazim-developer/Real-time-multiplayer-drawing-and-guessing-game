import { redis } from "../redis/client.js";
import { getAllPlayers, PLAYER_KEY } from "../redis/playerState.js";

const ROUND_PLAYERS_KEY = "game:round:players";

export async function createRoundPlayers() {
  const players = await getAllPlayers();

  await redis.del(ROUND_PLAYERS_KEY);

  if (players.length > 0) {
    for (const player of players) {
      await redis.rpush(ROUND_PLAYERS_KEY, player.socketId);
    }
  }
}

export async function removeCurrentDrawingPlayer(socketId: string) {
  await redis.lrem(ROUND_PLAYERS_KEY, 1, socketId);
}

export async function getNextDrawingPlayer() {
  const playerSocketId = await redis.lpop(ROUND_PLAYERS_KEY);

  return playerSocketId;
}
