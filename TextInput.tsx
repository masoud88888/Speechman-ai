import { ChangeEvent } from "react";
import { Copy, Trash2, Keyboard } from "lucide-react";
import { motion } from "motion/react";

interface TextInputProps {
  text: string;
  onChange: (text: string) => void;
  onClear: () => void;
  onCopy: () => void;
  isGenerating: boolean;
}

export function TextInput({ text, onChange, onClear, onCopy, isGenerating }: TextInputProps) {
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-[10px] font-bold text-slate-500 dark:text-indigo-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
        <Keyboard className="w-3.5 h-3.5 text-indigo-500" />
        English Text Input
      </label>

      <div className="relative flex flex-col bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 backdrop-blur-sm group transition-all hover:border-slate-300 dark:hover:border-slate-700 shadow-sm focus-within:border-slate-400 dark:focus-within:border-slate-600 focus-within:ring-1 focus-within:ring-slate-300 dark:focus-within:ring-slate-700">
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="Type or paste your English text here..."
          disabled={isGenerating}
          rows={6}
          className="w-full bg-transparent border-0 outline-none resize-none font-sans text-sm md:text-base text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 leading-relaxed disabled:opacity-70 focus:ring-0"
          id="tts-textarea"
        />

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-150 dark:border-slate-800/60">
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800/80 rounded-full text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">
              {charCount} {charCount === 1 ? "Character" : "Characters"}
            </span>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800/80 rounded-full text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">
              {wordCount} {wordCount === 1 ? "Word" : "Words"}
            </span>
          </div>

          <div className="flex gap-2">
            {text && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={onCopy}
                  disabled={isGenerating}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-100 transition-colors cursor-pointer bg-transparent border border-transparent disabled:opacity-40"
                  title="Copy current input text"
                >
                  <Copy className="w-4 h-4" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={onClear}
                  disabled={isGenerating}
                  className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg text-rose-500 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors cursor-pointer bg-transparent border border-transparent disabled:opacity-40"
                  title="Clear input"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
