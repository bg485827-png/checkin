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

export function MusicPlayer() {
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
  } = usePlayerStore();

  const howlRef = useRef<Howl | null>(null);
  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    if (!currentTrack) return;

    // Parar a música anterior
    if (howlRef.current) {
      howlRef.current.unload();
    }

    // Criar nova instância do Howl
    const sound = new Howl({
      src: [currentTrack.url],
      html5: true,
      volume: volume / 100,
      onload: () => {
        console.log('Track loaded:', currentTrack.title);
        setDuration(sound.duration());
      },
      onloaderror: () => {
        console.error('Error loading track:', currentTrack.title);
      },
      onend: () => {
        next();
      },
    });

    howlRef.current = sound;
    setHowl(sound);

    // Se estava tocando, continua tocando
    if (isPlaying) {
      sound.play();
    }

    return () => {
      if (howlRef.current) {
        howlRef.current.stop();
      }
    };
  }, [currentTrackIndex, currentTrack, isPlaying, next, setHowl]);

  useEffect(() => {
    if (!howlRef.current) return;

    if (isPlaying) {
      howlRef.current.play();
    } else {
      howlRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (howlRef.current) {
      howlRef.current.volume(volume / 100);
    }
  }, [volume]);

  // Atualizar progresso
  useEffect(() => {
    const interval = setInterval(() => {
      if (howlRef.current && isPlaying) {
        const current = howlRef.current.seek();
        setProgress((current / duration) * 100);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, duration]);

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

  return (
    <div className={styles.playerContainer}>
      <div className={styles.trackInfo}>
        <div className={styles.trackTitle}>{currentTrack.title}</div>
        <div className={styles.trackArtist}>{currentTrack.artist}</div>
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
                    <div className={styles.playlistItemTitle}>
                      {track.title}
                    </div>
                    <div className={styles.playlistItemArtist}>
                      {track.artist}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className={styles.controlsContainer}>
        <div className={styles.controls}>
          <button
            className={styles.controlButton}
            onClick={previous}
            title='Anterior'
          >
            <SkipBack size={16} />
          </button>

          <button
            className={`${styles.controlButton} ${styles.playButton}`}
            onClick={togglePlay}
            title={isPlaying ? 'Pausar' : 'Tocar'}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>

          <button
            className={styles.controlButton}
            onClick={next}
            title='Próxima'
          >
            <SkipForward size={16} />
          </button>
        </div>

        <div className={styles.progressControl}>
          <span className={styles.timeLabel}>
            {formatTime((progress / 100) * duration)}
          </span>
          <input
            type='range'
            min='0'
            max='100'
            value={progress}
            onChange={handleProgressChange}
            className={styles.progressSlider}
            title='Progresso'
          />
          <span className={styles.timeLabel}>{formatTime(duration)}</span>
        </div>
      </div>
      <div className={styles.volumeControlSmall}>
        <input
          type='range'
          min='0'
          max='100'
          value={volume}
          onChange={e => setVolume(Number(e.target.value))}
          className={styles.volumeSliderSmall}
          title='Volume'
        />
        <Volume2 size={16} />
      </div>
    </div>
  );
}
