"use client";

import DrawingBoard from "@/components/DrawingBoard";
import GameHeader from "@/components/GameHeader";
import GameResultBoard from "@/components/GameResultBoard";
import PlayerList from "@/components/PlayerList";
import PlayersChat from "@/components/PlayersChat";
import TurnResultBoard from "@/components/TurnResultBoard";
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

  const [turnResult, setTurnResult] = useState<{
    word: string;
    players: {
      socketId: string;
      username: string;
      points: number;
      totalScore: number;
    }[];
  } | null>(null);

  const [gameResult, setGameResult] = useState<{
    players: {
      socketId: string;
      username: string;
      score: number;
      position: number;
    }[];
  } | null>(null);

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
      setWords(words);
    };

    const handleRound = ({ round }: { round: number }) => {
      setCurrentRound(round);
      setGameResult(null);
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

    const handleTurnResult = ({
      word,
      players,
      duration,
    }: {
      word: string;
      players: {
        socketId: string;
        username: string;
        points: number;
        totalScore: number;
      }[];
      duration: number;
    }) => {
      setTurnResult({
        word,
        players,
      });

      setTimeout(() => {
        setTurnResult(null);
      }, duration);
    };

    const handleGameResult = ({
      players,
    }: {
      players: {
        socketId: string;
        username: string;
        score: number;
        position: number;
      }[];
    }) => {
      setGameResult({
        players,
      });
    };

    const handleTurnStarted = ({ endsAt }: { endsAt: number }) => {
      setTurnResult(null);

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
    socket.on("turn:result", handleTurnResult);
    socket.on("game:result", handleGameResult);

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

      socket.off("turn:result", handleTurnResult);
      socket.off("game:result", handleGameResult);

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
        <GameHeader
          isChoosing={isChoosing}
          isDrawer={isDrawer}
          drawerName={drawerName}
          word={word}
          wordLength={wordLength}
          players={players}
          timeLeft={timeLeft}
        />
        <div>
          <PlayerList round={currentRound} />
        </div>
        <div className="col-span-2">
          <DrawingBoard isDrawer={isDrawer} />
        </div>
        <div>
          <PlayersChat />
        </div>
        {showWordSelectionModal && (
          <WordSelectionModal words={words} setWord={setWord} />
        )}
        {turnResult && (
          <TurnResultBoard
            word={turnResult.word}
            players={turnResult.players}
          />
        )}

        {gameResult && <GameResultBoard players={gameResult.players} />}
      </div>
    </main>
  );
}
