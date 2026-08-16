"use client";

type TurnResultPlayer = {
  socketId: string;
  username: string;
  points: number;
  totalScore: number;
};

type TurnResultBoardProps = {
  word: string;
  players: TurnResultPlayer[];
};

export default function TurnResultBoard({
  word,
  players,
}: TurnResultBoardProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-[90%] max-w-[600px] rounded-3xl border border-[#ECEDF6] bg-white p-6 shadow-[0_24px_80px_-20px_rgba(20,20,30,0.35)]">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#93949F]">
            Turn Complete
          </p>

          <h2 className="mt-1 text-3xl">
            <span className="text-[#93949F]">Answer is: </span>
            <span className="font-bold capitialize">{word}</span>
          </h2>

          <h2 className="text-[#93949F] text-lg text-center">
            This dialogue will close automatically
          </h2>
        </div>

        <div className="flex flex-col gap-2">
          {players.map((player, index) => (
            <div
              key={player.socketId}
              className="flex items-center justify-between rounded-xl border border-[#ECEDF6] bg-[#FAFAFC] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-center font-bold text-[#93949F]">
                  {index + 1}
                </span>

                <span className="font-semibold text-[#15151A] capitialize">
                  {player.username}
                </span>
              </div>

              <div className="text-right">
                <div className="font-bold text-[#5B5FEF]">+{player.points}</div>

                <div className="text-xs text-[#93949F]">
                  {player.totalScore} total
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
