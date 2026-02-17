import { create } from 'zustand';
import { Howl } from 'howler';

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
      title: 'Sunset Boulevard',
      artist: 'Indie Dreams',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    },
    {
      id: '2',
      title: 'Digital Dawn',
      artist: 'Electronic Waves',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    },
    {
      id: '3',
      title: 'Neon Nights',
      artist: 'Synth Pop',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
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
