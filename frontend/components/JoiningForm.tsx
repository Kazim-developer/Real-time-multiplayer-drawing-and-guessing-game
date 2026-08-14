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
      style={{
        position: "relative",
        overflow: "hidden",
        background: "#F6F7FB",
      }}
    >
      <style>{`
        @keyframes jfFadeUp {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes jfFloatA {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -16px); }
        }
        @keyframes jfFloatB {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-18px, 14px); }
        }
        .jf-card {
          animation: jfFadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .jf-blob-a {
          animation: jfFloatA 10s ease-in-out infinite;
        }
        .jf-blob-b {
          animation: jfFloatB 12s ease-in-out infinite;
        }
        .jf-input::placeholder {
          color: #B4B5C2;
        }
        @media (prefers-reduced-motion: reduce) {
          .jf-card, .jf-blob-a, .jf-blob-b {
            animation: none !important;
          }
        }
      `}</style>

      {/* Ambient color blobs */}
      <div
        className="jf-blob-a"
        style={{
          position: "absolute",
          top: "-10%",
          left: "-8%",
          width: 340,
          height: 340,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,138,101,0.35) 0%, rgba(255,138,101,0) 70%)",
          filter: "blur(10px)",
          pointerEvents: "none",
        }}
      />
      <div
        className="jf-blob-b"
        style={{
          position: "absolute",
          bottom: "-14%",
          right: "-10%",
          width: 380,
          height: 380,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(91,95,239,0.28) 0%, rgba(91,95,239,0) 70%)",
          filter: "blur(10px)",
          pointerEvents: "none",
        }}
      />

      <div style={{ width: "100%", maxWidth: 360, position: "relative" }}>
        <form onSubmit={handleJoining}>
          <div
            className="jf-card"
            style={{
              background: "#FFFFFF",
              border: "1px solid #ECEDF6",
              borderRadius: 24,
              padding: "44px 34px 36px",
              boxShadow:
                "0 2px 6px rgba(20,20,30,0.04), 0 24px 60px -24px rgba(91,95,239,0.35)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {/* Paint-dab dot cluster */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 18,
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#FF6B6B",
                  boxShadow: "0 2px 6px rgba(255,107,107,0.5)",
                }}
              />
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#FFC24B",
                  boxShadow: "0 2px 6px rgba(255,194,75,0.5)",
                  transform: "translateY(1px)",
                }}
              />
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#35C4B4",
                  boxShadow: "0 2px 6px rgba(53,196,180,0.5)",
                }}
              />
            </div>

            <h1
              style={{
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: "-0.01em",
                color: "#15151A",
                margin: "0 0 6px",
              }}
            >
              Enter your name
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "#93949F",
                margin: "0 0 26px",
                lineHeight: 1.5,
              }}
            >
              You will join the game with this name
            </p>

            <input
              type="text"
              ref={nameRef}
              required
              placeholder="Your name"
              className="jf-input"
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "#FAFAFC",
                border: "1px solid #E6E7F0",
                borderRadius: 14,
                padding: "13px 15px",
                fontSize: 15,
                color: "#15151A",
                outline: "none",
                marginBottom: 22,
                fontFamily: "'Inter', sans-serif",
                transition:
                  "border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#5B5FEF";
                e.currentTarget.style.boxShadow =
                  "0 0 0 4px rgba(91,95,239,0.14)";
                e.currentTarget.style.background = "#FFFFFF";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#E6E7F0";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.background = "#FAFAFC";
              }}
            />

            <button
              type="submit"
              style={{
                width: "100%",
                border: "none",
                borderRadius: 14,
                padding: "13px 16px",
                background:
                  "linear-gradient(135deg, #6C5CE7 0%, #5B5FEF 55%, #4A5FD1 100%)",
                color: "#FFFFFF",
                fontSize: 15,
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                cursor: "pointer",
                boxShadow: "0 10px 24px -8px rgba(91,95,239,0.55)",
                transition:
                  "transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = "brightness(1.08)";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 14px 30px -8px rgba(91,95,239,0.6)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = "none";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 10px 24px -8px rgba(91,95,239,0.55)";
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "scale(0.98)";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
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
