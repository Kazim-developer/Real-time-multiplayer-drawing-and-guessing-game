"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

type Player = {
  id: string;
  username: string;
  socketId: string;
  score: number;
};

export default function PlayerList() {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const handlePlayersUpdate = (playersObject: Player[]) => {
      setPlayers(playersObject);
    };

    socket.on("players:update", handlePlayersUpdate);

    socket.emit("players:get");

    return () => {
      socket.off("players:update", handlePlayersUpdate);
    };
  }, []);

  return (
    <div>
      <h2 className="text-2xl">Players</h2>

      {players.map((player) => (
        <div key={player.socketId} className="flex items-center gap-4 border-1">
          <span className="font-bold"># {player.id}</span>
          <div className="flex flex-col items-center">
            <span>{player.username}</span>
            <span>Points: {player.score}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
