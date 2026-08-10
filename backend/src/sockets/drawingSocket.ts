import { Server, Socket } from "socket.io";

import {
  addDrawingEvent,
  clearDrawingState,
  getDrawingState,
} from "../game/drawingState.js";

import { getCurrentDrawerId } from "../game/gameState.js";

export type Point = {
  x: number;
  y: number;
};

export type DrawingEvent = {
  start: Point;
  end: Point;
  color: string;
};

export function registerDrawingEvents(io: Server, socket: Socket) {
  socket.on("drawing:start", async (event: DrawingEvent) => {
    const drawerId = await getCurrentDrawerId();

    if (drawerId !== socket.id) {
      return;
    }

    addDrawingEvent(event);

    socket.broadcast.emit("drawing:start", event);
  });

  socket.on("drawing:move", async (event: DrawingEvent) => {
    const drawerId = await getCurrentDrawerId();

    if (drawerId !== socket.id) {
      return;
    }

    addDrawingEvent(event);

    socket.broadcast.emit("drawing:move", event);
  });

  socket.on("drawing:end", async () => {
    const drawerId = await getCurrentDrawerId();

    if (drawerId !== socket.id) {
      return;
    }

    socket.broadcast.emit("drawing:end");
  });

  socket.on("drawing:clear", async () => {
    const drawerId = await getCurrentDrawerId();

    if (drawerId !== socket.id) {
      return;
    }

    clearDrawingState();

    socket.broadcast.emit("drawing:clear");
  });

  /*
   * New player requests the current drawing.
   */
  socket.on("drawing:get-state", () => {
    const drawing = getDrawingState();

    socket.emit("drawing:state", drawing);
  });
}
