import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Cpu, RefreshCw } from 'lucide-react';
import { sendMessage, resetChat } from '../services/geminiService';

export default function ChatBot({ variant = "floating", isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'Hello! I\'m your SpareHub assistant. How can I help you find the right spare parts today?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await sendMessage(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'error', 
        content: err.message 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    resetChat();
    setMessages([
      { 
        role: 'assistant', 
        content: 'Chat reset. How can I help you find spare parts today?' 
      }
    ]);
  };

  const containerClass = variant === "floating" 
    ? "w-80 h-[450px]" 
    : "w-full h-full min-h-[500px]";

  if (variant === "floating" && !isOpen) return null;

  return (
    <div className={`bg-[#0b0b0b] ${containerClass} shadow-2xl border border-zinc-800 flex flex-col animate-in slide-in-from-bottom-5 duration-300`}>
      {/* Header */}
      <div className="bg-zinc-900 p-4 flex justify-between items-center border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-3">
          <Cpu size={16} className="text-red-600 animate-pulse" />
          <span className="text-white text-[10px] font-black uppercase tracking-widest">Nexus_Core v2.4</span>
          <span className="text-[8px] text-green-500 font-mono">ONLINE</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleReset}
            className="p-1.5 hover:bg-zinc-800 transition-colors group"
            title="Reset Chat"
          >
            <RefreshCw size={14} className="text-zinc-500 group-hover:text-white" />
          </button>
          {variant === "floating" && (
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-zinc-800 transition-colors group"
            >
              <X size={14} className="text-zinc-500 group-hover:text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`animate-in fade-in duration-200 ${
              msg.role === 'user' 
                ? 'ml-6' 
                : msg.role === 'error' 
                  ? 'mx-2' 
                  : 'mr-6'
            }`}
          >
            <div className={`text-[8px] font-black uppercase tracking-widest mb-1 ${
              msg.role === 'user' 
                ? 'text-red-600 text-right' 
                : msg.role === 'error'
                  ? 'text-yellow-500'
                  : 'text-zinc-600'
            }`}>
              {msg.role === 'user' ? '[You]' : msg.role === 'error' ? '[Error]' : '[Assistant]'}
            </div>
            <div className={`text-[11px] font-mono leading-relaxed p-3 border ${
              msg.role === 'user'
                ? 'bg-red-600/10 border-red-600/30 text-white'
                : msg.role === 'error'
                  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-200'
                  : 'bg-zinc-900/50 border-zinc-800 text-zinc-300'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="mr-6 animate-in fade-in duration-200">
            <div className="text-[8px] font-black uppercase tracking-widest mb-1 text-zinc-600">
              [Assistant]
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 p-3 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono uppercase">Processing...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-black border-t border-zinc-900 shrink-0">
        <div className="relative flex items-center gap-2">
          <input 
            ref={inputRef}
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ENTER COMMAND..." 
            disabled={isLoading}
            className="flex-1 bg-zinc-900 border border-zinc-800 p-3 text-[10px] font-bold uppercase outline-none focus:border-red-600 transition-colors disabled:opacity-50 placeholder:text-zinc-700"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-red-600 p-3 hover:bg-red-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send size={14} className="text-white" />
          </button>
        </div>
        <div className="mt-2 text-[7px] text-zinc-700 uppercase tracking-widest font-bold">
          Press Enter to Send // AI-Powered by Gemini
        </div>
      </div>
    </div>
  );
}
