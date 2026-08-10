import type { DrawingEvent } from "../sockets/drawingSocket.js";

const drawingState: DrawingEvent[] = [];

export function addDrawingEvent(event: DrawingEvent) {
  drawingState.push(event);
}

export function getDrawingState() {
  return drawingState;
}

export function clearDrawingState() {
  drawingState.length = 0;
}
