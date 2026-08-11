import { Player } from "@/components/PlayerList";
import { create } from "zustand";

type PlayersList = {
  players: Player[];

  drawerId: string;

  addPlayers: (data: Player[]) => void;

  setDrawerId: (drawerId: string) => void;
};

export const usePlayersStore = create<PlayersList>()((set) => ({
  players: [],

  drawerId: "",

  addPlayers: (data: Player[]) => set({ players: data }),

  setDrawerId: (drawerId: string) => set({ drawerId }),
}));
