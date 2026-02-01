import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { StoreState } from "@/types/store";

export interface IStore extends StoreState {}

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
