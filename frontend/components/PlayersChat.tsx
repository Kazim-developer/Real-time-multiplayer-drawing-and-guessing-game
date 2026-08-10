"use client";

import { useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socket";

type Chat = {
  socketId: string;
  username: string;
  message: string;
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
    <div className="flex h-[80vh] max-h-[80vh] flex-col rounded-md border border-gray-500 bg-white p-4">
      <h2 className="mb-3 text-2xl font-semibold">Chat</h2>

      {/* Messages */}
      <div ref={messagesRef} className="flex-1 overflow-y-auto pr-2">
        <div className="flex flex-col gap-2">
          {chats.map((chat, index) => (
            <div
              key={`${chat.socketId}-${index}`}
              className="rounded-md border border-gray-200 p-2"
            >
              <div className="text-sm font-bold">{chat.username}</div>

              <div className="text-sm text-gray-700">{chat.message}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="mt-3 flex gap-2 border-t border-gray-200 pt-3"
      >
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="send guess here ..."
          className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-black"
        />
      </form>
    </div>
  );
}
