import { Server, Socket } from "socket.io";
import { redis } from "../redis/client.js";
import { words } from "./words.js";

export async function startTurn(io: Server, drawerSocket: Socket) {
  const word = words[Math.floor(Math.random() * words.length)];

  await redis.set("game:turn:word", word);

  drawerSocket.emit("word-selected", {
    word,
  });
}
