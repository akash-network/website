/**
 * Token state stored in Zustand store
 */
export interface TokenState {
  time: number;
  value?: string;
}

/**
 * GPU state stored in Zustand store
 */
export interface GpuState {
  time: number;
  value?: string;
}

/**
 * Store state interface
 */
export interface StoreState {
  token: TokenState;
  setToken: (token: TokenState) => void;
  gpu: GpuState;
  setGpu: (gpu: GpuState) => void;
  docsLinkTracks: { [link: string]: boolean };
  setDocsLinkTracks: (data: { [link: string]: boolean }) => void;
}
