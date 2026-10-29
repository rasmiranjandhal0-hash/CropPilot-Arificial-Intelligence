import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User } from 'lucide-react';

export function MessageItem({ message }) {
  const isUser = message.role === 'user';

  const formattedTime = message.created_at
    ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className={`flex w-full gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Bot Avatar (only on assistant messages) */}
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 p-0.5 shrink-0 shadow-md shadow-teal-500/10 mt-1">
          <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
            <Bot className="w-4 h-4 text-teal-400" />
          </div>
        </div>
      )}

      {/* Bubble Container */}
      <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm shadow-sm ${
            isUser
              ? 'bg-teal-600 text-white rounded-tr-none'
              : 'bg-slate-900/90 border border-slate-800 text-slate-100 rounded-tl-none'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          ) : (
            <div className="markdown-content">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Timestamp */}
        {formattedTime && (
          <span className="text-[10px] text-slate-500 mt-1 px-1">
            {formattedTime}
          </span>
        )}
      </div>

      {/* User Avatar (only on user messages) */}
      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 p-0.5 shrink-0 flex items-center justify-center text-slate-300 mt-1">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
