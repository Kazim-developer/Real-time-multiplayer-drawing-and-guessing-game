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

  const [drawerName, setDrawerName] = useState<string>("");
  const [isChoosing, setIsChoosing] = useState<boolean>(false);

  const [word, setWord] = useState("");
  const [wordLength, setWordLength] = useState(0);

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
    let interval: ReturnType<typeof setInterval> | null = null;

    const handleDrawer = ({ socketId }: { socketId: string }) => {
      setDrawerId(socketId);
    };

    const handleWords = (words: string[]) => {
      console.log("Received words:", words);
      setWords(words);
    };

    const handleRound = ({ round }: { round: number }) => {
      setCurrentRound(round);
    };

    const handleChoosingStarted = ({ drawerName }: { drawerName: string }) => {
      setDrawerName(drawerName);
      setIsChoosing(true);
    };

    const handleChoosingFinished = () => {
      setIsChoosing(false);
    };

    const handleSelectedWord = ({ word }: { word: string }) => {
      setWord(word);
    };

    const handleWordLength = ({ length }: { length: number }) => {
      setWordLength(length);
    };

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

    socket.on("game:drawer", handleDrawer);
    socket.on("word:options", handleWords);
    socket.on("round:started", handleRound);

    socket.on("choosing:started", handleChoosingStarted);
    socket.on("choosing:finished", handleChoosingFinished);

    socket.on("word:selected", handleSelectedWord);
    socket.on("word:length", handleWordLength);

    socket.on("turn:started", handleTurnStarted);

    // IMPORTANT:
    // All listeners are registered before requesting state.
    socket.emit("game:get-state");

    return () => {
      socket.off("game:drawer", handleDrawer);
      socket.off("word:options", handleWords);
      socket.off("round:started", handleRound);

      socket.off("choosing:started", handleChoosingStarted);
      socket.off("choosing:finished", handleChoosingFinished);

      socket.off("word:selected", handleSelectedWord);
      socket.off("word:length", handleWordLength);

      socket.off("turn:started", handleTurnStarted);

      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  const isDrawer = socket.id === drawerId;

  useEffect(() => {
    setShowWordSelectionModal(isDrawer);
  }, [isDrawer, setShowWordSelectionModal]);

  return (
    <main className="min-h-screen bg-[#F6F7FB] p-4">
      <div className="mx-auto grid max-w-7xl grid-cols-4 gap-4">
        <div className="col-span-4 rounded-2xl border border-[#ECEDF6] bg-white p-4 shadow-[0_2px_6px_rgba(20,20,30,0.04),0_20px_50px_-24px_rgba(91,95,239,0.25)]">
          <div className="flex items-center gap-4">
            <div className="shrink-0 rounded-full bg-[#5B5FEF]/10 px-4 py-1.5">
              <h1 className="text-sm font-semibold text-[#5B5FEF]">
                Time Left: {timeLeft}
              </h1>
            </div>
            <div className="flex-1 text-center">
              <h1 className="text-base font-semibold text-[#15151A]">
                {players.length < 2
                  ? "Waiting for 1 more player to start the game"
                  : isDrawer
                    ? `Your turn, draw the word: ${word}`
                    : isChoosing
                      ? `${drawerName} is choosing a word`
                      : `Word: ${"_ ".repeat(wordLength).trim()}`}
              </h1>
            </div>
          </div>
        </div>
        <div>
          <PlayerList round={currentRound} />
        </div>
        <div className="col-span-2">
          <DrawingBoard isDrawer={isDrawer} />
        </div>
        <div>
          <PlayersChat />
        </div>
        {showWordSelectionModal && <WordSelectionModal words={words} />}
      </div>
    </main>
  );
}
