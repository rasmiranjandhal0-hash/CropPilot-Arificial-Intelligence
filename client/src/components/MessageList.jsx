import React, { useEffect, useRef } from 'react';
import { MessageItem } from './MessageItem';
import { Bot, Sparkles } from 'lucide-react';

export function MessageList({ messages, isSending, onSelectPrompt }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const starterPrompts = [
    'Explain quantum computing in simple terms',
    'Write a concise summary of the Renaissance',
    'Help me design a RESTful API in Express',
    'What are best practices for React performance?',
  ];

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 p-0.5 shadow-2xl shadow-teal-500/20 mb-6">
          <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
            <Bot className="w-8 h-8 text-teal-400" />
          </div>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
          Start a new conversation
        </h2>
        <p className="text-sm text-slate-400 max-w-md mb-8">
          ChatPilot is ready to assist you. Ask questions, brainstorm ideas, analyze code, or write content.
        </p>

        {/* Suggestion prompt cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl w-full text-left">
          {starterPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => onSelectPrompt && onSelectPrompt(prompt)}
              className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-teal-500/40 text-slate-300 hover:text-white text-xs transition-all flex items-center justify-between group cursor-pointer"
            >
              <span className="truncate pr-2">{prompt}</span>
              <Sparkles className="w-3.5 h-3.5 text-teal-500/60 group-hover:text-teal-400 shrink-0" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
      {messages.map((msg) => (
        <MessageItem key={msg.id || msg.tempId} message={msg} />
      ))}

      {/* Thinking Indicator */}
      {isSending && (
        <div className="flex w-full justify-start gap-3 items-center animate-in fade-in duration-300">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 p-0.5 shrink-0 shadow-md shadow-teal-500/10">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Bot className="w-4 h-4 text-teal-400" />
            </div>
          </div>
          <div className="px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 rounded-tl-none flex items-center gap-2">
            <span className="text-xs font-medium text-teal-300">Gemini is thinking</span>
            <span className="flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" />
            </span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
