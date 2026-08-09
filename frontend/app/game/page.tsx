"use client";

import DrawingBoard from "@/components/DrawingBoard";
import PlayerList from "@/components/PlayerList";
import PlayersChat from "@/components/PlayersChat";

export default function GamePage() {
  return (
    <main className="grid grid-cols-4 gap-2 center-content">
      <div className="">
        <PlayerList />
      </div>
      <div className="col-span-2">
        <DrawingBoard />
      </div>
      <div>
        <PlayersChat />
      </div>
    </main>
  );
}
