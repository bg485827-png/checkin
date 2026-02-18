import { create } from 'zustand';
import { Howl } from 'howler';
import {
  imagine_Dragons_Demons_Mp3,
  impossible_Shontelle_Mp3,
} from '../assets';

export interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
}

interface PlayerState {
  tracks: Track[];
  currentTrackIndex: number;
  isPlaying: boolean;
  volume: number;
  howl: Howl | null;

  setTracks: (tracks: Track[]) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  setVolume: (volume: number) => void;
  setCurrentTrack: (index: number) => void;
  setHowl: (howl: Howl) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  tracks: [
    {
      id: '1',
      title: 'Impossible',
      artist: 'Shontelle',
      url: impossible_Shontelle_Mp3,
    },
    {
      id: '2',
      title: 'Demons',
      artist: 'Imagine Dragons',
      url: imagine_Dragons_Demons_Mp3,
    },
  ],
  currentTrackIndex: 0,
  isPlaying: false,
  volume: 70,
  howl: null,

  setTracks: tracks => set({ tracks }),

  play: () => {
    const { howl } = get();
    if (howl) {
      howl.play();
      set({ isPlaying: true });
    }
  },

  pause: () => {
    const { howl } = get();
    if (howl) {
      howl.pause();
    }
    set({ isPlaying: false });
  },

  togglePlay: () => {
    const { isPlaying, howl } = get();
    if (!howl) return;

    if (isPlaying) {
      howl.pause();
      set({ isPlaying: false });
    } else {
      howl.play();
      set({ isPlaying: true });
    }
  },

  next: () => {
    const { tracks, currentTrackIndex } = get();
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    set({ currentTrackIndex: nextIndex, isPlaying: false });
  },

  previous: () => {
    const { tracks, currentTrackIndex } = get();
    const previousIndex =
      currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1;
    set({ currentTrackIndex: previousIndex, isPlaying: false });
  },

  setVolume: volume => {
    const { howl } = get();
    const clampedVolume = Math.max(0, Math.min(1, volume / 100));
    if (howl) {
      howl.volume(clampedVolume);
    }
    set({ volume });
  },

  setCurrentTrack: index => {
    set({ currentTrackIndex: index, isPlaying: false });
  },

  setHowl: howl => set({ howl }),
}));
