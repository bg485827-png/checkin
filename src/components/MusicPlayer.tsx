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
  }, [currentTrackIndex, currentTrack, isPlaying, volume, next, setHowl]);

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

  return (
    <div className={styles.playerContainer}>
      <div className={styles.trackInfo}>
        <div className={styles.trackTitle}>{currentTrack.title}</div>
        <div className={styles.trackArtist}>{currentTrack.artist}</div>
      </div>

      <div className={styles.controls}>
        <button
          className={styles.controlButton}
          onClick={previous}
          title='Anterior'
        >
          <SkipBack size={20} />
        </button>

        <button
          className={`${styles.controlButton} ${styles.playButton}`}
          onClick={togglePlay}
          title={isPlaying ? 'Pausar' : 'Tocar'}
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>

        <button className={styles.controlButton} onClick={next} title='Próxima'>
          <SkipForward size={20} />
        </button>
      </div>

      <div className={styles.volumeControl}>
        <Volume2 size={18} />
        <input
          type='range'
          min='0'
          max='100'
          value={volume}
          onChange={e => setVolume(Number(e.target.value))}
          className={styles.volumeSlider}
          title='Volume'
        />
        <span className={styles.volumeLabel}>{volume}%</span>
      </div>

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
  );
}
