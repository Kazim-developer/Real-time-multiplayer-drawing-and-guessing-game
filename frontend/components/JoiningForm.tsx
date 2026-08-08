"use client";

import { useEffect, useRef } from "react";
import { socket } from "@/lib/socket";
import { useRouter } from "next/navigation";

export default function JoiningForm() {
  const nameRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  useEffect(() => {
    nameRef.current?.focus();

    const handleJoinSuccess = () => {
      router.push("/game");
    };

    socket.on("join-success", handleJoinSuccess);

    return () => {
      socket.off("join-success", handleJoinSuccess);
    };
  }, [router]);

  const handleJoining = (e: any) => {
    e.preventDefault();

    const username = nameRef.current?.value.trim();
    if (!username) return;

    socket.auth = {
      username,
    };
    socket.connect();
  };

  return (
    <div
      className="h-[100vh] w-[100%] flex justify-center items-center px-4"
      style={{ background: "#F7F7F5" }}
    >
      <div style={{ width: "100%", maxWidth: 360 }}>
        <form onSubmit={handleJoining}>
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #EBEBE8",
              borderRadius: 20,
              padding: "40px 32px",
              boxShadow:
                "0 2px 2px rgba(0,0,0,0.03), 0 12px 32px -12px rgba(0,0,0,0.08)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <h1
              style={{
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: "-0.01em",
                color: "#1C1C1E",
                margin: "0 0 6px",
              }}
            >
              Enter your name
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "#8A8A8E",
                margin: "0 0 28px",
                lineHeight: 1.5,
              }}
            >
              We will join the game with this name
            </p>

            <input
              type="text"
              ref={nameRef}
              required
              placeholder="Your name"
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "#FAFAF9",
                border: "1px solid #E2E2DF",
                borderRadius: 12,
                padding: "12px 14px",
                fontSize: 15,
                color: "#1C1C1E",
                outline: "none",
                marginBottom: 20,
                fontFamily: "'Inter', sans-serif",
                transition: "border-color 0.15s ease, box-shadow 0.15s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#4A5FD1";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(74,95,209,0.12)";
                e.currentTarget.style.background = "#FFFFFF";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#E2E2DF";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.background = "#FAFAF9";
              }}
            />

            <button
              type="submit"
              style={{
                width: "100%",
                border: "none",
                borderRadius: 12,
                padding: "12px 16px",
                background: "#1C1C1E",
                color: "#FFFFFF",
                fontSize: 15,
                fontWeight: 500,
                fontFamily: "'Inter', sans-serif",
                cursor: "pointer",
                transition: "background 0.15s ease, transform 0.1s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#33333A";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#1C1C1E";
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "scale(0.98)";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              Join
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
