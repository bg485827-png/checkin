import { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Music,
  ChevronDown,
} from 'lucide-react';
import { Howl } from 'howler';
import styles from './MusicPlayer.module.css';
import { usePlayerStore } from '../store/playerStore';

type LoopMode = 'track' | 'playlist';

type MusicPlayerProps = {
  hidden?: boolean;
  autoPlay?: boolean;
  loopMode?: LoopMode;
};

export function MusicPlayer({
  hidden = false,
  autoPlay = false,
  loopMode = 'playlist',
}: MusicPlayerProps) {
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const {
    tracks,
    currentTrackIndex,
    isPlaying,
    volume,
    togglePlay,
    next,
    previous,
    setVolume,
    setCurrentTrack,
    setHowl,
    play, // ✅ manter store coerente quando autoplay acontecer
  } = usePlayerStore();

  const howlRef = useRef<Howl | null>(null);
  const unlockCleanupRef = useRef<null | (() => void)>(null);

  const currentTrack = tracks[currentTrackIndex];

  // autoPlay liga o play mesmo se store estiver false
  const shouldPlay = autoPlay || isPlaying;

  function cleanupUnlockListeners() {
    if (unlockCleanupRef.current) {
      unlockCleanupRef.current();
      unlockCleanupRef.current = null;
    }
  }

  function attachUnlockGesture(sound: Howl) {
    // evita duplicar
    if (unlockCleanupRef.current) return;

    const tryPlayOnGesture = () => {
      try {
        sound.play();
        play(); // marca tocando no store
      } catch {
        // ignore
      }
      cleanup();
    };

    const cleanup = () => {
      window.removeEventListener('pointerdown', tryPlayOnGesture);
      window.removeEventListener('touchstart', tryPlayOnGesture);
      window.removeEventListener('keydown', tryPlayOnGesture);
      unlockCleanupRef.current = null;
    };

    window.addEventListener('pointerdown', tryPlayOnGesture, { once: true });
    window.addEventListener('touchstart', tryPlayOnGesture, { once: true });
    window.addEventListener('keydown', tryPlayOnGesture, { once: true });

    unlockCleanupRef.current = cleanup;
  }

  useEffect(() => {
    if (!currentTrack) return;

    cleanupUnlockListeners();

    // descarrega anterior
    if (howlRef.current) {
      howlRef.current.stop();
      howlRef.current.unload();
      howlRef.current = null;
    }

    const sound = new Howl({
      src: [currentTrack.url],
      html5: true,
      preload: true,
      volume: volume / 100,
      loop: loopMode === 'track',

      onload: () => {
        setDuration(sound.duration());
      },

      onloaderror: () => {
        console.error('Error loading track:', currentTrack.title);
      },

      onend: () => {
        if (loopMode === 'track') return;

        if (tracks.length === 0) return;
        const lastIndex = tracks.length - 1;

        if (currentTrackIndex >= lastIndex) {
          setCurrentTrack(0);
        } else {
          next();
        }
      },
    });

    howlRef.current = sound;
    setHowl(sound);

    // Se autoplay for bloqueado, o Howler dispara playerror
    sound.on('playerror', () => {
      attachUnlockGesture(sound);
    });

    // tentativa inicial
    if (shouldPlay) {
      try {
        sound.play();
        play();
      } catch {
        attachUnlockGesture(sound);
      }
    }

    return () => {
      cleanupUnlockListeners();
      if (howlRef.current) {
        howlRef.current.stop();
        howlRef.current.unload();
        howlRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentTrackIndex,
    currentTrack?.url,
    currentTrack?.title,
    volume,
    loopMode,
    shouldPlay,
    next,
    setHowl,
    setCurrentTrack,
    tracks.length,
    play,
  ]);

  useEffect(() => {
    if (!howlRef.current) return;

    if (shouldPlay) {
      try {
        howlRef.current.play();
      } catch {
        // se bloquear, playerror vai anexar o gesto
      }
    } else {
      howlRef.current.pause();
    }
  }, [shouldPlay]);

  useEffect(() => {
    if (howlRef.current) {
      howlRef.current.volume(volume / 100);
    }
  }, [volume]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (howlRef.current && shouldPlay) {
        const current = howlRef.current.seek() as number;
        if (duration > 0) setProgress((current / duration) * 100);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [shouldPlay, duration]);

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = (Number(e.target.value) / 100) * duration;
    if (howlRef.current) {
      howlRef.current.seek(newTime);
    }
    setProgress(Number(e.target.value));
  };

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // invisível (ListPage)
  if (hidden) return null;

  return (
    <div className={styles.playerContainer}>
      <div className={styles.trackInfo}>
        <div className={styles.trackTitle}>{currentTrack?.title}</div>
        <div className={styles.trackArtist}>{currentTrack?.artist}</div>

        <div className={styles.playlistDropdown}>
          <button
            className={styles.playlistButton}
            onClick={() => setShowPlaylist(!showPlaylist)}
          >
            <Music size={16} />
            <span>Faixas</span>
            <ChevronDown
              size={16}
              className={`${styles.chevron} ${showPlaylist ? styles.open : ''}`}
            />
          </button>

          {showPlaylist && (
            <div className={styles.playlistMenu}>
              {tracks.map((track, index) => (
                <button
                  key={track.id}
                  className={`${styles.playlistItem} ${
                    index === currentTrackIndex ? styles.active : ''
                  }`}
                  onClick={() => {
                    setCurrentTrack(index);
                    setShowPlaylist(false);
                  }}
                >
                  <div className={styles.playlistItemContent}>
                    <div className={styles.playlistItemTitle}>{track.title}</div>
                    <div className={styles.playlistItemArtist}>{track.artist}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.controlsContainer}>
        <div className={styles.controls}>
          <button className={styles.controlButton} onClick={previous} title="Anterior">
            <SkipBack size={16} />
          </button>

          <button
            className={`${styles.controlButton} ${styles.playButton}`}
            onClick={togglePlay}
            title={isPlaying ? 'Pausar' : 'Tocar'}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>

          <button className={styles.controlButton} onClick={next} title="Próxima">
            <SkipForward size={16} />
          </button>
        </div>

        <div className={styles.progressControl}>
          <span className={styles.timeLabel}>
            {formatTime((progress / 100) * duration)}
          </span>

          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleProgressChange}
            className={styles.progressSlider}
            title="Progresso"
          />

          <span className={styles.timeLabel}>{formatTime(duration)}</span>
        </div>
      </div>

      <div className={styles.volumeControlSmall}>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className={styles.volumeSliderSmall}
          title="Volume"
        />
        <Volume2 size={16} />
      </div>
    </div>
  );
}