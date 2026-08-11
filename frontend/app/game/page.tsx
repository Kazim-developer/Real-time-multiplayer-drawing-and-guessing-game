"use client";

import DrawingBoard from "@/components/DrawingBoard";
import PlayerList from "@/components/PlayerList";
import PlayersChat from "@/components/PlayersChat";
import WordSelectionModal from "@/components/WordSelectionModal";
import { socket } from "@/lib/socket";
import { usePlayersStore } from "@/stores/playersList.store";
import useShowElementStore from "@/stores/showElements.store";
import { useEffect, useState } from "react";

export default function GamePage() {
  const drawerId = usePlayersStore((s) => s.drawerId);
  const setDrawerId = usePlayersStore((s) => s.setDrawerId);

  const showWordSelectionModal = useShowElementStore(
    (s) => s.showWordSelectionModal,
  );

  const setShowWordSelectionModal = useShowElementStore(
    (s) => s.setShowWordSelectionModal,
  );

  const [words, setWords] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    const handleDrawer = ({ socketId }: { socketId: string }) => {
      setDrawerId(socketId);
    };

    const handleWords = (words: string[]) => {
      setWords(words);
    };

    socket.on("game:drawer", handleDrawer);

    socket.emit("game:get-state");

    socket.on("word:options", handleWords);

    return () => {
      socket.off("game:drawer", handleDrawer);
    };
  }, []);

  const isDrawer = socket.id === drawerId;

  useEffect(() => {
    setShowWordSelectionModal(isDrawer);
  }, [isDrawer]);

  useEffect(() => {
    const handleTurnStarted = ({ endsAt }: { endsAt: number }) => {
      const updateTimer = () => {
        const remaining = Math.max(0, endsAt - Date.now());

        setTimeLeft(Math.ceil(remaining / 1000));
      };

      updateTimer();

      const interval = setInterval(updateTimer, 100);

      return () => {
        clearInterval(interval);
      };
    };

    socket.on("turn:started", handleTurnStarted);

    return () => {
      socket.off("turn:started", handleTurnStarted);
    };
  }, []);

  return (
    <main className="grid grid-cols-4 gap-4 center-content">
      <div className="col-span-4 p-4 bg-white rounded-md border-1 border-gray-500">
        <div className="flex items-center">
          <div className="timer">
            <h1>Time Left: {timeLeft}</h1>
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
        <PlayerList />
      </div>
      <div className="col-span-2">
        <DrawingBoard isDrawer={isDrawer} />
      </div>
      <div>
        <PlayersChat />
      </div>
      {showWordSelectionModal && <WordSelectionModal words={words} />}
    </main>
  );
}
