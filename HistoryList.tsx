import { SpeechHistoryItem } from "../types";
import { Play, Download, Trash2, Headphones, Calendar, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HistoryListProps {
  history: SpeechHistoryItem[];
  onSelectReplay: (item: SpeechHistoryItem) => void;
  onDownload: (item: SpeechHistoryItem) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  activeId: string | null;
}

export function HistoryList({
  history,
  onSelectReplay,
  onDownload,
  onDelete,
  onClearAll,
  activeId,
}: HistoryListProps) {
  return (
    <div className="flex flex-col gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/30 backdrop-blur-sm h-full flex-1 min-h-[400px]">
      <div className="p-1 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 pb-3">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Headphones className="w-3.5 h-3.5 text-indigo-500" />
          History Log
          <span className="text-[10px] px-1.5 py-0.25 font-mono font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/60 ml-1">
            {history.length}/20
          </span>
        </h2>
        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-[10px] font-bold text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors uppercase tracking-wider cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-1 max-h-[500px] flex flex-col">
        <AnimatePresence initial={false}>
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <Sparkles className="w-7 h-7 text-indigo-500/30 dark:text-indigo-500/20 mb-3 animate-pulse" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                No Speeches Yet
              </p>
              <p className="text-[10px] font-sans text-slate-400/80 dark:text-slate-500/80 mt-1 max-w-[200px] leading-relaxed">
                Generated audios will be saved locally in browser memory.
              </p>
            </div>
          ) : (
            history.map((item) => {
              const isActive = item.id === activeId;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`p-3 hover:bg-slate-100/40 dark:hover:bg-slate-800/40 border-b border-slate-150 dark:border-slate-800/50 group transition-colors ${
                    isActive
                      ? "bg-indigo-500/5 dark:bg-indigo-500/10"
                      : "bg-transparent"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1.5 gap-2">
                    <span className="text-[9px] text-indigo-500 dark:text-indigo-400 font-mono font-bold uppercase">
                      {item.voiceName} &bull; {item.date}
                    </span>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      {/* Replay */}
                      <button
                        type="button"
                        onClick={() => onSelectReplay(item)}
                        className={`p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer ${
                          isActive ? "text-indigo-500" : "text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                        }`}
                        title="Replay this speech"
                      >
                        <Play className="w-3 h-3 fill-current" />
                      </button>

                      {/* Download */}
                      <button
                        type="button"
                        onClick={() => onDownload(item)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                        title="Download WAV speech"
                      >
                        <Download className="w-3 h-3" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-rose-950/40 rounded text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic line-clamp-2">
                    "{item.text}"
                  </p>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* User Preference Summary Footer Block */}
      <div className="p-3 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/80 rounded-xl shrink-0">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Auto-Save Persistent</span>
        </div>
        <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">
          Speech preferences & histories are stored locally in browser storage.
        </p>
      </div>
    </div>
  );
}
