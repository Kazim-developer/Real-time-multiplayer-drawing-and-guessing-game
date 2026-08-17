"use client";

import useShowElementStore from "@/stores/showElements.store";
import ModalContainer from "./ModalContainer";
import { socket } from "@/lib/socket";
import LineDivider from "./LineDivider";
import { useState } from "react";

export default function WordSelectionModal({
  words,
  setWord,
}: {
  words: string[];
  setWord: (value: string) => void;
}) {
  const setShowWordSelectionModal = useShowElementStore(
    (s) => s.setShowWordSelectionModal,
  );

  const [inputWord, setInputWord] = useState<string>("");

  return (
    <ModalContainer>
      <div className="w-[50%] max-w-[500px] rounded-2xl border border-[#ECEDF6] bg-white p-6 shadow-[0_2px_6px_rgba(20,20,30,0.04),0_24px_60px_-24px_rgba(91,95,239,0.35)]">
        <h1 className="mb-1 text-center text-2xl font-bold text-[#15151A]">
          Your Turn
        </h1>
        <h1 className="mb-4 text-center text-sm font-medium text-[#93949F]">
          Choose a word
        </h1>

        <div className="mx-auto flex flex-wrap items-center justify-center gap-2">
          {words.map((word) => (
            <button
              key={word}
              className="rounded-full border border-[#E6E7F0] bg-[#FAFAFC] px-5 py-2 text-sm font-semibold text-[#15151A] transition-all hover:-translate-y-0.5 hover:border-[#5B5FEF] hover:bg-[#5B5FEF]/5 hover:text-[#5B5FEF] hover:shadow-[0_8px_20px_-8px_rgba(91,95,239,0.35)] active:scale-95"
              onClick={() => {
                setShowWordSelectionModal(false);
                socket.emit("word:select", word);
                socket.emit("choosing:finished");
              }}
            >
              {word}
            </button>
          ))}
        </div>

        <LineDivider />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setShowWordSelectionModal(false);
            setWord(inputWord);
            socket.emit("word:select", inputWord);
            socket.emit("choosing:finished");
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="Enter a custom word"
            required
            onChange={(e) => setInputWord(e.target.value)}
            className="min-w-0 flex-1 rounded-full border border-[#E6E7F0] bg-[#FAFAFC] px-4 py-2 text-sm text-[#15151A] outline-none transition-colors focus:border-[#5B5FEF] focus:bg-white focus:ring-4 focus:ring-[#5B5FEF]/15"
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-gradient-to-br from-[#6C5CE7] via-[#5B5FEF] to-[#4A5FD1] px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_-8px_rgba(91,95,239,0.55)] transition-transform hover:-translate-y-0.5 active:scale-95"
          >
            Select
          </button>
        </form>
      </div>
    </ModalContainer>
  );
}
