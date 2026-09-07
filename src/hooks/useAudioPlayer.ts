import { useState, useEffect, useRef } from "react";

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<number | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  // Volume, Rate, and Pitch states
  const [volume, setVolume] = useState(1.0);
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0); // 0.5 to 1.5

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    stopTimer();

    if (audioRef.current) {
      const audio = audioRef.current;
      audioRef.current = null;

      // Unbind all event listeners to avoid invoking callbacks on unmounted/replaced elements
      audio.onloadedmetadata = null;
      audio.onplay = null;
      audio.onpause = null;
      audio.onended = null;
      audio.onerror = null;

      try {
        audio.pause();
      } catch (e) {}

      if (playPromiseRef.current) {
        playPromiseRef.current
          .then(() => {
            try {
              audio.pause();
            } catch (e) {}
          })
          .catch(() => {
            // Already aborted
          });
      }
    }

    if (audioUrl) {
      try {
        URL.revokeObjectURL(audioUrl);
      } catch (e) {}
      setAudioUrl(null);
    }
  };

  const startTimer = () => {
    stopTimer();
    intervalRef.current = window.setInterval(() => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    }, 100);
  };

  const stopTimer = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const safePlay = (audio: HTMLAudioElement) => {
    try {
      const promise = audio.play();
      if (promise !== undefined && typeof promise.then === "function") {
        playPromiseRef.current = promise;
        promise
          .then(() => {
            setIsPlaying(true);
            setIsPaused(false);
          })
          .catch((err: any) => {
            // AbortError is triggered when pause() interrupts play() - this is normal browser behavior
            if (err && (err.name === "AbortError" || String(err).indexOf("interrupted by a call to pause") !== -1)) {
              return;
            }
            if (err && err.name === "NotAllowedError") {
              setIsPlaying(false);
              setIsPaused(true);
              return;
            }
            console.warn("Audio playback issue:", err);
          })
          .finally(() => {
            if (playPromiseRef.current === promise) {
              playPromiseRef.current = null;
            }
          });
      }
    } catch (err: any) {
      if (err && (err.name === "AbortError" || String(err).indexOf("interrupted by a call to pause") !== -1)) {
        return;
      }
      console.warn("Audio play call failed:", err);
    }
  };

  const safePause = () => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    if (playPromiseRef.current) {
      playPromiseRef.current
        .then(() => {
          try {
            audio.pause();
          } catch (e) {}
        })
        .catch(() => {
          // Play was aborted, no further pause necessary
        });
    } else {
      try {
        audio.pause();
      } catch (e) {}
    }
  };

  const loadBlob = (blob: Blob) => {
    cleanup();

    const url = URL.createObjectURL(blob);
    setAudioUrl(url);

    const audio = new Audio(url);
    audioRef.current = audio;

    // Apply volume, rate and pitch
    try {
      audio.volume = Math.max(0, Math.min(1, volume));
      audio.playbackRate = Math.max(0.5, Math.min(2.0, rate));
      if ("preservesPitch" in audio) {
        (audio as any).preservesPitch = true;
      } else if ("webkitPreservesPitch" in audio) {
        (audio as any).webkitPreservesPitch = true;
      }
    } catch (e) {}

    // Event listeners
    audio.onloadedmetadata = () => {
      setDuration(audio.duration || 0);
    };

    audio.onplay = () => {
      setIsPlaying(true);
      setIsPaused(false);
      startTimer();
    };

    audio.onpause = () => {
      setIsPlaying(false);
      setIsPaused(true);
      stopTimer();
    };

    audio.onended = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentTime(0);
      stopTimer();
    };

    audio.onerror = (e) => {
      try {
        if (e && typeof (e as any).stopPropagation === "function") {
          (e as any).stopPropagation();
        }
      } catch (err) {}
      // If src was cleared during cleanup, ignore
      if (!audio.src || audio.src === window.location.href) return;
      console.warn("Audio element reported error:", e);
      setIsPlaying(false);
      setIsPaused(false);
      stopTimer();
    };
  };

  const playBlob = (blob: Blob) => {
    loadBlob(blob);
    if (audioRef.current) {
      safePlay(audioRef.current);
    }
  };

  const pause = () => {
    safePause();
    setIsPlaying(false);
    setIsPaused(true);
    stopTimer();
  };

  const resume = () => {
    if (audioRef.current) {
      safePlay(audioRef.current);
    }
  };

  const stop = () => {
    safePause();
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
      } catch (e) {}
      setCurrentTime(0);
    }
    setIsPlaying(false);
    setIsPaused(false);
    stopTimer();
  };

  const replay = () => {
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
      } catch (e) {}
      setCurrentTime(0);
      safePlay(audioRef.current);
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = time;
      } catch (e) {}
      setCurrentTime(time);
    }
  };

  // Sync settings when adjusted
  useEffect(() => {
    if (audioRef.current) {
      try {
        audioRef.current.volume = Math.max(0, Math.min(1, volume));
      } catch (e) {}
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      try {
        audioRef.current.playbackRate = Math.max(0.5, Math.min(2.0, rate));
        if ("preservesPitch" in audioRef.current) {
          (audioRef.current as any).preservesPitch = true;
        } else if ("webkitPreservesPitch" in audioRef.current) {
          (audioRef.current as any).webkitPreservesPitch = true;
        }
      } catch (e) {}
    }
  }, [rate]);

  return {
    isPlaying,
    isPaused,
    currentTime,
    duration,
    audioUrl,
    volume,
    rate,
    pitch,
    setVolume,
    setRate,
    setPitch,
    playBlob,
    pause,
    resume,
    stop,
    replay,
    seek,
  };
}
