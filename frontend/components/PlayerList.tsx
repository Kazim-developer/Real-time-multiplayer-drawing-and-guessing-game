"use client";

import { useEffect } from "react";
import { socket } from "@/lib/socket";
import PenIcon from "./PenIcon";
import { usePlayersStore } from "@/stores/playersList.store";

export type Player = {
  id: string;
  username: string;
  socketId: string;
  score: number;
};

export default function PlayerList({ round }: { round: number }) {
  const players = usePlayersStore((s) => s.players);
  const setPlayers = usePlayersStore((s) => s.addPlayers);

  const drawerId = usePlayersStore((s) => s.drawerId);

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
    <div className="bg-white border-1 border-gray-500 rounded-md p-4 h-[80vh] max-h-[80vh] overflow-y-auto">
      <h2 className="text-2xl">Round {round} of 3</h2>
      <hr className="my-2 text-gray-300 rounded-md" />
      <h2 className="text-2xl mb-2">Players ({players.length})</h2>

      <div className="flex flex-col gap-2">
        {players.map((player) => (
          <div
            key={player.socketId}
            className="flex items-center gap-5 border-1 border-gray-300 rounded-md p-2"
          >
            <span className="font-bold"># {player.id}</span>
            <div className="flex flex-col items-center">
              <span>{player.username}</span>
              <span>Points: {player.score}</span>
            </div>
            {player.socketId === drawerId && <PenIcon />}
          </div>
        ))}
      </div>
    </div>
  );
}
