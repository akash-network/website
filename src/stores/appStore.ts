import { atom } from 'nanostores';

export const docsLinkTracks = atom<{ [link: string]: boolean }>({});
