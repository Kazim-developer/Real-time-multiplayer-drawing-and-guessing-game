import { getRandomWords } from "./getRandomWords.js";
import { Server } from "socket.io";

let offeredWords: string[] = [];
let selectedWord: string | null = null;

export function sendWordOptions(io: Server, drawerSocketId: string) {
  offeredWords = getRandomWords(5);
  selectedWord = null;

  io.to(drawerSocketId).emit("word:options", offeredWords);
}

export function getOfferedWords() {
  return offeredWords;
}

export function selectWord(word: string) {
  if (!word || !word.trim()) {
    return false;
  }

  selectedWord = word.trim();

  return true;
}

export function getSelectedWord() {
  return selectedWord;
}
