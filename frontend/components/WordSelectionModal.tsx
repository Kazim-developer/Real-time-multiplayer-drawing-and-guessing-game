"use client";

import useShowElementStore from "@/stores/showElements.store";
import ModalContainer from "./ModalContainer";
import { socket } from "@/lib/socket";

export default function WordSelectionModal({ words }: { words: string[] }) {
  const setShowWordSelectionModal = useShowElementStore(
    (s) => s.setShowWordSelectionModal,
  );

  console.log(words);

  return (
    <ModalContainer>
      <div className="p-4 rounded-md bg-white">
        <h1 className="text-center mb-2">Choose a word</h1>
        <div className="flex items-center gap-2 mx-auto">
          {words.map((word) => (
            <button
              key={word}
              className="border-2 p-2 border-gray-500 rounded-md cursor-pointer"
              onClick={() => {
                setShowWordSelectionModal(false);
                socket.emit("word:select", word);
              }}
            >
              {word}
            </button>
          ))}
        </div>
      </div>
    </ModalContainer>
  );
}
