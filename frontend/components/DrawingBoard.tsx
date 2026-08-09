"use client";

import { useEffect, useRef, useState } from "react";

const COLORS = [
  "#000000",
  "#FF3B30",
  "#FF9500",
  "#FFCC00",
  "#34C759",
  "#007AFF",
  "#5856D6",
  "#AF52DE",
  "#8E8E93",
];

export default function DrawingBoard() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [color, setColor] = useState("#000000");

  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d");

    if (!context) return;

    context.lineWidth = 2;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#000000";

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();

      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      context.scale(dpr, dpr);

      context.lineWidth = 2;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = color;
    };

    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d");

    if (!context) return;

    context.strokeStyle = color;
  }, [color]);

  const getPosition = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return { x: 0, y: 0 };
    }

    const rect = canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d");

    if (!context) return;

    const { x, y } = getPosition(event);

    isDrawing.current = true;

    context.beginPath();
    context.moveTo(x, y);

    canvas.setPointerCapture(event.pointerId);
  };

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;

    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d");

    if (!context) return;

    const { x, y } = getPosition(event);

    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;

    const canvas = canvasRef.current;

    if (!canvas) return;

    isDrawing.current = false;

    canvas.releasePointerCapture(event.pointerId);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d");

    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Drawing area */}

      <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white">
        <canvas
          ref={canvasRef}
          className="block h-[500px] w-full touch-none"
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
        />
      </div>

      {/* Color palette */}

      <div className="flex items-center gap-3 mx-auto">
        <div className="flex items-center gap-2">
          {COLORS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setColor(item)}
              className={`h-7 w-7 rounded-full border-2 ${
                color === item ? "border-black" : "border-transparent"
              }`}
              style={{ backgroundColor: item }}
              aria-label={`Select ${item}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={clearCanvas}
          className="rounded-lg bg-[#a2fa18] px-4 py-2 text-sm font-medium text-gray-700 hover:opacity-0.9"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
