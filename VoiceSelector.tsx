import { UserCheck } from "lucide-react";
import { VoiceName, VoiceOption } from "../types";

interface VoiceSelectorProps {
  selectedVoice: VoiceName;
  onChangeVoice: (voice: VoiceName) => void;
  isGenerating: boolean;
}

export const MALE_VOICES: VoiceOption[] = [
  {
    name: "Charon",
    label: "Charon",
    description: "Official Gemini voice. Informative, deep, calm, and authoritative narrator.",
    accent: "US English",
    vibe: "Official Gemini Voice",
  },
  {
    name: "Fenrir",
    label: "Fenrir",
    description: "Official Gemini voice. Deep, husky, passionate, bold, and resonant.",
    accent: "US English",
    vibe: "Official Gemini Voice",
  },
  {
    name: "Puck",
    label: "Puck",
    description: "Official Gemini voice. Upbeat, lively, friendly, conversational, and energetic.",
    accent: "US English",
    vibe: "Official Gemini Voice",
  },
];

export function VoiceSelector({ selectedVoice, onChangeVoice, isGenerating }: VoiceSelectorProps) {
  const getInitials = (name: string) => {
    if (name === "Charon") return "CH";
    if (name === "Puck") return "PU";
    if (name === "Fenrir") return "FE";
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-[10px] font-bold text-slate-500 dark:text-indigo-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
        <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
        Official Gemini Saved Voices
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {MALE_VOICES.map((voice) => {
          const isSelected = voice.name === selectedVoice;
          const initials = getInitials(voice.name);
          return (
            <button
              key={voice.name}
              type="button"
              disabled={isGenerating}
              onClick={() => onChangeVoice(voice.name)}
              className={`flex flex-col items-start text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer disabled:opacity-50 ${
                isSelected
                  ? "border-indigo-500/50 dark:border-indigo-500/30 bg-indigo-50/40 dark:bg-slate-900/80 ring-1 ring-indigo-500/20"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white/30 dark:bg-slate-900/30 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
              }`}
            >
              <div className="flex items-center gap-2.5 w-full mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-sans font-bold text-xs shrink-0 ${
                  isSelected
                    ? "bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-500/35 text-indigo-600 dark:text-indigo-400"
                    : "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-500 dark:text-slate-400"
                }`}>
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate font-sans">
                      {voice.name}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.25 font-sans font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/60">
                      Active
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate">
                    Male • {voice.accent}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold font-sans text-indigo-500 dark:text-indigo-400 mb-1">
                {voice.vibe}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {voice.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
