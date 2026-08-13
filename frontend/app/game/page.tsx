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
  const [currentRound, setCurrentRound] = useState<number>(0);

  const players = usePlayersStore((s) => s.players);

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
      console.log("Received words:", words);
      setWords(words);
    };

    const handleRound = (currentRound: number) => {
      setCurrentRound(currentRound);
    };

    socket.on("game:drawer", handleDrawer);
    socket.on("word:options", handleWords);

    socket.emit("current:round");

    socket.on("current:round", handleRound);

    // Request state only AFTER listeners exist
    socket.emit("game:get-state");

    return () => {
      socket.off("game:drawer", handleDrawer);
      socket.off("word:options", handleWords);
    };
  }, []);

  const isDrawer = socket.id === drawerId;

  useEffect(() => {
    setShowWordSelectionModal(isDrawer);
  }, [isDrawer]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    const handleTurnStarted = ({ endsAt }: { endsAt: number }) => {
      if (interval) {
        clearInterval(interval);
      }

      const updateTimer = () => {
        const remaining = Math.max(0, endsAt - Date.now());

        setTimeLeft(Math.ceil(remaining / 1000));

        if (remaining <= 0 && interval) {
          clearInterval(interval);
          interval = null;
        }
      };

      updateTimer();

      interval = setInterval(updateTimer, 100);
    };

    socket.on("turn:started", handleTurnStarted);

    socket.emit("game:get-state");

    return () => {
      socket.off("turn:started", handleTurnStarted);

      if (interval) {
        clearInterval(interval);
      }
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
              {players.length < 2
                ? "Waiting for 1 more player to start the game"
                : isDrawer
                  ? "Your turn, draw the word: ${word}"
                  : "Watch the drawing, and guess the word"}
            </h1>
          </div>
        </div>
      </div>
      <div className="">
        <PlayerList round={currentRound} />
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
