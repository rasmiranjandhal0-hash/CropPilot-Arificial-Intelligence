import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  MessageSquare,
  Trash2,
  LogOut,
  Bot,
  User,
  X,
} from 'lucide-react';

export function Sidebar({
  conversations,
  onDeleteConversation,
  isOpen,
  onClose,
}) {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleNewChat = () => {
    navigate('/');
    if (onClose) onClose();
  };

  const handleSelectChat = (id) => {
    navigate(`/chat/${id}`);
    if (onClose) onClose();
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    onDeleteConversation(id);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand & New Chat Header */}
        <div className="p-4 border-b border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <Bot className="w-5 h-5" />
              </div>
              <span className="font-bold tracking-tight text-white text-base">ChatPilot</span>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            id="new-chat-btn"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 hover:text-teal-200 text-sm font-medium transition-all group cursor-pointer"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Conversation History List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <div className="px-2 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Recent Conversations
          </div>

          {conversations.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-slate-500">
              No previous conversations yet. Start a new chat!
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conversationId === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectChat(conv.id)}
                  className={`group relative flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-teal-300 font-medium'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MessageSquare
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-400'
                      }`}
                    />
                    <span className="truncate">{conv.title || 'Untitled Chat'}</span>
                  </div>

                  {/* Delete conversation button */}
                  <button
                    onClick={(e) => handleDelete(e, conv.id)}
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 transition-all shrink-0 cursor-pointer"
                    title="Delete conversation"
                    aria-label={`Delete ${conv.title}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* User Profile & Logout Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center justify-between gap-3 px-2 py-2 rounded-xl bg-slate-800/50 border border-slate-700/40">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-200 truncate">
                  {user?.email || 'Authenticated User'}
                </p>
                <p className="text-[10px] text-teal-400 truncate">Online</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              id="logout-btn"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
