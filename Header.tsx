import { Sun, Moon, Volume2 } from "lucide-react";
import { motion } from "motion/react";

interface HeaderProps {
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export function Header({ theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white/60 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800/80 backdrop-blur-md z-10 shrink-0 w-full rounded-b-2xl shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
          <Volume2 className="w-4.5 h-4.5 text-white animate-pulse" />
        </div>
        <div>
          <h1 className="text-base md:text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
            SpeechMan AI
          </h1>
          <p className="hidden md:block text-[10px] font-sans text-slate-500 dark:text-slate-500">
            High-fidelity male audio synthesis
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-200/50 dark:border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">API: GEMINI-3.1-TTS</span>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleTheme}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-all cursor-pointer bg-white/80 dark:bg-slate-900/50"
          aria-label="Toggle visual theme"
        >
          {theme === "light" ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </motion.button>
      </div>
    </header>
  );
}
