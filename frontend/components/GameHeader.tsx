import { Player } from "./PlayerList";

type GameHeaderProps = {
  timeLeft: number;
  players: Player[];
  isDrawer: boolean;
  word: string;
  isChoosing: boolean;
  drawerName: string;
  wordLength: number;
};

export default function GameHeader({
  timeLeft,
  players,
  isDrawer,
  word,
  isChoosing,
  drawerName,
  wordLength,
}: GameHeaderProps) {
  return (
    <div className="col-span-4 rounded-2xl border border-[#ECEDF6] bg-white p-4 shadow-[0_2px_6px_rgba(20,20,30,0.04),0_20px_50px_-24px_rgba(91,95,239,0.25)]">
      <div className="flex items-center gap-4">
        <div className="shrink-0 rounded-full bg-[#5B5FEF]/10 px-4 py-1.5">
          <h1 className="text-sm font-semibold text-[#5B5FEF]">
            Time Left: {timeLeft}
          </h1>
        </div>
        <div className="flex-1 text-center">
          <h1 className="flex items-center justify-center gap-2 text-base font-medium text-[#15151A]">
            {players.length < 2 ? (
              <span className="text-[#93949F]">
                Waiting for 1 more player to start the game
              </span>
            ) : isDrawer ? (
              <>
                <span className="text-[#93949F]">Draw the word:</span>
                <span className="rounded-full bg-[#FF6B6B]/10 px-3 py-1 font-bold text-[#FF6B6B] capitalize">
                  {word}
                </span>
              </>
            ) : isChoosing ? (
              <span className="text-[#93949F]">
                <span className="font-semibold text-[#5B5FEF] capitalize">
                  {drawerName}
                </span>{" "}
                is choosing a word
              </span>
            ) : wordLength > 0 ? (
              <span className="flex items-center gap-1.5">
                <span className="mr-1 text-[#93949F]">Word:</span>
                {Array.from({ length: wordLength }).map((_, i) => (
                  <span
                    key={i}
                    className="flex h-8 w-6 items-center justify-center rounded-md border-b-2 border-[#5B5FEF] bg-[#5B5FEF]/5"
                  />
                ))}
              </span>
            ) : (
              <span className="text-[#93949F]">
                Waiting for word selection...
              </span>
            )}
          </h1>
        </div>
      </div>
    </div>
  );
}
