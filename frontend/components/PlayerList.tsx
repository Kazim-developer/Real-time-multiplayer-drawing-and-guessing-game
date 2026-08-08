"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

type Player = {
  id: string;
  username: string;
};

export default function PlayerList() {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const handlePlayersUpdate = (playersObject: Record<string, string>) => {
      const playersArray = Object.entries(playersObject).map(
        ([id, username]) => ({
          id,
          username,
        }),
      );

      setPlayers(playersArray);
    };

    socket.on("players:update", handlePlayersUpdate);

    socket.emit("players:get");

    return () => {
      socket.off("players:update", handlePlayersUpdate);
    };
  }, []);

  return (
    <div>
      <h2>Players</h2>

      {players.map((player) => (
        <div key={player.id}>{player.username}</div>
      ))}
    </div>
  );
}
