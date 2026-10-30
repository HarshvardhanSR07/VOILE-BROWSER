import React, { useRef } from 'react';
import { Paperclip, Send } from 'lucide-react';

interface AdaLComposerProps {
  input: string;
  setInput: (val: string) => void;
  onSend: (e: React.FormEvent) => void;
  isTyping: boolean;
}

export const AdaLComposer: React.FC<AdaLComposerProps> = ({
  input,
  setInput,
  onSend,
  isTyping
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend(e);
    }
  };

  return (
    <form onSubmit={onSend} className="w-full">
      <div className="relative flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#060C18] border border-sky-500/25 focus-within:border-sky-400/60 focus-within:ring-1 focus-within:ring-sky-500/20 transition-all shadow-inner">
        {/* Attachment Paperclip Button */}
        <button
          type="button"
          className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg focus:outline-none"
          title="Attach context or file"
        >
          <Paperclip className="w-4 h-4 rotate-45" />
        </button>

        {/* Text Input */}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask AdaL anything..."
          disabled={isTyping}
          className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none select-text disabled:opacity-50"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="w-8 h-8 rounded-full bg-sky-500 hover:bg-sky-400 text-white flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/30 disabled:opacity-30 disabled:hover:bg-sky-500 disabled:shadow-none transition-all active:scale-95 focus:outline-none"
          title="Send message"
        >
          <Send className="w-3.5 h-3.5 -ml-0.5" />
        </button>
      </div>
    </form>
  );
};
