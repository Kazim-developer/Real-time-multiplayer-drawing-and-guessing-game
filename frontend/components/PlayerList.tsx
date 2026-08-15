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

const AVATAR_COLORS = [
  "#FF6B6B",
  "#FFC24B",
  "#35C4B4",
  "#5B5FEF",
  "#FF8F73",
  "#6C5CE7",
];

const getAvatarColor = (key: string) => {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
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
    <div className="flex h-[80vh] max-h-[80vh] flex-col overflow-y-auto rounded-2xl border border-[#ECEDF6] bg-white p-4 shadow-[0_2px_6px_rgba(20,20,30,0.04),0_20px_50px_-24px_rgba(91,95,239,0.25)]">
      <span className="text-xs font-semibold uppercase tracking-wide text-[#93949F]">
        Round {round} of 3
      </span>
      <hr className="my-3 border-[#ECEDF6]" />
      <h2 className="mb-3 text-lg font-semibold text-[#15151A]">
        Players ({players.length})
      </h2>

      <div className="flex flex-col gap-2">
        {players.map((player) => {
          const isDrawerPlayer = player.socketId === drawerId;

          return (
            <div
              key={player.socketId}
              className={`flex items-center gap-3 rounded-xl border p-2.5 transition-colors ${
                isDrawerPlayer
                  ? "border-[#5B5FEF]/30 bg-[#5B5FEF]/5"
                  : "border-[#ECEDF6] bg-[#FAFAFC]"
              }`}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: getAvatarColor(player.socketId) }}
              />
              <span className="text-sm font-bold text-[#15151A]">
                # {player.id}
              </span>
              <div className="flex flex-1 flex-col">
                <span className="text-sm font-medium text-[#15151A] capitalize">
                  {player.username}
                </span>
                <span className="text-xs text-[#93949F]">
                  Points: {player.score}
                </span>
              </div>
              {isDrawerPlayer && <PenIcon />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
