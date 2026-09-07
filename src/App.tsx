import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { TextInput } from "./components/TextInput";
import { VoiceSelector } from "./components/VoiceSelector";
import { SettingsPanel } from "./components/SettingsPanel";
import { AudioControls } from "./components/AudioControls";
import { HistoryList } from "./components/HistoryList";
import { ToastContainer, ToastMessage, ToastType } from "./components/Toast";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import { generateSpeech } from "./services/googleTTS";
import { pcmToWav, downloadWavBlob } from "./utils/pcmToWav";
import { SpeechHistoryItem, VoiceName } from "./types";
import { Sparkles, Activity } from "lucide-react";

const LOCAL_STORAGE_SETTINGS_KEY = "vox-gemini-tts-settings";
const LOCAL_STORAGE_HISTORY_KEY = "vox-gemini-tts-history";

export default function App() {
  // Load settings from localStorage or defaults with safe fallbacks
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    try {
      const cached = localStorage.getItem(`${LOCAL_STORAGE_SETTINGS_KEY}-theme`);
      return cached === "light" ? "light" : "dark"; // Default is dark theme
    } catch {
      return "dark";
    }
  });

  const [selectedVoice, setSelectedVoice] = useState<VoiceName>(() => {
    try {
      const cached = localStorage.getItem(`${LOCAL_STORAGE_SETTINGS_KEY}-voice`);
      return (cached as VoiceName) || "Charon"; // Default to Charon (Narrator)
    } catch {
      return "Charon";
    }
  });

  const [rate, setRate] = useState<number>(() => {
    try {
      const cached = localStorage.getItem(`${LOCAL_STORAGE_SETTINGS_KEY}-rate`);
      return cached ? parseFloat(cached) : 1.0;
    } catch {
      return 1.0;
    }
  });

  const [pitch, setPitch] = useState<number>(() => {
    try {
      const cached = localStorage.getItem(`${LOCAL_STORAGE_SETTINGS_KEY}-pitch`);
      return cached ? parseFloat(cached) : 1.0;
    } catch {
      return 1.0;
    }
  });

  const [volume, setVolume] = useState<number>(() => {
    try {
      const cached = localStorage.getItem(`${LOCAL_STORAGE_SETTINGS_KEY}-volume`);
      return cached ? parseFloat(cached) : 1.0;
    } catch {
      return 1.0;
    }
  });

  // History state with quota-safe retrieval
  const [history, setHistory] = useState<SpeechHistoryItem[]>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [text, setText] = useState(
    "Welcome to SpeechMan AI! This app generates crystal clear male speeches in real time using the official Google Gen AI SDK. Try editing this text and clicking generate to hear the difference!"
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [quotaResetCountdown, setQuotaResetCountdown] = useState<number | null>(null);

  // Current active loaded WAV blob for downloading
  const [currentWavBlob, setCurrentWavBlob] = useState<Blob | null>(null);

  // Hook for audio playing
  const audioPlayer = useAudioPlayer();

  // Decrement quota countdown timer every second
  useEffect(() => {
    if (quotaResetCountdown === null || quotaResetCountdown <= 0) return;
    const interval = setInterval(() => {
      setQuotaResetCountdown((prev) => {
        if (prev === null || prev <= 1) return null;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [quotaResetCountdown]);

  // Sync player settings
  useEffect(() => {
    audioPlayer.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    audioPlayer.setRate(rate);
  }, [rate]);

  useEffect(() => {
    audioPlayer.setPitch(pitch);
  }, [pitch]);

  // Apply visual theme class to root element
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
    try {
      localStorage.setItem(`${LOCAL_STORAGE_SETTINGS_KEY}-theme`, theme);
    } catch {}
  }, [theme]);

  // Save settings updates
  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_SETTINGS_KEY}-voice`, selectedVoice);
      localStorage.setItem(`${LOCAL_STORAGE_SETTINGS_KEY}-rate`, rate.toString());
      localStorage.setItem(`${LOCAL_STORAGE_SETTINGS_KEY}-pitch`, pitch.toString());
      localStorage.setItem(`${LOCAL_STORAGE_SETTINGS_KEY}-volume`, volume.toString());
    } catch {}
  }, [selectedVoice, rate, pitch, volume]);

  // Save history updates safely (handles storage quotas gracefully)
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      // If quota exceeded due to large base64 clips, keep fewer items
      try {
        if (history.length > 5) {
          localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(history.slice(0, 5)));
        }
      } catch {}
    }
  }, [history]);

  // Toast handler
  const showToast = (text: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Convert text and speak
  const handleGenerateAndSpeak = async () => {
    if (!text || !text.trim()) {
      showToast("Please enter some text first.", "error");
      return;
    }

    setIsGenerating(true);
    audioPlayer.stop();
    setActiveHistoryId(null);

    try {
      // Call standard proxy service to perform voice generation
      const result = await generateSpeech({ text, voiceName: selectedVoice, rate, pitch });
      const base64PCM = result.audio;

      // Convert raw base64 PCM output to playable standard WAV file
      const blob = pcmToWav(base64PCM);
      setCurrentWavBlob(blob);

      // Play audio blob in waveform / player
      audioPlayer.playBlob(blob);

      if (result.quotaExceeded) {
        if (result.retryAfterSeconds) {
          setQuotaResetCountdown(result.retryAfterSeconds);
        }
        showToast(
          result.message || `Rate limit reached for ${selectedVoice}.`,
          "info"
        );
      } else {
        showToast(`Synthesized with official Gemini ${selectedVoice}!`);
      }

      // Add to local history list
      const newItem: SpeechHistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        text: text.trim(),
        voiceName: selectedVoice,
        date:
          new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
          " " +
          new Date().toLocaleDateString([], { month: "short", day: "numeric" }),
        audioBase64: base64PCM,
        rate,
        pitch,
        volume,
      };

      setHistory((prev) => {
        // Filter out duplicates and limit to 20 items
        const filtered = prev.filter((item) => item.text !== newItem.text || item.voiceName !== newItem.voiceName);
        return [newItem, ...filtered].slice(0, 20);
      });
    } catch (error: any) {
      console.warn("Notice in handleGenerateAndSpeak:", error?.message || error);
      showToast(error?.message || "Speech synthesis failed. Please try again shortly.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  // Trigger history replay
  const handleSelectReplay = (item: SpeechHistoryItem) => {
    audioPlayer.stop();
    setActiveHistoryId(item.id);

    try {
      const blob = pcmToWav(item.audioBase64);
      setCurrentWavBlob(blob);

      // Apply settings stored in the item or default settings
      setRate(item.rate);
      setPitch(item.pitch);
      setVolume(item.volume);
      setSelectedVoice(item.voiceName);

      audioPlayer.playBlob(blob);
      showToast(`Playing historical clip (${item.voiceName})`);
    } catch (err) {
      showToast("Failed to replay audio clip.", "error");
    }
  };

  // Download trigger
  const handleDownloadActive = () => {
    if (currentWavBlob) {
      const filename = `speech-${selectedVoice}-${Date.now()}.wav`;
      downloadWavBlob(currentWavBlob, filename);
      showToast("Audio downloaded as WAV");
    } else {
      showToast("No active audio to download.", "error");
    }
  };

  const handleDownloadHistoryItem = (item: SpeechHistoryItem) => {
    try {
      const blob = pcmToWav(item.audioBase64);
      const filename = `speech-${item.voiceName}-${Date.now()}.wav`;
      downloadWavBlob(blob, filename);
      showToast("History item downloaded as WAV");
    } catch (err) {
      showToast("Failed to download audio file.", "error");
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    if (activeHistoryId === id) {
      audioPlayer.stop();
      setActiveHistoryId(null);
      setCurrentWavBlob(null);
    }
    showToast("Item deleted from history");
  };

  const handleClearAllHistory = () => {
    setHistory([]);
    audioPlayer.stop();
    setActiveHistoryId(null);
    setCurrentWavBlob(null);
    showToast("History cleared completely");
  };

  const handleClearInput = () => {
    setText("");
    showToast("Input text cleared", "info");
  };

  const handleCopyInput = () => {
    if (!text) return;
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        navigator.clipboard
          .writeText(text)
          .then(() => {
            showToast("Text copied to clipboard!");
          })
          .catch(() => {
            showToast("Could not access clipboard in this view.", "info");
          });
      } else {
        showToast("Clipboard not supported.", "info");
      }
    } catch {
      showToast("Could not copy text.", "info");
    }
  };

  const handleResetSettings = () => {
    setRate(1.0);
    setPitch(1.0);
    setVolume(1.0);
    setSelectedVoice("Charon");
    showToast("Voice preferences restored to default", "info");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-6 min-h-screen">
        {/* Top Header Panel */}
        <Header theme={theme} onToggleTheme={handleToggleTheme} />

        {/* Quota Notice Banner if active */}
        {quotaResetCountdown !== null && quotaResetCountdown > 0 && (
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="font-medium">
                Gemini API Free Tier Limit active. Instant local speech synthesis fallback engaged.
              </span>
            </div>
            <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 shrink-0">
              Resets in {quotaResetCountdown}s
            </span>
          </div>
        )}

        {/* Workspace Bento Grid */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-6">
          
          {/* Left Panel: Primary Inputs & Controls (7/12 grid columns) */}
          <section className="lg:col-span-7 flex flex-col gap-5">
            
            {/* Input Module */}
            <TextInput
              text={text}
              onChange={setText}
              onClear={handleClearInput}
              onCopy={handleCopyInput}
              isGenerating={isGenerating}
            />

            {/* Voice Dropdown Selector */}
            <VoiceSelector
              selectedVoice={selectedVoice}
              onChangeVoice={setSelectedVoice}
              isGenerating={isGenerating}
            />

            {/* Config Sliders Panel */}
            <SettingsPanel
              rate={rate}
              pitch={pitch}
              volume={volume}
              onChangeRate={setRate}
              onChangePitch={setPitch}
              onChangeVolume={setVolume}
              onReset={handleResetSettings}
              isGenerating={isGenerating}
            />

            {/* Speak & Control Console */}
            <AudioControls
              isGenerating={isGenerating}
              hasAudio={currentWavBlob !== null}
              isPlaying={audioPlayer.isPlaying}
              isPaused={audioPlayer.isPaused}
              currentTime={audioPlayer.currentTime}
              duration={audioPlayer.duration}
              onSpeak={handleGenerateAndSpeak}
              onPause={() => {
                audioPlayer.pause();
              }}
              onResume={audioPlayer.resume}
              onStop={() => {
                audioPlayer.stop();
              }}
              onReplay={() => {
                audioPlayer.replay();
              }}
              onDownload={handleDownloadActive}
              onSeek={audioPlayer.seek}
              textLength={text.trim().length}
            />
          </section>

          {/* Right Panel: Scrollable History Card (5/12 grid columns) */}
          <aside className="lg:col-span-5 h-full flex flex-col">
            <HistoryList
              history={history}
              onSelectReplay={handleSelectReplay}
              onDownload={handleDownloadHistoryItem}
              onDelete={handleDeleteHistoryItem}
              onClearAll={handleClearAllHistory}
              activeId={activeHistoryId}
            />
          </aside>
        </main>

        {/* Page Footer */}
        <footer className="py-6 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-gray-400 dark:text-gray-500">
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Powering Voice Generation via Gemini 3.1 Flash TTS</span>
          </div>
          <div>
            SpeechMan AI &copy; {new Date().getFullYear()}
          </div>
        </footer>
      </div>

      {/* Dynamic Animated Toasts */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
