/**
 * HexaStudy — CSE Academic Companion & Algorithm Tutor Chatbot
 * Multi-Turn Chat, Search Grounding, and Thinking Mode for CSE Undergraduates
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Bot,
  Brain,
  ChevronDown,
  Globe,
  RefreshCw,
  Send,
  Sparkles,
  Terminal,
  Trash2,
  User,
  Zap,
} from 'lucide-react';
import { ChatMessage, Subject } from '../types';

interface AiChatbotProps {
  subjects: Subject[];
  onClose?: () => void;
}

export const AiChatbot: React.FC<AiChatbotProps> = ({ subjects, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content: `Hello! I am your HexaStudy CSE Academic Companion. Ask me to debug algorithm logic, explain OS/DBMS derivations, review exam topics, or search for current syllabus exam trends.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputValue.trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-8), // Send recent context
          useSearch,
          useThinking,
          subjectContext: subjects.map((s) => `${s.name} (${s.code})`).join(', '),
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with ${response.status}`);
      }

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `msg_bot_${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        thinking: data.thinking,
        sources: data.sources,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.warn('Chat request failed:', err);
      setErrorMsg(
        err.message.includes('Failed to fetch')
          ? 'AI Service offline. Running in zero-AI local mode.'
          : err.message
      );
      // Helpful fallback response
      const fallbackMsg: ChatMessage = {
        id: `msg_bot_${Date.now()}`,
        role: 'assistant',
        content: `I am currently operating in offline mode. For ${query}, check your local Study Material Repository or reference the preloaded CSE concept trees under Core CS Theory!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'msg_welcome_new',
        role: 'assistant',
        content: 'Conversation cleared. How can I help with your CSE studies today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[600px] rounded-2xl bg-neutral-900/90 border border-purple-500/20 shadow-2xl overflow-hidden backdrop-blur-md">
      {/* Header */}
      <div className="p-4 px-5 border-b border-white/10 bg-neutral-950/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-purple-950 border border-purple-800/40">
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>CSE Academic Companion</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800/30">
                Optional AI Plug-in
              </span>
            </h3>
            <span className="text-[11px] text-neutral-400">
              Assisting across {subjects.length} active college subjects
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Grounding Toggle */}
          <button
            onClick={() => setUseSearch(!useSearch)}
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
              useSearch
                ? 'bg-sky-950 text-sky-300 border border-sky-800'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
            title="Enable Google Search Grounding for real-time syllabus data"
          >
            <Globe className="w-3 h-3" />
            <span>Search Grounding</span>
          </button>

          {/* Thinking Mode Toggle */}
          <button
            onClick={() => setUseThinking(!useThinking)}
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
              useThinking
                ? 'bg-purple-950 text-purple-300 border border-purple-800'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
            title="Enable High Thinking for complex algorithmic derivations"
          >
            <Brain className="w-3 h-3" />
            <span>High Thinking</span>
          </button>

          <button
            onClick={handleClearChat}
            className="p-1.5 text-neutral-400 hover:text-white bg-neutral-800 rounded transition-colors"
            title="Clear Chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-full bg-purple-950 border border-purple-800/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-purple-400" />
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-2 ${
                  isUser
                    ? 'bg-sky-600 text-white rounded-br-sm'
                    : 'bg-neutral-800/80 text-neutral-200 border border-white/5 rounded-bl-sm'
                }`}
              >
                {/* Thinking Process Accordion (if available) */}
                {msg.thinking && (
                  <div className="p-2 rounded bg-neutral-900/60 border border-purple-900/40 text-[11px] text-purple-300 font-mono">
                    <span className="font-semibold block mb-0.5 flex items-center gap-1">
                      <Brain className="w-3 h-3" />
                      <span>Reasoning Process:</span>
                    </span>
                    <p className="line-clamp-3">{msg.thinking}</p>
                  </div>
                )}

                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Search Grounding Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="pt-2 border-t border-white/10 text-[10px] text-neutral-400 space-y-1">
                    <span className="font-semibold text-neutral-300 block">Grounding Sources:</span>
                    {msg.sources.map((src, i) => (
                      <a
                        key={i}
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-sky-400 hover:underline truncate"
                      >
                        · {src.title || src.url}
                      </a>
                    ))}
                  </div>
                )}

                <div
                  className={`text-[9px] font-mono text-right ${
                    isUser ? 'text-sky-200' : 'text-neutral-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-full bg-sky-950 border border-sky-800/40 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-sky-400" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center text-xs text-neutral-400">
            <div className="w-7 h-7 rounded-full bg-purple-950 flex items-center justify-center shrink-0">
              <RefreshCw className="w-3.5 h-3.5 text-purple-400 animate-spin" />
            </div>
            <span className="font-mono">
              {useThinking ? 'Reasoning deeply with gemini-3.1-pro-preview...' : 'Formulating response...'}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {errorMsg && (
        <div className="px-4 py-2 bg-amber-950/40 border-t border-amber-900/30 text-[11px] text-amber-300 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-neutral-950/60 flex items-center gap-2">
        <input
          type="text"
          placeholder="Ask a CSE question or algorithm explanation (e.g. Explain 2-Phase Locking in DBMS)..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 px-3.5 py-2 text-xs bg-neutral-800 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
        />

        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="p-2 text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-40 rounded-xl transition-colors"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
