"use client";

import { useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socket";

type Chat = {
  socketId: string;
  username: string;
  message: string;
};

const AVATAR_COLORS = [
  "#FF6B6B",
  "#FFC24B",
  "#35C4B4",
  "#5B5FEF",
  "#FF8F73",
  "#6C5CE7",
];

const getAvatarColor = (key: string) => {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export default function PlayersChat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [message, setMessage] = useState("");

  const inputRef = useRef<HTMLInputElement | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePlayersChat = (chatObject: Chat) => {
      setChats((previousChats) => [...previousChats, chatObject]);
    };

    socket.on("players:chat", handlePlayersChat);

    return () => {
      socket.off("players:chat", handlePlayersChat);
    };
  }, []);

  useEffect(() => {
    if (!messagesRef.current) return;

    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [chats]);

  const handleSubmit = (e: any) => {
    e.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) return;

    socket.emit("players:chat", {
      message: trimmedMessage,
    });

    setMessage("");
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-[80vh] max-h-[80vh] flex-col rounded-2xl border border-[#ECEDF6] bg-white p-4 shadow-[0_2px_6px_rgba(20,20,30,0.04),0_20px_50px_-24px_rgba(91,95,239,0.25)]">
      <h2 className="mb-3 text-lg font-semibold text-[#15151A]">Chat</h2>

      {/* Messages */}
      <div ref={messagesRef} className="flex-1 overflow-y-auto pr-1">
        <div className="flex flex-col gap-2">
          {chats.map((chat, index) => (
            <div
              key={`${chat.socketId}-${index}`}
              className="rounded-xl border border-[#ECEDF6] bg-[#FAFAFC] p-2.5"
            >
              <div
                className="text-xs font-bold"
                style={{ color: getAvatarColor(chat.socketId) }}
              >
                {chat.username}
              </div>

              <div className="text-sm text-[#15151A]">{chat.message}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="mt-3 flex gap-2 border-t border-[#ECEDF6] pt-3"
      >
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="send guess here ..."
          className="min-w-0 flex-1 rounded-full border border-[#E6E7F0] bg-[#FAFAFC] px-4 py-2 text-sm text-[#15151A] outline-none transition-colors focus:border-[#5B5FEF] focus:bg-white focus:ring-4 focus:ring-[#5B5FEF]/15"
        />
      </form>
    </div>
  );
}
