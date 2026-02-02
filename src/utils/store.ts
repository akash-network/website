import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { TokenData, GpuData } from "@/types/store";

export interface IStore {
  token: TokenData;
  setToken: (token: TokenData) => void;
  gpu: GpuData;
  setGpu: (gpu: GpuData) => void;
  docsLinkTracks: { [link: string]: boolean };
  setDocsLinkTracks: (data: { [link: string]: boolean }) => void;
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
        docsLinkTracks: {},
        setDocsLinkTracks: (data) => set((state) => ({ docsLinkTracks: data })),
      }),
      {
        name: "akash-network",
        getStorage: () => localStorage,
      },
    ),
  ),
);
