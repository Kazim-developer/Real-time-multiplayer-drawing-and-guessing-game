"use client";

import useShowElementStore from "@/stores/showElements.store";
import ModalContainer from "./ModalContainer";
import { socket } from "@/lib/socket";
import LineDivider from "./LineDivider";
import { useState } from "react";

export default function WordSelectionModal({ words }: { words: string[] }) {
  const setShowWordSelectionModal = useShowElementStore(
    (s) => s.setShowWordSelectionModal,
  );

  const [inputWord, setInputWord] = useState<string>("");

  return (
    <ModalContainer>
      <div className="p-4 rounded-md bg-white w-[50%] max-w-[500px]">
        <h1 className="text-center mb-2 text-2xl font-bold">Your Turn</h1>
        <h1 className="mb-2 text-xl">Choose a word</h1>

        <div className="flex items-center gap-2 mx-auto">
          {words.map((word) => (
            <button
              key={word}
              className="border-2 p-2 border-gray-500 rounded-md cursor-pointer"
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
            socket.emit("word:select", inputWord);
            socket.emit("choosing:finished");
          }}
        >
          <input
            type="text"
            placeholder="enter a custom word"
            onChange={(e) => setInputWord(e.target.value)}
          />
          <button type="submit">Select</button>
        </form>
      </div>
    </ModalContainer>
  );
}
