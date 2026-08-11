import { words } from "./words.js";

export function getRandomWords(count: number = 3) {
  const shuffled = [...words].sort(() => Math.random() - 0.5);

  return shuffled.slice(0, count);
}
