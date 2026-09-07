import { Sliders, Volume2, FastForward, Music, RotateCcw } from "lucide-react";
import { motion } from "motion/react";

interface SettingsPanelProps {
  rate: number;
  pitch: number;
  volume: number;
  onChangeRate: (rate: number) => void;
  onChangePitch: (pitch: number) => void;
  onChangeVolume: (volume: number) => void;
  onReset: () => void;
  isGenerating: boolean;
}

export function SettingsPanel({
  rate,
  pitch,
  volume,
  onChangeRate,
  onChangePitch,
  onChangeVolume,
  onReset,
  isGenerating,
}: SettingsPanelProps) {
  return (
    <div className="flex flex-col gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2.5">
        <h3 className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-indigo-500" />
          Voice Modulators
        </h3>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          disabled={isGenerating}
          onClick={onReset}
          className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors uppercase tracking-wider cursor-pointer disabled:opacity-50"
          title="Reset settings to defaults"
        >
          <RotateCcw className="w-3 h-3" />
          Reset Defaults
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Volume Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <Volume2 className="w-3 h-3 text-indigo-500" />
              Volume
            </label>
            <span className="text-[10px] font-mono text-indigo-500 dark:text-indigo-400 font-bold">{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            disabled={isGenerating}
            onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-[8px] text-slate-400 font-mono font-bold uppercase tracking-wider">
            <span>Mute</span>
            <span>Max</span>
          </div>
        </div>

        {/* Speech Rate Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <FastForward className="w-3 h-3 text-indigo-500" />
              Speed (Rate)
            </label>
            <span className="text-[10px] font-mono text-indigo-500 dark:text-indigo-400 font-bold">{rate.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={rate}
            disabled={isGenerating}
            onChange={(e) => onChangeRate(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-[8px] text-slate-400 font-mono font-bold uppercase tracking-wider">
            <span>0.5x Slow</span>
            <span>1.0x Normal</span>
            <span>2.0x Fast</span>
          </div>
        </div>

        {/* Pitch Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <Music className="w-3 h-3 text-indigo-500" />
              Tone Pitch
            </label>
            <span className="text-[10px] font-mono text-indigo-500 dark:text-indigo-400 font-bold">{pitch.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={pitch}
            disabled={isGenerating}
            onChange={(e) => onChangePitch(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-[8px] text-slate-400 font-mono font-bold uppercase tracking-wider">
            <span>0.5x Low</span>
            <span>1.0x Normal</span>
            <span>1.5x High</span>
          </div>
        </div>
      </div>
    </div>
  );
}
