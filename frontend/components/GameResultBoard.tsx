"use client";

type GameResultPlayer = {
  socketId: string;
  username: string;
  score: number;
  position: number;
};

type GameResultBoardProps = {
  players: GameResultPlayer[];
};

const medals = ["🥇", "🥈", "🥉"];

export default function GameResultBoard({ players }: GameResultBoardProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex max-h-[600px] w-[90%] max-w-[600px] flex-col rounded-3xl border border-[#ECEDF6] bg-white p-6 shadow-[0_24px_80px_-20px_rgba(20,20,30,0.35)]">
        <div className="mb-6 shrink-0 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#93949F]">
            Game Complete
          </p>

          <h2 className="my-3 text-3xl font-bold text-[#15151A]">
            Final Results
          </h2>

          <h2 className="text-center text-lg text-[#93949F]">
            This dialogue will be closed automatically
          </h2>
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto pr-1">
          {players.map((player) => (
            <div
              key={player.socketId}
              className={`flex items-center justify-between rounded-2xl border px-4 py-4 ${
                player.position === 1
                  ? "border-[#FFC24B] bg-[#FFF9E8]"
                  : "border-[#ECEDF6] bg-[#FAFAFC]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 text-center text-xl">
                  {medals[player.position - 1] ?? `#${player.position}`}
                </span>

                <span className="font-semibold text-[#15151A]">
                  {player.username}
                </span>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold text-[#5B5FEF]">
                  {player.score}
                </div>

                <div className="text-xs text-[#93949F]">points</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
