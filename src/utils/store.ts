import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface IStore {
  token: any;
  setToken: (token: string) => void;
}

export const useStorage = create<IStore>()(
  devtools(
    persist(
      (set) => ({
        token: null,
        setToken: (token) => set({ token }),
      }),
      {
        name: "akash-network",
        getStorage: () => localStorage,
      },
    ),
  ),
);
