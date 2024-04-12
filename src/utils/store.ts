import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface IStore {
  token: any;
  setToken: (token: string) => void;
  gpu: any;
  setGpu: (gpu: string) => void;
}

export const useStorage = create<IStore>()(
  devtools(
    persist(
      (set) => ({
        token: {
          time: 0,
        },
        setToken: (token) => set({ token }),
        gpu: {
          time: 0,
        },
        setGpu: (gpu) => set({ gpu }),
      }),
      {
        name: "akash-network",
        getStorage: () => localStorage,
      },
    ),
  ),
);
