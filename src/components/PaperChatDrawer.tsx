import React, { useState } from 'react';
import { PaperSummary, ChatMessage, ApiConfig } from '../types';
import { MessageSquare, Send, Sparkles, X, Bot, User, RefreshCw } from 'lucide-react';

interface PaperChatDrawerProps {
  paperSummary: PaperSummary;
  isOpen: boolean;
  onClose: () => void;
  apiConfig: ApiConfig;
}

export const PaperChatDrawer: React.FC<PaperChatDrawerProps> = ({ paperSummary, isOpen, onClose, apiConfig }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I'm your research assistant for "${paperSummary?.title || 'this paper'}". Ask me any follow-up question about the paper's methodology, results, code, or applications!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsSending(true);

    try {
      const response = await fetch('/api/chat-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMsg.text,
          paperSummary,
          chatHistory: messages,
          apiConfig
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get answer');
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.answer || 'I answered based on the paper context.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `Sorry, I encountered an error answering that: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };


  const SUGGESTED_QUESTIONS = [
    "Explain the core innovation in simple terms",
    "What are the main limitations or trade-offs?",
    "How does this compare with baseline models?",
    "What practical applications does this enable?"
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-[#1A1A1A]/40 backdrop-blur-xs transition-opacity animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-[#FDFCFB] h-full shadow-2xl flex flex-col border-l border-[#1A1A1A]/10"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1A1A1A]/10 flex items-center justify-between bg-[#F9F7F2]">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 rounded-xl bg-[#A67C52]/10 text-[#A67C52]">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#A67C52] block mb-0.5">
                Editorial Q&A
              </span>
              <h3 className="font-serif text-sm sm:text-base text-[#1A1A1A]">
                Paper Interactive Assistant
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5 transition-colors cursor-pointer"
            id="btn-close-chat-drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-[#A67C52] text-white flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
                  AI
                </div>
              )}

              <div className={`max-w-[82%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#1A1A1A] text-white rounded-br-none shadow-xs'
                  : 'bg-[#F9F7F2] text-[#1A1A1A] rounded-bl-none border border-[#1A1A1A]/10 shadow-xs'
              }`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <span className={`block text-[9px] uppercase tracking-wider mt-1.5 text-right ${msg.sender === 'user' ? 'text-[#A67C52]' : 'text-[#1A1A1A]/40'}`}>
                  {msg.timestamp}
                </span>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isSending && (
            <div className="flex gap-2 items-center text-xs font-serif italic text-[#A67C52]">
              <Bot className="w-4 h-4 animate-spin text-[#A67C52]" />
              <span>Analyzing paper context...</span>
            </div>
          )}
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-5 py-3 bg-[#F9F7F2] border-t border-[#1A1A1A]/10 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                disabled={isSending}
                className="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold bg-white text-[#1A1A1A] border border-[#1A1A1A]/10 hover:border-[#A67C52] hover:text-[#A67C52] transition-colors cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[#1A1A1A]/10 bg-[#FDFCFB] flex gap-2">
          <input
            type="text"
            placeholder="Ask a question about this paper..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 px-4 py-2.5 rounded-full border border-[#1A1A1A]/15 bg-[#F9F7F2] text-[#1A1A1A] text-xs sm:text-sm focus:outline-hidden focus:border-[#A67C52]"
            id="input-chat-query"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isSending || !inputQuery.trim()}
            className="px-5 py-2.5 rounded-full bg-[#1A1A1A] hover:bg-[#A67C52] text-white text-xs font-bold transition-colors flex items-center justify-center disabled:opacity-50 cursor-pointer shadow-xs"
            id="btn-send-chat-query"
          >
            {isSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </div>
  );
};
