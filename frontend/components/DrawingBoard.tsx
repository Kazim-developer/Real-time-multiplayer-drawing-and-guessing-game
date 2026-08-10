"use client";

import { useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socket";

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

type Point = {
  x: number;
  y: number;
};

type DrawingEvent = {
  start: Point;
  end: Point;
  color: string;
};

type DrawingBoardProps = {
  isDrawer: boolean;
};

export default function DrawingBoard({ isDrawer }: DrawingBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);
  const previousPoint = useRef<Point | null>(null);

  const [color, setColor] = useState("#000000");

  const drawLine = (start: Point, end: Point, lineColor: string) => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d");

    if (!context) return;

    context.strokeStyle = lineColor;
    context.lineWidth = 2;
    context.lineCap = "round";
    context.lineJoin = "round";

    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
  };

  /*
   * Setup canvas
   */
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d");

    if (!context) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();

      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      context.lineWidth = 2;
      context.lineCap = "round";
      context.lineJoin = "round";
    };

    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  /*
   * Receive drawing events from server
   */
  useEffect(() => {
    const handleDrawingStart = ({ start, end, color }: DrawingEvent) => {
      drawLine(start, end, color);
    };

    const handleDrawingMove = ({ start, end, color }: DrawingEvent) => {
      drawLine(start, end, color);
    };

    const handleDrawingEnd = () => {
      // Nothing required for now.
    };

    const handleDrawingClear = () => {
      const canvas = canvasRef.current;

      if (!canvas) return;

      const context = canvas.getContext("2d");

      if (!context) return;

      context.clearRect(0, 0, canvas.width, canvas.height);
    };

    const handleDrawingState = (drawing: DrawingEvent[]) => {
      drawing.forEach((event) => {
        drawLine(event.start, event.end, event.color);
      });
    };

    socket.on("drawing:start", handleDrawingStart);
    socket.on("drawing:move", handleDrawingMove);
    socket.on("drawing:end", handleDrawingEnd);
    socket.on("drawing:clear", handleDrawingClear);
    socket.on("drawing:state", handleDrawingState);

    // Request the current drawing AFTER
    // registering the listener.
    socket.emit("drawing:get-state");

    return () => {
      socket.off("drawing:start", handleDrawingStart);
      socket.off("drawing:move", handleDrawingMove);
      socket.off("drawing:end", handleDrawingEnd);
      socket.off("drawing:clear", handleDrawingClear);
      socket.off("drawing:state", handleDrawingState);
    };
  }, []);
  /*
   * Ask server for current game state
   */
  useEffect(() => {
    socket.emit("game:get-state");
  }, []);

  /*
   * Convert pointer coordinates
   * into canvas coordinates.
   */
  const getPosition = (event: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return {
        x: 0,
        y: 0,
      };
    }

    const rect = canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  /*
   * Start drawing
   */
  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    // Only drawer can draw
    if (!isDrawer) return;

    const canvas = canvasRef.current;

    if (!canvas) return;

    const point = getPosition(event);

    isDrawing.current = true;
    previousPoint.current = point;

    canvas.setPointerCapture(event.pointerId);

    socket.emit("drawing:start", {
      start: point,
      end: point,
      color,
    });

    // Draw the initial point locally
    drawLine(point, point, color);
  };

  /*
   * Continue drawing
   */
  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    // Only drawer can draw
    if (!isDrawer) return;

    if (!isDrawing.current) return;

    const currentPoint = getPosition(event);

    const previous = previousPoint.current;

    if (!previous) {
      previousPoint.current = currentPoint;
      return;
    }

    /*
     * Draw immediately on drawer's canvas.
     */
    drawLine(previous, currentPoint, color);

    /*
     * Send drawing operation
     * to other players.
     */
    socket.emit("drawing:move", {
      start: previous,
      end: currentPoint,
      color,
    });

    previousPoint.current = currentPoint;
  };

  /*
   * Stop drawing
   */
  const stopDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawer) return;

    if (!isDrawing.current) return;

    const canvas = canvasRef.current;

    if (!canvas) return;

    isDrawing.current = false;
    previousPoint.current = null;

    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }

    socket.emit("drawing:end");
  };

  /*
   * Clear entire canvas
   */
  const clearCanvas = () => {
    // Only drawer can clear
    if (!isDrawer) return;

    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d");

    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);

    socket.emit("drawing:clear");
  };

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Canvas */}
      <div className="w-full overflow-hidden rounded-xl border border-gray-300 bg-white">
        <canvas
          ref={canvasRef}
          className="block h-[500px] w-full touch-none bg-white"
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
        />
      </div>

      {/* Drawing controls */}
      {isDrawer && (
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            {COLORS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setColor(item)}
                className={`h-7 w-7 rounded-full border-2 ${
                  color === item ? "border-black" : "border-transparent"
                }`}
                style={{
                  backgroundColor: item,
                }}
                aria-label={`Select ${item}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={clearCanvas}
            className="rounded-lg bg-[#a2fa18] px-4 py-2 text-sm font-medium text-gray-700 hover:opacity-90"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
