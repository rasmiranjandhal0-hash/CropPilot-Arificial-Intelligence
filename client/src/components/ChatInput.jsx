import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal } from 'lucide-react';

export function ChatInput({ onSendMessage, disabled }) {
  const [content, setContent] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  // Auto-grow textarea height up to a max
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [content]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || disabled) return;

    onSendMessage(trimmed);
    setContent('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-3 sm:p-4 bg-slate-900/60 border-t border-slate-800 backdrop-blur-md">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative flex flex-col gap-2">
        <div className="relative flex items-end bg-slate-950 border border-slate-700/80 rounded-2xl focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all shadow-lg shadow-black/20">
          <textarea
            ref={textareaRef}
            id="chat-input-textarea"
            rows={1}
            disabled={disabled}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? 'Waiting for Gemini to respond...' : 'Type your message here...'}
            className="w-full resize-none py-3.5 pl-4 pr-14 bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed max-h-44 overflow-y-auto"
          />

          <button
            type="submit"
            id="chat-send-btn"
            disabled={disabled || !content.trim()}
            className="absolute right-2.5 bottom-2.5 p-2 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:bg-slate-800 text-white disabled:text-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-teal-500/20 cursor-pointer"
            aria-label="Send message"
          >
            <SendHorizontal className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span>ChatPilot powered by Google Gemini</span>
          <span>
            <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">Enter</kbd> to send,{' '}
            <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">Shift + Enter</kbd> for newline
          </span>
        </div>
      </form>
    </div>
  );
}
