import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Send, Sparkles, Bot, FileText, Download, HelpCircle, 
  Check, RefreshCw, MessageSquare, ChevronRight, Copy, Terminal, Zap, BookOpen
} from 'lucide-react';
import { PaperSummary, ApiConfig } from '../types';

interface AiAssistantSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  paperSummary: PaperSummary;
  apiConfig: ApiConfig;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AiAssistantSidebar: React.FC<AiAssistantSidebarProps> = ({
  isOpen,
  onClose,
  paperSummary,
  apiConfig
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedTextId, setCopiedTextId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message
  useEffect(() => {
    if (paperSummary && messages.length === 0) {
      setMessages([
        {
          id: 'welcome-1',
          sender: 'assistant',
          text: `Hello! I'm your **Paper Copilot & AI Research Assistant** for *"${paperSummary.title}"*.\n\nAsk me anything about the methodology, benchmark results, limitations, or strategic takeaways. You can also generate and download a complete **.doc Summary Document** at any time!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [paperSummary]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (queryToSend?: string) => {
    const text = queryToSend || inputQuery;
    if (!text.trim() || loading) return;

    const userMsgId = `user-${Date.now()}`;
    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMsgId,
        sender: 'user',
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];

    setMessages(newMessages);
    if (!queryToSend) setInputQuery('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuestion: text.trim(),
          paperTitle: paperSummary.title,
          paperSummary,
          chatHistory: newMessages.slice(-6).map(m => `${m.sender}: ${m.text}`),
          apiConfig
        })
      });

      const data = await response.json();
      const aiText = data.answer || "I have analyzed the research paper regarding your request.";

      setMessages(prev => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          text: aiText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error('AI assistant query error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `assistant-err-${Date.now()}`,
          sender: 'assistant',
          text: `Here is the grounded context for *"${text}"* in this paper:\n\n- **Executive Focus**: ${paperSummary.tldr}\n- **Primary Finding**: ${paperSummary.executiveSummary.slice(0, 200)}...`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Download .doc formatted Document
  const handleDownloadDoc = () => {
    const paperTitleClean = paperSummary.title || 'Research_Paper';
    const authorsStr = Array.isArray(paperSummary.authors) ? paperSummary.authors.join(', ') : paperSummary.authors || 'N/A';

    const docHtml = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${paperTitleClean} - Executive Summary Report</title>
  <style>
    body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.5; color: #1A1A1A; padding: 20px; }
    h1 { color: #8C643E; font-size: 22pt; font-family: 'Georgia', serif; border-bottom: 2pt solid #A67C52; padding-bottom: 6px; margin-bottom: 12px; }
    h2 { color: #1A1A1A; font-size: 14pt; font-family: 'Georgia', serif; border-bottom: 1pt solid #DDD; padding-bottom: 4px; margin-top: 18px; }
    h3 { color: #8C643E; font-size: 12pt; margin-top: 12px; }
    .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; background: #F9F7F2; }
    .meta-table td { border: 1pt solid #E0DCD3; padding: 6pt; font-size: 10pt; }
    .meta-label { font-weight: bold; color: #8C643E; width: 25%; }
    .tldr-box { background: #F4EFE6; border-left: 4pt solid #A67C52; padding: 10pt; margin: 12pt 0; font-style: italic; }
    ul { margin-left: 18pt; }
    li { margin-bottom: 4pt; }
    .metric-table { width: 100%; border-collapse: collapse; margin-top: 10pt; }
    .metric-table th { background: #1A1A1A; color: #FFF; padding: 6pt; text-align: left; font-size: 10pt; }
    .metric-table td { border: 1pt solid #DDD; padding: 6pt; font-size: 10pt; }
    .qa-box { background: #F9FAFB; border: 1pt solid #E5E7EB; border-radius: 6pt; padding: 10pt; margin-bottom: 10pt; }
    .qa-q { font-weight: bold; color: #8C643E; margin-bottom: 4pt; }
  </style>
</head>
<body>
  <h1>${paperTitleClean}</h1>
  <p style="font-style: italic; color: #666; font-size: 10pt;">Comprehensive Academic Summary & AI Research Briefing Report</p>

  <table class="meta-table">
    <tr>
      <td class="meta-label">Authors</td>
      <td>${authorsStr}</td>
    </tr>
    <tr>
      <td class="meta-label">Field & Domain</td>
      <td>${paperSummary.field || 'Computer Science / AI'}</td>
    </tr>
    <tr>
      <td class="meta-label">Publication Year</td>
      <td>${paperSummary.publicationYear || '2026'}</td>
    </tr>
    <tr>
      <td class="meta-label">Institution</td>
      <td>${paperSummary.institution || 'Academic Research Center'}</td>
    </tr>
    <tr>
      <td class="meta-label">Citation</td>
      <td>${paperSummary.citation || paperTitleClean}</td>
    </tr>
  </table>

  <h2>1. Executive TL;DR & Core Summary</h2>
  <div class="tldr-box">
    <strong>TL;DR:</strong> ${paperSummary.tldr}
  </div>
  <p>${paperSummary.executiveSummary}</p>

  <h2>2. Key Takeaways & Innovations</h2>
  <ul>
    ${paperSummary.keyTakeaways?.map(k => `<li><strong>[${k.category}] ${k.title}:</strong> ${k.description}</li>`).join('') || ''}
  </ul>

  <h2>3. Methodological Pipeline & Architecture</h2>
  <ol>
    ${paperSummary.pipelineSteps?.map(p => `<li><strong>Step ${p.stepNumber} - ${p.name}:</strong> ${p.description}</li>`).join('') || ''}
  </ol>

  <h2>4. Empirical Results & Benchmark Metrics</h2>
  <table class="metric-table">
    <thead>
      <tr>
        <th>Metric Label</th>
        <th>Value</th>
        <th>Evaluation Details</th>
      </tr>
    </thead>
    <tbody>
      ${paperSummary.keyMetrics?.map(m => `
        <tr>
          <td><strong>${m.label}</strong></td>
          <td style="color: #8C643E; font-weight: bold;">${m.value}</td>
          <td>${m.description}</td>
        </tr>
      `).join('') || ''}
    </tbody>
  </table>

  ${messages.length > 1 ? `
  <h2>5. AI Copilot Research Q&A Transcript</h2>
  ${messages.filter(m => m.id !== 'welcome-1').map(m => `
    <div class="qa-box">
      <div class="qa-q">${m.sender === 'user' ? 'Question' : 'AI Copilot Answer'}:</div>
      <div>${m.text.replace(/\n/g, '<br/>')}</div>
    </div>
  `).join('')}
  ` : ''}

  <hr style="margin-top: 30pt; border: none; border-top: 1pt solid #CCC;" />
  <p style="font-size: 9pt; color: #999; text-align: center;">Generated via NotebookLM Research Paper Summarizer Studio • ${new Date().toLocaleDateString()}</p>
</body>
</html>`;

    const blob = new Blob(['\ufeff' + docHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paperTitleClean.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}_Summary.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTextId(id);
    setTimeout(() => setCopiedTextId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1A1A]/40 backdrop-blur-xs flex justify-end transition-opacity animate-fade-in" onClick={onClose}>
      <div 
        className="w-full sm:w-[420px] bg-white h-full border-l border-[#1A1A1A]/15 shadow-2xl flex flex-col justify-between animate-slideInRight"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Bar */}
        <div className="p-3.5 sm:p-4 bg-[#1A1A1A] text-white flex items-center justify-between gap-2.5 sm:gap-3 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#A67C52] text-white flex items-center justify-center font-bold flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-[#A67C52]">
                  Browser Copilot
                </span>
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h3 className="font-serif text-xs sm:text-sm font-medium text-white truncate max-w-[140px] sm:max-w-[200px]">
                {paperSummary.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Download .doc Button */}
            <button
              onClick={handleDownloadDoc}
              className="px-2 sm:px-2.5 py-1.5 rounded-lg bg-[#A67C52] hover:bg-[#8C643E] text-white text-[9px] uppercase tracking-wider font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
              title="Download formatted .doc Microsoft Word summary file"
              id="btn-export-doc-file"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export .doc</span>
              <span className="sm:hidden">.doc</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

      {/* Suggested Action Pills */}
      <div className="px-3 py-2.5 bg-[#F9F7F2] border-b border-[#1A1A1A]/10 flex items-center gap-1.5 overflow-x-auto text-[10px] font-bold">
        <button
          onClick={() => handleSendMessage("Explain the key breakthrough and methodology simply")}
          className="px-2.5 py-1 rounded-full bg-white border border-[#1A1A1A]/15 text-[#1A1A1A] hover:bg-[#A67C52] hover:text-white transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
        >
          💡 Explain Methodology
        </button>
        <button
          onClick={() => handleSendMessage("What are the key benchmark metric gains?")}
          className="px-2.5 py-1 rounded-full bg-white border border-[#1A1A1A]/15 text-[#1A1A1A] hover:bg-[#A67C52] hover:text-white transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
        >
          📊 Benchmark Metrics
        </button>
        <button
          onClick={() => handleSendMessage("What are the core limitations or open research questions?")}
          className="px-2.5 py-1 rounded-full bg-white border border-[#1A1A1A]/15 text-[#1A1A1A] hover:bg-[#A67C52] hover:text-white transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
        >
          ⚠️ Paper Limitations
        </button>
        <button
          onClick={() => handleSendMessage("Draft a 3-bullet executive pitch for this paper")}
          className="px-2.5 py-1 rounded-full bg-white border border-[#1A1A1A]/15 text-[#1A1A1A] hover:bg-[#A67C52] hover:text-white transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
        >
          🚀 Executive Pitch
        </button>
      </div>

      {/* Chat Conversation Scroll View */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF9F6]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1`}
          >
            <div className="flex items-center gap-1.5 px-1 text-[9px] uppercase font-bold text-[#1A1A1A]/50">
              <span>{msg.sender === 'user' ? 'You' : 'Paper Copilot'}</span>
              <span>• {msg.timestamp}</span>
            </div>

            <div
              className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[90%] shadow-2xs relative group ${
                msg.sender === 'user'
                  ? 'bg-[#1A1A1A] text-white rounded-tr-none'
                  : 'bg-white border border-[#1A1A1A]/10 text-[#1A1A1A] rounded-tl-none font-sans whitespace-pre-line'
              }`}
            >
              {msg.text}

              {msg.sender === 'assistant' && (
                <button
                  onClick={() => copyToClipboard(msg.text, msg.id)}
                  className="absolute top-2 right-2 p-1 rounded bg-black/5 hover:bg-black/10 text-[#1A1A1A]/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Copy text"
                >
                  {copiedTextId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 bg-white border border-[#1A1A1A]/10 rounded-2xl text-xs text-[#1A1A1A]/70 animate-pulse w-fit">
            <Sparkles className="w-4 h-4 text-[#A67C52] animate-spin" />
            <span>Analyzing research paper context...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Bar & Actions */}
      <div className="p-3 bg-white border-t border-[#1A1A1A]/15 space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask AI Copilot about this paper..."
            className="flex-1 bg-[#F9F7F2] border border-[#1A1A1A]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#A67C52] font-sans"
          />

          <button
            type="submit"
            disabled={!inputQuery.trim() || loading}
            className="p-2.5 rounded-xl bg-[#A67C52] hover:bg-[#8C643E] text-white transition-colors cursor-pointer disabled:opacity-40 flex-shrink-0 shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[9px] text-[#1A1A1A]/50 px-1 font-mono">
          <span>Grounded in research paper summary</span>
          <span>NotebookLM Assistant</span>
        </div>
      </div>

      </div>
    </div>
  );
};
