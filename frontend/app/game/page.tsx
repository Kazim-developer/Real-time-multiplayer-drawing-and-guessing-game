"use client";

import DrawingBoard from "@/components/DrawingBoard";
import PlayerList from "@/components/PlayerList";
import PlayersChat from "@/components/PlayersChat";
import { socket } from "@/lib/socket";
import { useState, useEffect } from "react";

export default function GamePage() {
  const [drawerId, setDrawerId] = useState<string | null>(null);

  useEffect(() => {
    const handleDrawer = ({ socketId }: { socketId: string }) => {
      setDrawerId(socketId);
    };

    socket.on("game:drawer", handleDrawer);

    socket.emit("game:get-state");

    return () => {
      socket.off("game:drawer", handleDrawer);
    };
  }, []);

  const isDrawer = socket.id === drawerId;

  return (
    <main className="grid grid-cols-4 gap-4 center-content">
      <div className="col-span-4 p-4 bg-white rounded-md border-1 border-gray-500">
        <div className="flex items-center">
          <div className="timer">
            <h1>Time Left:</h1>
          </div>
          <div className="mx-auto">
            <h1>
              {isDrawer
                ? "Your turn, draw the word: ${word}"
                : "Watch the drawing, and guess the word"}
            </h1>
          </div>
        </div>
      </div>
      <div className="">
        <PlayerList drawerId={drawerId as string} />
      </div>
      <div className="col-span-2">
        <DrawingBoard isDrawer={isDrawer} />
      </div>
      <div>
        <PlayersChat />
      </div>
    </main>
  );
}
