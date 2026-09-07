import { Play, Pause, Square, RotateCcw, Download, HelpCircle } from "lucide-react";
import { motion } from "motion/react";

interface AudioControlsProps {
  isGenerating: boolean;
  hasAudio: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  onSpeak: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReplay: () => void;
  onDownload: () => void;
  onSeek: (time: number) => void;
  textLength: number;
}

export function AudioControls({
  isGenerating,
  hasAudio,
  isPlaying,
  isPaused,
  currentTime,
  duration,
  onSpeak,
  onPause,
  onResume,
  onStop,
  onReplay,
  onDownload,
  onSeek,
  textLength,
}: AudioControlsProps) {
  // Format time (e.g. 0:05)
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl bg-indigo-600/5 dark:bg-indigo-600/10 border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
      {/* Playback Progress (Only show if we have active audio) */}
      {hasAudio && (
        <div className="flex flex-col gap-1.5 w-full">
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono font-bold uppercase tracking-wider">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.05"
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="w-full h-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 accent-indigo-500 cursor-pointer"
          />
        </div>
      )}

      {/* Primary Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          {/* Speak / Generate Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            disabled={isGenerating || textLength === 0}
            onClick={onSpeak}
            className="w-14 h-14 bg-indigo-500 hover:bg-indigo-400 text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-transform active:scale-95 disabled:bg-slate-200 dark:disabled:bg-slate-800/40 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:shadow-none cursor-pointer shrink-0"
            title="Generate and Speak"
          >
            {isGenerating ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </motion.button>

          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              {isGenerating ? "Synthesizing..." : "Synthesize Speech"}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {isGenerating ? "Connecting to Gemini 3.1 Flash..." : "Click button to convert input text"}
            </p>
          </div>
        </div>

        {/* Playback Controls (Speak, Pause, Resume, Stop, Replay, Download) */}
        {hasAudio && !isGenerating && (
          <div className="flex items-center gap-2 shrink-0">
            {/* Play/Pause Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={isPlaying ? onPause : isPaused ? onResume : onReplay}
              className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-all border border-slate-200/40 dark:border-slate-700/60 cursor-pointer"
              title={isPlaying ? "Pause speech" : "Resume speech"}
            >
              {isPlaying ? (
                <Pause className="w-4.5 h-4.5 fill-current" />
              ) : (
                <Play className="w-4.5 h-4.5 fill-current" />
              )}
            </motion.button>

            {/* Stop Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onStop}
              className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/20 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-all border border-slate-200/40 dark:border-slate-700/60 cursor-pointer"
              title="Stop speech"
            >
              <Square className="w-4.5 h-4.5 fill-current" />
            </motion.button>

            {/* Replay Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onReplay}
              className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-all border border-slate-200/40 dark:border-slate-700/60 cursor-pointer"
              title="Replay from start"
            >
              <RotateCcw className="w-4.5 h-4.5" />
            </motion.button>

            {/* Download Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onDownload}
              className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200/40 dark:border-slate-700/60"
              title="Download Audio"
            >
              <Download className="w-4 h-4 text-indigo-500" />
              Download .WAV
            </motion.button>
          </div>
        )}
      </div>

      {textLength === 0 && !hasAudio && (
        <p className="text-[10px] font-sans text-slate-400 dark:text-slate-500 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
          Enter some text in the text input box to unlock speech generation.
        </p>
      )}
    </div>
  );
}
