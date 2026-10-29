import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { MessageList } from '../components/MessageList';
import { ChatInput } from '../components/ChatInput';
import { Toast } from '../components/Toast';
import { api } from '../lib/api';
import { Menu, MessageSquare, Bot, AlertTriangle } from 'lucide-react';

export default function ChatPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showError = (message, title = 'Error') => {
    setToast({
      type: 'error',
      title,
      message,
    });
  };

  // 1. Load conversation list for the sidebar
  const loadConversations = useCallback(async () => {
    try {
      const data = await api.getConversations();
      setConversations(data.conversations || []);
    } catch (err) {
      console.error('Failed to load conversations:', err);
      showError(err.message || 'Could not fetch conversation history.', 'Failed to load sidebar');
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // 2. Load messages whenever conversationId in URL changes
  useEffect(() => {
    if (!conversationId) {
      // New / empty chat state
      setCurrentConversation(null);
      setMessages([]);
      return;
    }

    let isCancelled = false;

    const loadActiveChat = async () => {
      try {
        setIsLoadingMessages(true);
        const data = await api.getConversation(conversationId);
        if (!isCancelled) {
          setCurrentConversation(data.conversation);
          setMessages(data.messages || []);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Failed to load active conversation:', err);
          showError(err.message || 'Could not open conversation.', 'Conversation Error');
          navigate('/', { replace: true });
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingMessages(false);
        }
      }
    };

    loadActiveChat();

    return () => {
      isCancelled = true;
    };
  }, [conversationId, navigate]);

  // 3. Handle sending a new message
  const handleSendMessage = async (text) => {
    if (!text.trim() || isSending) return;

    const tempUserMessage = {
      tempId: 'temp-' + Date.now(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };

    // Optimistically add user message to list
    setMessages((prev) => [...prev, tempUserMessage]);
    setIsSending(true);

    try {
      const response = await api.sendChatMessage(text, conversationId || null);
      const { conversation, userMessage, assistantMessage } = response;

      // Replace optimistic message and append assistant reply
      setMessages((prev) => [
        ...prev.filter((m) => m.tempId !== tempUserMessage.tempId),
        userMessage,
        assistantMessage,
      ]);

      // If it was a new conversation, navigate to the newly created conversation URL
      if (!conversationId && conversation?.id) {
        setCurrentConversation(conversation);
        navigate(`/chat/${conversation.id}`, { replace: true });
      }

      // Refresh sidebar conversation list
      loadConversations();
    } catch (err) {
      console.error('Failed to send message:', err);
      // Remove optimistic message if send failed
      setMessages((prev) => prev.filter((m) => m.tempId !== tempUserMessage.tempId));
      showError(err.message || 'Failed to get response from Gemini.', 'Chat Error');
    } finally {
      setIsSending(false);
    }
  };

  // 4. Handle deleting a conversation
  const handleDeleteConversation = async (id) => {
    try {
      await api.deleteConversation(id);
      // Optimistically remove from state
      setConversations((prev) => prev.filter((c) => c.id !== id));

      if (conversationId === id) {
        navigate('/', { replace: true });
      }

      setToast({
        type: 'success',
        title: 'Deleted',
        message: 'Conversation removed.',
        duration: 3000,
      });
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      showError(err.message || 'Could not delete conversation.', 'Delete Failed');
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 overflow-hidden font-sans">
      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        onDeleteConversation={handleDeleteConversation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Navbar Header */}
        <header className="h-14 border-b border-slate-800 bg-slate-900/40 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 shrink-0 z-10">
          <div className="flex items-center gap-3">
            {/* Hamburger button for mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden cursor-pointer"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <Bot className="w-5 h-5 text-teal-400 shrink-0" />
              <h1 className="text-sm font-semibold text-slate-100 truncate">
                {currentConversation?.title || 'New Conversation'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Gemini Online
            </span>
          </div>
        </header>

        {/* Chat Body */}
        {isLoadingMessages ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
            <div className="w-7 h-7 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
            <p className="text-xs">Loading messages...</p>
          </div>
        ) : (
          <MessageList
            messages={messages}
            isSending={isSending}
            onSelectPrompt={(prompt) => handleSendMessage(prompt)}
          />
        )}

        {/* Input box */}
        <ChatInput onSendMessage={handleSendMessage} disabled={isSending} />
      </main>
    </div>
  );
}
