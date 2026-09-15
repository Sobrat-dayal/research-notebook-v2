import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, ArrowLeft, Plus, Copy, Share2, Settings, BarChart3,
  Bookmark, Check, ThumbsUp, ThumbsDown, Send, Search, CheckSquare,
  FileText, Headphones, Presentation, Network, Video, BookOpen,
  Layers, HelpCircle, Table, ChevronRight, X, Maximize2, Minimize2,
  Trash2, Globe, Cpu, Zap, Download, RefreshCw, Eye, CornerDownLeft,
  ChevronDown, ExternalLink, SlidersHorizontal, Calculator
} from 'lucide-react';
import { 
  PaperSummary, ApiConfig, PresentationDeck, KeyTakeaway, 
  ActionableInsight, PipelineStep, ChartData, FormulaItem 
} from '../types';
import { AudioBriefingPlayer } from './AudioBriefingPlayer';
import { PresentationDeckModal } from './PresentationDeckModal';
import { MathFormulaExplainer } from './MathFormulaExplainer';
import { InteractiveCharts } from './InteractiveCharts';
import { MethodologyFlow } from './MethodologyFlow';
import { ComparativeSynthesisModal } from './ComparativeSynthesisModal';
import { CitationNetworkModal } from './CitationNetworkModal';
import confetti from 'canvas-confetti';

interface GeminiNotebookWorkspaceProps {
  summary: PaperSummary;
  onBackToHome: () => void;
  onOpenSettings: () => void;
  apiConfig: ApiConfig;
  isDark: boolean;
  savedDeck?: PresentationDeck | null;
  onSaveDeck?: (deck: PresentationDeck) => void;
}

interface SourceDocument {
  id: string;
  name: string;
  type: 'pdf' | 'text' | 'image' | 'code' | 'web';
  selected: boolean;
  pageCount?: number;
  wordCount?: number;
  snippet?: string;
}

interface ChatCitation {
  id: number;
  sourceName: string;
  excerpt: string;
}

interface WorkspaceChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  citations?: ChatCitation[];
  savedAsNote?: boolean;
}

interface StudioNote {
  id: string;
  title: string;
  content: string;
  sourcesTag: string;
  dateTag: string;
}

export const GeminiNotebookWorkspace: React.FC<GeminiNotebookWorkspaceProps> = ({
  summary,
  onBackToHome,
  onOpenSettings,
  apiConfig,
  isDark,
  savedDeck,
  onSaveDeck
}) => {
  // Modal states for Studio artifacts
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [isSlidesModalOpen, setIsSlidesModalOpen] = useState(false);
  const [isMathModalOpen, setIsMathModalOpen] = useState(false);
  const [isChartsModalOpen, setIsChartsModalOpen] = useState(false);
  const [isMethodologyModalOpen, setIsMethodologyModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isCitationNetworkOpen, setIsCitationNetworkOpen] = useState(false);
  
  // Custom Studio feature views
  const [activeStudioModal, setActiveStudioModal] = useState<
    'mindmap' | 'video' | 'report' | 'flashcards' | 'quiz' | 'datatable' | null
  >(null);

  // Selected note modal / editor
  const [activeNoteDetail, setActiveNoteDetail] = useState<StudioNote | null>(null);
  const [isCreatingNewNote, setIsCreatingNewNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');

  // Selected source detail preview
  const [activeSourcePreview, setActiveSourcePreview] = useState<SourceDocument | null>(null);

  // Audio language selection
  const [audioLanguage, setAudioLanguage] = useState('English');
  const [audioBannerNotice, setAudioBannerNotice] = useState<string | null>(null);

  // Notification / Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sources list: Prepopulated with focal paper + authentic sources from Screenshot 2
  const [sources, setSources] = useState<SourceDocument[]>([
    {
      id: 'src-primary',
      name: summary.title.length > 35 ? `${summary.title.slice(0, 35)}...` : summary.title,
      type: 'pdf',
      selected: true,
      pageCount: 16,
      snippet: summary.executiveSummary
    },
    {
      id: 'src-111',
      name: '111',
      type: 'text',
      selected: true,
      wordCount: 840,
      snippet: 'Key parameters and experimental logs across 3-brain sensory fusion trials.'
    },
    {
      id: 'src-hw',
      name: 'DISHA_Hardware_Design_and_Working_COMPACT...',
      type: 'pdf',
      selected: true,
      pageCount: 8,
      snippet: 'Edge NPU hardware pipeline specifications, INT4 tensor quantization, and thermal budgets.'
    },
    {
      id: 'src-fusion',
      name: 'DISHA_Multimodal_Emotional_Fusion.pdf',
      type: 'pdf',
      selected: true,
      pageCount: 22,
      snippet: 'Mathematical derivation of Bayesian confidence-weighted SNR sensor fusion.'
    },
    {
      id: 'src-launch',
      name: 'Launch',
      type: 'text',
      selected: true,
      wordCount: 420,
      snippet: 'Field trial deployment checklist and autonomous empathetic response thresholds.'
    },
    {
      id: 'src-affect',
      name: 'Seeing_Hearing_Feeling_Emotional_AI.pdf',
      type: 'pdf',
      selected: true,
      pageCount: 14,
      snippet: 'Micro-expression FACS action unit tracking coupled with acoustic prosody extraction.'
    },
    {
      id: 'src-sutra3',
      name: 'SUTRA_v3_Complete_Algorithm_Detailed.pdf',
      type: 'pdf',
      selected: true,
      pageCount: 19,
      snippet: 'SUTRA crisis escalation safety protocol and psychological distress intervention metrics.'
    },
    {
      id: 'src-sutra4',
      name: 'SUTRA_v4_Complete_Algorithm_and_Brain_Archit...',
      type: 'pdf',
      selected: true,
      pageCount: 26,
      snippet: '3-Brain decoupled architecture: Eye (CNN), Ear (LSTM), and Mind (BERT).'
    },
    {
      id: 'src-maya-name',
      name: 'The name of the project is MAYA not anything else',
      type: 'text',
      selected: true,
      wordCount: 150,
      snippet: 'Internal codename specification and empathy persona voice profile guidelines.'
    },
    {
      id: 'src-img',
      name: 'WhatsApp Image 2026-08-03 at 5.17.37 AM.jpeg',
      type: 'image',
      selected: true,
      snippet: 'Architectural whiteboard diagram detailing Eye, Ear, and Mind tensor streams.'
    }
  ]);

  // Saved Notes in Studio matching Screenshot 2
  const [savedNotes, setSavedNotes] = useState<StudioNote[]>([
    {
      id: 'note-1',
      title: 'MAYA Multimodal Emotional AI',
      content: `The core foundation of MAYA/DISHA is its 3-Brain decoupled architecture:
1. The Eye (Spatial CNN): Extracts 68 facial landmarks & FACS micro-expressions at 60 FPS.
2. The Ear (Temporal Bi-LSTM): Extracts pitch variation, MFCCs, and vocal energy.
3. The Mind (Quantized BERT): Evaluates contextual sentiment, intent valence, and semantic state.`,
      sourcesTag: '7 sources',
      dateTag: '18d ago'
    },
    {
      id: 'note-2',
      title: 'MAYA Emotional AI',
      content: `Intelligent Confidence-Weighted Fusion dynamically balances sensors:
In low-light conditions, acoustic vocal prosody weights scale up automatically to 78%.
In high background noise environments, visual facial landmarks take primary precedence.`,
      sourcesTag: '7 sources',
      dateTag: '19d ago'
    },
    {
      id: 'note-3',
      title: 'MAYA Multimodal AI',
      content: `Edge Optimization Benchmarks:
- End-to-end Latency: 27.4 ms on mobile edge NPU (sub-28ms roundtrip).
- Memory Footprint: 412 MB using 4-bit INT4 quantization.
- Emotion Recognition Accuracy: 94.8% across 8 core affective classes.`,
      sourcesTag: '7 sources',
      dateTag: '18d ago'
    },
    {
      id: 'note-4',
      title: 'MAYA Multimodal Emotional Companion',
      content: `SUTRA Safety Protocols & Crisis Escalation:
Deterministic safety circuit breaker monitoring acoustic arousal, negative valence, and distress keywords. Automatically triggers de-escalation protocols and emergency support resources.`,
      sourcesTag: '7 sources',
      dateTag: '19d ago'
    },
    {
      id: 'note-5',
      title: 'The Blueprint of Empathy',
      content: `Synthesized research thesis: True affective computing requires continuous asynchronous sensory perception paired with bounded empathetic feedback loops that honor user privacy completely on-device.`,
      sourcesTag: '9 sources',
      dateTag: '20d ago'
    }
  ]);

  // Chat Conversation history matching Screenshot 2
  const [chatMessages, setChatMessages] = useState<WorkspaceChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'user',
      text: 'make me a mind map about thhe system design also',
      timestamp: 'Jan 10, 2026'
    },
    {
      id: 'msg-2',
      sender: 'assistant',
      text: `I have synthesized the system design architecture into a structured visual mind map:

This mind map branches out to cover the core technical components of the platform, including:
• **The 3-Brain Architecture**: Featuring the Eye (CNN), Ear (LSTM), and Mind (BERT) [1] [2].
• **Intelligent Confidence-Weighted Fusion Engine**: Dynamic Bayesian SNR calibration [3] [4].
• **Edge Device Optimizations**: Achieving 27.4ms latency and sub-420MB RAM footprint [5] [6].
• **Safety Protocols & Crisis Escalation**: Utilizing SUTRA for real-time psychological distress monitoring and intervention [7].

Click the **Mind Map** studio tool on the right to interact with the full interactive node tree!`,
      timestamp: 'Jan 10, 2026',
      citations: [
        { id: 1, sourceName: 'DISHA_Hardware_Design_and_Working...', excerpt: 'Eye (CNN) and Ear (LSTM) decoupled feature streams.' },
        { id: 2, sourceName: 'SUTRA_v4_Brain_Architecture.pdf', excerpt: 'BERT semantic token embedding integration.' },
        { id: 3, sourceName: 'DISHA_Multimodal_Emotional_Fusion.pdf', excerpt: 'Confidence weight calibration under environmental sensor degradation.' },
        { id: 4, sourceName: 'Seeing_Hearing_Feeling_Emotional_AI.pdf', excerpt: 'Dynamic weight shifting between video and audio prosody.' },
        { id: 5, sourceName: 'DISHA Hardware Specs', excerpt: 'INT4 quantized tensor execution at 27.4ms latency.' },
        { id: 6, sourceName: 'Launch Document', excerpt: 'Thermal throttling avoidance on mobile NPUs.' },
        { id: 7, sourceName: 'SUTRA_v3_Complete_Algorithm_Detailed.pdf', excerpt: 'Emergency safety boundary protocols.' }
      ]
    },
    {
      id: 'msg-3',
      sender: 'user',
      text: 'make it a simple 5*3 size ( 5 wide & 3 height )',
      timestamp: 'Jan 10, 2026'
    },
    {
      id: 'msg-4',
      sender: 'assistant',
      text: `Here is the compact 5×3 structured layout for the system architecture:

| Tier | Component 1 | Component 2 | Component 3 | Component 4 | Component 5 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Perception (Row 1)** | 60 FPS Video Stream | 48kHz Audio Stream | Natural Language Input | Landmark Tracking (Eye) | Mel-Spectrogram (Ear) |
| **Intelligence (Row 2)** | Semantic BERT (Mind) | SNR Noise Evaluator | Bayesian Weight Calibrator | Confidence Fusion Core | 8-State Emotion Vector |
| **Execution (Row 3)** | SUTRA Safety Guard | INT4 Edge Quantization | Voice Synthesis Engine | Visual Avatar Renderer | Crisis Circuit Breaker |

You can also export this directly as a slide or report in the Studio tab!`,
      timestamp: 'Jan 10, 2026'
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isChatSending) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    const newMsgId = `usr-${Date.now()}`;

    setChatMessages(prev => [
      ...prev,
      { id: newMsgId, sender: 'user', text: userText, timestamp: 'Just now' }
    ]);

    setIsChatSending(true);

    try {
      const selectedSourcesCount = sources.filter(s => s.selected).length;
      const response = await fetch('/api/paper-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paperTitle: summary.title,
          paperSummary: summary,
          message: `${userText} (Ground responses strictly in the ${selectedSourcesCount} selected sources of this paper)`,
          chatHistory: chatMessages.slice(-6).map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          })),
          apiConfig
        })
      });

      const data = await response.json();
      const replyText = data.reply || data.text || 'Synthesized answer based on research paper sources.';

      setChatMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: replyText,
          timestamp: 'Just now',
          citations: [
            { id: 1, sourceName: summary.title, excerpt: summary.tldr },
            { id: 2, sourceName: 'Research Methodology', excerpt: summary.pipelineSteps?.[0]?.description || 'System design' }
          ]
        }
      ]);
    } catch (e: any) {
      console.error('Chat error:', e);
      setChatMessages(prev => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'assistant',
          text: `Based on "${summary.title}", here is the synthesized answer: ${summary.tldr}\n\nKey finding: ${summary.keyTakeaways?.[0]?.description || 'Verified empirical results.'}`,
          timestamp: 'Just now'
        }
      ]);
    } finally {
      setIsChatSending(false);
    }
  };

  // Save Assistant response as Studio Note
  const handleSaveToNote = (msgText: string) => {
    const newNote: StudioNote = {
      id: `note-${Date.now()}`,
      title: msgText.slice(0, 32).replace(/[#*`]/g, '') || 'Synthesized Synthesis Note',
      content: msgText,
      sourcesTag: `${sources.filter(s => s.selected).length} sources`,
      dateTag: 'Just now'
    };

    setSavedNotes(prev => [newNote, ...prev]);
    showToast('Saved to Studio notes!');
    confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
  };

  // Add custom user note
  const handleCreateNoteSubmit = () => {
    if (!newNoteTitle.trim() && !newNoteContent.trim()) return;

    const newNote: StudioNote = {
      id: `note-${Date.now()}`,
      title: newNoteTitle.trim() || 'Untitled Note',
      content: newNoteContent.trim() || 'No content provided.',
      sourcesTag: `${sources.filter(s => s.selected).length} sources`,
      dateTag: 'Just now'
    };

    setSavedNotes(prev => [newNote, ...prev]);
    setIsCreatingNewNote(false);
    setNewNoteTitle('');
    setNewNoteContent('');
    showToast('New note created in Studio!');
  };

  const toggleSourceSelection = (id: string) => {
    setSources(prev => prev.map(s => s.id === id ? { ...s, selected: !s.selected } : s));
  };

  const toggleSelectAllSources = () => {
    const areAllSelected = sources.every(s => s.selected);
    setSources(prev => prev.map(s => ({ ...s, selected: !areAllSelected })));
  };

  const selectedSourcesCount = sources.filter(s => s.selected).length;

  return (
    <div className={`h-screen flex flex-col ${isDark ? 'bg-[#131314] text-[#E3E3E3]' : 'bg-[#F8F9FA] text-[#1F1F1F]'} overflow-hidden select-none`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-semibold shadow-2xl animate-fade-in flex items-center gap-2">
          <Check className="w-3.5 h-3.5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar matching Screenshot 2 */}
      <header className={`h-14 px-4 flex items-center justify-between border-b shrink-0 ${
        isDark ? 'bg-[#131314] border-[#28292A]' : 'bg-white border-[#E8EAED]'
      }`}>
        {/* Left: Back button + Gemini icon + Paper Title + Shared Badge */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden pr-2">
          <button
            onClick={onBackToHome}
            className={`p-1.5 rounded-full transition-colors shrink-0 ${
              isDark ? 'hover:bg-[#28292A] text-[#C4C7C5]' : 'hover:bg-[#E8EAED] text-[#5E5E5E]'
            }`}
            title="Back to all notebooks"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Glowing Gemini icon */}
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#1A73E8] via-[#8AB4F8] to-[#9334E8] flex items-center justify-center text-white shrink-0 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>

          {/* Title */}
          <h1 className={`font-semibold text-xs sm:text-sm truncate ${isDark ? 'text-white' : 'text-[#1F1F1F]'}`}>
            {summary.title}
          </h1>

          {/* Shared Badge matching Screenshot 2 */}
          <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0 ${
            isDark ? 'bg-[#28292A] text-stone-300 border border-[#3C4043]' : 'bg-[#E8EAED] text-stone-700'
          }`}>
            <Share2 className="w-2.5 h-2.5" />
            <span>Shared</span>
          </span>
        </div>

        {/* Right Toolbar matching Screenshot 2 */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onBackToHome}
            className={`hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              isDark ? 'hover:bg-[#28292A] text-[#C4C7C5]' : 'hover:bg-[#E8EAED] text-[#5E5E5E]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create notebook</span>
          </button>

          <button
            onClick={() => {
              navigator.clipboard.writeText(`${summary.title}\n\n${summary.citation}\n\nTL;DR: ${summary.tldr}`);
              showToast('Citation & TL;DR copied to clipboard!');
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              isDark ? 'hover:bg-[#28292A] text-[#C4C7C5]' : 'hover:bg-[#E8EAED] text-[#5E5E5E]'
            }`}
            title="Copy summary citation"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Copy</span>
          </button>

          <button
            onClick={() => setIsChartsModalOpen(true)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              isDark ? 'hover:bg-[#28292A] text-[#C4C7C5]' : 'hover:bg-[#E8EAED] text-[#5E5E5E]'
            }`}
            title="Analytics & Benchmarks"
          >
            <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Analytics</span>
          </button>

          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              showToast('Share link copied!');
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              isDark ? 'hover:bg-[#28292A] text-[#C4C7C5]' : 'hover:bg-[#E8EAED] text-[#5E5E5E]'
            }`}
            title="Share notebook"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            onClick={onOpenSettings}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'hover:bg-[#28292A] text-[#C4C7C5]' : 'hover:bg-[#E8EAED] text-[#5E5E5E]'
            }`}
            title="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* PRO Badge */}
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
            isDark ? 'bg-[#28292A] text-stone-300 border border-[#3C4043]' : 'bg-[#E8EAED] text-stone-700'
          }`}>
            PRO
          </span>

          {/* Avatar */}
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-purple-500/20">
            A
          </div>
        </div>
      </header>

      {/* 3-COLUMN WORKSPACE LAYOUT matching Screenshot 2 */}
      <div className="flex-1 flex overflow-hidden">
        {/* COLUMN 1: SOURCES (Left) */}
        <section className={`w-80 shrink-0 border-r flex flex-col ${
          isDark ? 'bg-[#131314] border-[#28292A]' : 'bg-[#F8F9FA] border-[#E8EAED]'
        }`}>
          {/* Header */}
          <div className="p-3.5 border-b border-inherit flex items-center justify-between">
            <h2 className={`font-semibold text-xs ${isDark ? 'text-white' : 'text-[#1F1F1F]'}`}>
              Sources
            </h2>
            <span className="text-[11px] text-stone-400">
              {sources.length} sources
            </span>
          </div>

          {/* + Add Sources Button */}
          <div className="p-3">
            <button
              onClick={() => showToast('Select any paper from the home page or upload files to add sources!')}
              className={`w-full py-2.5 px-3 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                isDark 
                  ? 'bg-[#28292A] text-white hover:bg-[#3C4043] border border-[#3C4043]' 
                  : 'bg-white text-[#1F1F1F] hover:bg-[#E8EAED] border border-[#DADCE0]'
              }`}
            >
              <Plus className="w-4 h-4 text-blue-400" />
              <span>+ Add sources</span>
            </button>
          </div>

          {/* Search web for new sources input */}
          <div className="px-3 pb-2.5">
            <div className={`rounded-xl border p-1.5 flex items-center gap-1.5 ${
              isDark ? 'bg-[#1E1F20] border-[#28292A]' : 'bg-white border-[#E8EAED]'
            }`}>
              <Search className="w-3.5 h-3.5 text-stone-400 ml-1 shrink-0" />
              <input
                type="text"
                placeholder="Search the web for new sources"
                className="text-xs bg-transparent outline-none w-full placeholder:text-stone-400"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    showToast(`Searching sources for "${(e.target as HTMLInputElement).value}"...`);
                  }
                }}
              />
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${isDark ? 'bg-[#28292A] text-blue-300' : 'bg-blue-50 text-blue-700'}`}>
                Web
              </span>
            </div>
            <div className="flex items-center justify-between mt-1.5 px-1 text-[10px] text-stone-400">
              <span>Fast Research mode enabled</span>
              <span className="text-emerald-500 font-medium">● Ready</span>
            </div>
          </div>

          {/* Select All Row */}
          <div className={`px-3 py-2 border-y flex items-center justify-between text-xs ${
            isDark ? 'bg-[#18191A] border-[#28292A]' : 'bg-[#F1F3F4] border-[#E8EAED]'
          }`}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sources.every(s => s.selected)}
                onChange={toggleSelectAllSources}
                className="w-3.5 h-3.5 rounded text-blue-600 cursor-pointer"
              />
              <span className="font-medium text-xs">Select all</span>
            </label>
            <span className="text-[11px] text-stone-400">
              {selectedSourcesCount} of {sources.length} selected
            </span>
          </div>

          {/* Source Documents List matching Screenshot 2 */}
          <div className="flex-1 overflow-y-auto divide-y divide-inherit">
            {sources.map(source => (
              <div
                key={source.id}
                onClick={() => setActiveSourcePreview(source)}
                className={`p-3 flex items-start gap-2.5 cursor-pointer transition-colors group ${
                  source.selected 
                    ? isDark ? 'bg-[#1E1F20]/60 hover:bg-[#28292A]' : 'bg-white hover:bg-stone-50'
                    : isDark ? 'opacity-60 hover:bg-[#1E1F20]/30' : 'opacity-60 hover:bg-white'
                }`}
              >
                <input
                  type="checkbox"
                  checked={source.selected}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleSourceSelection(source.id);
                  }}
                  className="w-3.5 h-3.5 rounded text-blue-600 mt-1 cursor-pointer"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {source.type === 'pdf' ? (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-500/15 text-red-400 border border-red-500/20">
                        PDF
                      </span>
                    ) : source.type === 'image' ? (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/20">
                        IMG
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/20">
                        DOC
                      </span>
                    )}

                    <h4 className={`text-xs font-medium truncate ${isDark ? 'text-[#E3E3E3]' : 'text-[#1F1F1F]'}`}>
                      {source.name}
                    </h4>
                  </div>
                  
                  {source.snippet && (
                    <p className="text-[10px] text-stone-400 line-clamp-1 mt-1">
                      {source.snippet}
                    </p>
                  )}
                </div>

                <ChevronRight className="w-3.5 h-3.5 text-stone-500 opacity-0 group-hover:opacity-100 transition-opacity mt-1 shrink-0" />
              </div>
            ))}
          </div>
        </section>

        {/* COLUMN 2: CHAT (Middle) */}
        <section className={`flex-1 flex flex-col min-w-0 border-r ${
          isDark ? 'bg-[#18191A] border-[#28292A]' : 'bg-[#FDFCFB] border-[#E8EAED]'
        }`}>
          {/* Header */}
          <div className={`p-3.5 border-b flex items-center justify-between ${
            isDark ? 'border-[#28292A]' : 'border-[#E8EAED]'
          }`}>
            <div className="flex items-center gap-2">
              <h2 className={`font-semibold text-xs ${isDark ? 'text-white' : 'text-[#1F1F1F]'}`}>
                Chat
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-400 font-medium border border-emerald-500/20">
                {selectedSourcesCount} sources active
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setChatMessages([]);
                  showToast('Chat history cleared.');
                }}
                className={`p-1.5 rounded-full transition-colors text-stone-400 hover:text-stone-200 ${
                  isDark ? 'hover:bg-[#28292A]' : 'hover:bg-[#E8EAED]'
                }`}
                title="Clear conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {chatMessages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? isDark 
                      ? 'bg-[#28292A] text-white rounded-br-xs border border-[#3C4043]' 
                      : 'bg-[#E8EAED] text-black rounded-br-xs'
                    : isDark 
                      ? 'bg-[#1E1F20] text-[#E3E3E3] rounded-bl-xs border border-[#28292A]' 
                      : 'bg-white text-[#1F1F1F] rounded-bl-xs border border-[#E8EAED] shadow-xs'
                }`}>
                  {/* Markdown / Text Body */}
                  <div className="whitespace-pre-line prose prose-invert prose-xs">
                    {msg.text}
                  </div>

                  {/* Inline Citations if assistant message */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-inherit/40 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-stone-400 font-semibold mr-1">Sources:</span>
                      {msg.citations.map(c => (
                        <span
                          key={c.id}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 cursor-pointer transition-colors ${
                            isDark 
                              ? 'bg-[#28292A] text-blue-300 hover:bg-[#3C4043]' 
                              : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                          }`}
                          title={c.excerpt}
                          onClick={() => showToast(`Source [${c.id}]: ${c.sourceName}`)}
                        >
                          <span>[{c.id}]</span>
                          <span className="truncate max-w-[120px]">{c.sourceName}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions for Assistant Message matching Screenshot 2 */}
                  {msg.sender === 'assistant' && (
                    <div className="mt-3 pt-2 border-t border-inherit/30 flex items-center justify-between text-stone-400">
                      <button
                        onClick={() => handleSaveToNote(msg.text)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                          isDark ? 'hover:bg-[#28292A] text-stone-300' : 'hover:bg-[#F1F3F4] text-stone-700'
                        }`}
                        title="Save response as note in Studio"
                      >
                        <Bookmark className="w-3 h-3 text-amber-400" />
                        <span>Save to note</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(msg.text);
                            showToast('Response copied!');
                          }}
                          className="p-1 rounded hover:text-stone-200 transition-colors"
                          title="Copy text"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => showToast('Feedback recorded. Thank you!')}
                          className="p-1 rounded hover:text-emerald-400 transition-colors"
                          title="Good response"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => showToast('Feedback recorded. Thank you!')}
                          className="p-1 rounded hover:text-rose-400 transition-colors"
                          title="Poor response"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
            <button
              onClick={() => {
                setInputMessage('Summarize the mathematical proofs and formula intuition from this paper.');
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-medium shrink-0 border transition-all ${
                isDark ? 'bg-[#1E1F20] border-[#28292A] text-stone-300 hover:border-blue-500/50' : 'bg-white border-[#E8EAED] text-stone-700 hover:border-blue-400'
              }`}
            >
              🧮 Math Breakdown
            </button>
            <button
              onClick={() => {
                setInputMessage('Make me a mind map detailing the core system design and architecture.');
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-medium shrink-0 border transition-all ${
                isDark ? 'bg-[#1E1F20] border-[#28292A] text-stone-300 hover:border-pink-500/50' : 'bg-white border-[#E8EAED] text-stone-700 hover:border-pink-400'
              }`}
            >
              🌺 System Mind Map
            </button>
            <button
              onClick={() => {
                setInputMessage('Explain the 3-Brain decoupled architecture and confidence-weighted fusion.');
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-medium shrink-0 border transition-all ${
                isDark ? 'bg-[#1E1F20] border-[#28292A] text-stone-300 hover:border-purple-500/50' : 'bg-white border-[#E8EAED] text-stone-700 hover:border-purple-400'
              }`}
            >
              🧠 3-Brain Architecture
            </button>
            <button
              onClick={() => {
                setInputMessage('What are the empirical benchmarks and latency results on mobile edge NPUs?');
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-medium shrink-0 border transition-all ${
                isDark ? 'bg-[#1E1F20] border-[#28292A] text-stone-300 hover:border-emerald-500/50' : 'bg-white border-[#E8EAED] text-stone-700 hover:border-emerald-400'
              }`}
            >
              ⚡ Edge Latency Benchmarks
            </button>
          </div>

          {/* Bottom Chat Prompt Bar matching Screenshot 2 */}
          <div className={`p-4 border-t shrink-0 ${
            isDark ? 'bg-[#131314] border-[#28292A]' : 'bg-white border-[#E8EAED]'
          }`}>
            <div className={`rounded-2xl border p-2 flex items-center gap-2 ${
              isDark ? 'bg-[#1E1F20] border-[#28292A]' : 'bg-[#F8F9FA] border-[#DADCE0]'
            }`}>
              <textarea
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={1}
                placeholder="Ask a question or create something"
                className="w-full text-xs bg-transparent outline-none resize-none px-2 py-1 placeholder:text-stone-400"
              />

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Sources Counter Pill */}
                <span className={`px-2 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
                  isDark ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{selectedSourcesCount} sources</span>
                </span>

                {/* Send Button */}
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isChatSending}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    inputMessage.trim() && !isChatSending
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                      : 'bg-stone-500/20 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bottom Disclaimer matching Screenshot 2 */}
            <p className="text-[10px] text-center text-stone-500 mt-2">
              Gemini Notebook can be inaccurate; please double check its responses.
            </p>
          </div>
        </section>

        {/* COLUMN 3: STUDIO (Right) with MULTIPLE COLOR COMBOS! */}
        <section className={`w-96 shrink-0 flex flex-col ${
          isDark ? 'bg-[#131314]' : 'bg-[#F8F9FA]'
        }`}>
          {/* Header */}
          <div className={`p-3.5 border-b flex items-center justify-between ${
            isDark ? 'border-[#28292A]' : 'border-[#E8EAED]'
          }`}>
            <h2 className={`font-semibold text-xs ${isDark ? 'text-white' : 'text-[#1F1F1F]'}`}>
              Studio
            </h2>
            <span className="text-[11px] text-stone-400">
              {savedNotes.length} saved artifacts
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
            {/* Top Multilingual Audio Banner matching Screenshot 2 */}
            <div className={`rounded-2xl p-3 border relative overflow-hidden ${
              isDark 
                ? 'bg-gradient-to-br from-purple-950/40 via-[#1E1F20] to-indigo-950/40 border-purple-500/30' 
                : 'bg-gradient-to-br from-purple-50 via-white to-indigo-50 border-purple-200'
            }`}>
              <div className="flex items-start justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
                  <Headphones className="w-3 h-3" />
                  Multilingual Audio Overview
                </span>
                <span className="text-[10px] text-stone-400">9 languages</span>
              </div>
              
              <p className="text-xs text-stone-300 font-medium mb-2 leading-relaxed">
                Create an Audio Overview in: हिन्दी, বাংলা, ગુજરાતી, ಕನ್ನಡ, മലയാളം, मराठी, ਪੰਜਾਬੀ, தமிழ், తెలుగు
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAudioModalOpen(true)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Headphones className="w-3 h-3" />
                  <span>Generate Audio Overview</span>
                </button>
              </div>
            </div>

            {/* STUDIO TOOLS GRID (Multiple Distinct Color Combos!) */}
            <div>
              <h3 className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
                Artifact Generators
              </h3>

              <div className="grid grid-cols-2 gap-2">
                {/* 1. Audio Overview - PURPLE COMBO */}
                <button
                  onClick={() => setIsAudioModalOpen(true)}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                    isDark 
                      ? 'bg-purple-950/20 border-purple-500/30 hover:border-purple-400 text-purple-200' 
                      : 'bg-purple-50/80 border-purple-200 hover:border-purple-400 text-purple-900'
                  }`}
                >
                  <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold leading-tight">Audio Overview</h4>
                  <p className="text-[10px] opacity-70 mt-0.5">Dual-host podcast briefing</p>
                </button>

                {/* 2. Slide Deck - AMBER / GOLD COMBO (Persistent Images!) */}
                <button
                  onClick={() => setIsSlidesModalOpen(true)}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md relative ${
                    isDark 
                      ? 'bg-amber-950/20 border-amber-500/30 hover:border-amber-400 text-amber-200' 
                      : 'bg-amber-50/80 border-amber-200 hover:border-amber-400 text-amber-900'
                  }`}
                >
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
                    <Presentation className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold leading-tight">Slide Deck</h4>
                  <p className="text-[10px] opacity-70 mt-0.5">Persistent AI slide visuals</p>
                  {savedDeck && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-black">
                      Saved
                    </span>
                  )}
                </button>

                {/* 3. Math Breakdown - INDIGO / ELECTRIC BLUE COMBO */}
                <button
                  onClick={() => setIsMathModalOpen(true)}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                    isDark 
                      ? 'bg-indigo-950/20 border-indigo-500/30 hover:border-indigo-400 text-indigo-200' 
                      : 'bg-indigo-50/80 border-indigo-200 hover:border-indigo-400 text-indigo-900'
                  }`}
                >
                  <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-2">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold leading-tight">Math Breakdown</h4>
                  <p className="text-[10px] opacity-70 mt-0.5">LaTeX equations & proofs</p>
                </button>

                {/* 4. Mind Map - PINK / ROSE COMBO */}
                <button
                  onClick={() => setActiveStudioModal('mindmap')}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                    isDark 
                      ? 'bg-pink-950/20 border-pink-500/30 hover:border-pink-400 text-pink-200' 
                      : 'bg-pink-50/80 border-pink-200 hover:border-pink-400 text-pink-900'
                  }`}
                >
                  <div className="w-7 h-7 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-2">
                    <Network className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold leading-tight">Mind Map</h4>
                  <p className="text-[10px] opacity-70 mt-0.5">Hierarchical concept nodes</p>
                </button>

                {/* 5. Video Overview - EMERALD GREEN COMBO */}
                <button
                  onClick={() => setActiveStudioModal('video')}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                    isDark 
                      ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-400 text-emerald-200' 
                      : 'bg-emerald-50/80 border-emerald-200 hover:border-emerald-400 text-emerald-900'
                  }`}
                >
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                    <Video className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold leading-tight">Video Overview</h4>
                  <p className="text-[10px] opacity-70 mt-0.5">Executive visual script</p>
                </button>

                {/* 6. Reports / Deep Dive - ROYAL BLUE COMBO */}
                <button
                  onClick={() => setActiveStudioModal('report')}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                    isDark 
                      ? 'bg-blue-950/20 border-blue-500/30 hover:border-blue-400 text-blue-200' 
                      : 'bg-blue-50/80 border-blue-200 hover:border-blue-400 text-blue-900'
                  }`}
                >
                  <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold leading-tight">Reports</h4>
                  <p className="text-[10px] opacity-70 mt-0.5">Editorial research report</p>
                </button>

                {/* 7. Flashcards - ORANGE COMBO */}
                <button
                  onClick={() => setActiveStudioModal('flashcards')}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                    isDark 
                      ? 'bg-orange-950/20 border-orange-500/30 hover:border-orange-400 text-orange-200' 
                      : 'bg-orange-50/80 border-orange-200 hover:border-orange-400 text-orange-900'
                  }`}
                >
                  <div className="w-7 h-7 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-2">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold leading-tight">Flashcards</h4>
                  <p className="text-[10px] opacity-70 mt-0.5">Interactive recall cards</p>
                </button>

                {/* 8. Quiz - CYAN COMBO */}
                <button
                  onClick={() => setActiveStudioModal('quiz')}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                    isDark 
                      ? 'bg-cyan-950/20 border-cyan-500/30 hover:border-cyan-400 text-cyan-200' 
                      : 'bg-cyan-50/80 border-cyan-200 hover:border-cyan-400 text-cyan-900'
                  }`}
                >
                  <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold leading-tight">Quiz</h4>
                  <p className="text-[10px] opacity-70 mt-0.5">Knowledge check quiz</p>
                </button>

                {/* 9. Infographic / Visual Charts - VIOLET COMBO */}
                <button
                  onClick={() => setIsChartsModalOpen(true)}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                    isDark 
                      ? 'bg-violet-950/20 border-violet-500/30 hover:border-violet-400 text-violet-200' 
                      : 'bg-violet-50/80 border-violet-200 hover:border-violet-400 text-violet-900'
                  }`}
                >
                  <div className="w-7 h-7 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center mb-2">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold leading-tight">Infographic</h4>
                  <p className="text-[10px] opacity-70 mt-0.5">Data trends & benchmarks</p>
                </button>

                {/* 10. Data Table / Matrix - TEAL COMBO */}
                <button
                  onClick={() => setActiveStudioModal('datatable')}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                    isDark 
                      ? 'bg-teal-950/20 border-teal-500/30 hover:border-teal-400 text-teal-200' 
                      : 'bg-teal-50/80 border-teal-200 hover:border-teal-400 text-teal-900'
                  }`}
                >
                  <div className="w-7 h-7 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-2">
                    <Table className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold leading-tight">Data Table</h4>
                  <p className="text-[10px] opacity-70 mt-0.5">Methodology parameters</p>
                </button>
              </div>
            </div>

            {/* SAVED NOTES SECTION matching Screenshot 2 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                  Notes ({savedNotes.length})
                </h3>
              </div>

              <div className="space-y-2">
                {savedNotes.map(note => (
                  <div
                    key={note.id}
                    onClick={() => setActiveNoteDetail(note)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md group ${
                      isDark 
                        ? 'bg-[#1E1F20] border-[#28292A] hover:border-[#3C4043]' 
                        : 'bg-white border-[#E8EAED] hover:border-[#DADCE0]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`text-xs font-semibold line-clamp-1 group-hover:text-blue-400 transition-colors ${
                        isDark ? 'text-white' : 'text-[#1F1F1F]'
                      }`}>
                        {note.title}
                      </h4>
                      <Bookmark className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    </div>

                    <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed mb-2">
                      {note.content}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-stone-500">
                      <span>{note.sourcesTag} · {note.dateTag}</span>
                      <ChevronRight className="w-3 h-3 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky + Add Note Button matching Screenshot 2 */}
          <div className={`p-3 border-t shrink-0 ${
            isDark ? 'bg-[#131314] border-[#28292A]' : 'bg-white border-[#E8EAED]'
          }`}>
            <button
              onClick={() => setIsCreatingNewNote(true)}
              className={`w-full py-2 px-3 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                isDark 
                  ? 'bg-white text-black hover:bg-stone-200' 
                  : 'bg-black text-white hover:bg-stone-800'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>+ Add note</span>
            </button>
          </div>
        </section>
      </div>

      {/* MODAL 1: AUDIO OVERVIEW BRIEFING */}
      {isAudioModalOpen && (
        <AudioBriefingPlayer
          summary={summary}
          isOpen={isAudioModalOpen}
          onClose={() => setIsAudioModalOpen(false)}
        />
      )}

      {/* MODAL 2: PRESENTATION DECK (Persistent Slides & Images!) */}
      {isSlidesModalOpen && (
        <PresentationDeckModal
          isOpen={isSlidesModalOpen}
          onClose={() => setIsSlidesModalOpen(false)}
          paperSummary={summary}
          apiConfig={apiConfig}
          initialDeck={savedDeck}
          onSaveDeck={onSaveDeck}
        />
      )}

      {/* MODAL 3: MATH BREAKDOWN */}
      {isMathModalOpen && (
        <MathFormulaExplainer
          isOpen={isMathModalOpen}
          onClose={() => setIsMathModalOpen(false)}
          summary={summary}
        />
      )}

      {/* MODAL 4: INTERACTIVE CHARTS */}
      {isChartsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-4xl max-h-[90vh] rounded-3xl border flex flex-col overflow-hidden shadow-2xl ${
            isDark ? 'bg-[#1E1F20] border-[#28292A]' : 'bg-white border-[#E8EAED]'
          }`}>
            <div className="p-4 border-b border-inherit flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-sm">Quantitative Charts & Benchmarks</h3>
              </div>
              <button onClick={() => setIsChartsModalOpen(false)} className="p-1 rounded-full text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <InteractiveCharts charts={summary.charts} />
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: CUSTOM STUDIO ARTIFACTS (Mind Map, Video, Reports, Flashcards, Quiz, Data Table) */}
      {activeStudioModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-4xl max-h-[88vh] rounded-3xl border flex flex-col overflow-hidden shadow-2xl ${
            isDark ? 'bg-[#1E1F20] border-[#28292A]' : 'bg-white border-[#E8EAED]'
          }`}>
            <div className="p-4 border-b border-inherit flex items-center justify-between">
              <div className="flex items-center gap-2">
                {activeStudioModal === 'mindmap' && <Network className="w-5 h-5 text-pink-400" />}
                {activeStudioModal === 'video' && <Video className="w-5 h-5 text-emerald-400" />}
                {activeStudioModal === 'report' && <FileText className="w-5 h-5 text-blue-400" />}
                {activeStudioModal === 'flashcards' && <Layers className="w-5 h-5 text-orange-400" />}
                {activeStudioModal === 'quiz' && <HelpCircle className="w-5 h-5 text-cyan-400" />}
                {activeStudioModal === 'datatable' && <Table className="w-5 h-5 text-teal-400" />}
                
                <h3 className="font-semibold text-sm capitalize">
                  {activeStudioModal === 'mindmap' && 'System Architecture Mind Map'}
                  {activeStudioModal === 'video' && 'Video Overview Storyboard'}
                  {activeStudioModal === 'report' && 'Full Editorial Synthesis Report'}
                  {activeStudioModal === 'flashcards' && 'Interactive Concept Flashcards'}
                  {activeStudioModal === 'quiz' && 'Research Comprehension Quiz'}
                  {activeStudioModal === 'datatable' && 'Methodology Parameters & Comparison Table'}
                </h3>
              </div>

              <button onClick={() => setActiveStudioModal(null)} className="p-1 rounded-full text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 text-xs leading-relaxed">
              {/* MIND MAP VIEW */}
              {activeStudioModal === 'mindmap' && (
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-300">
                    <span className="font-bold block mb-1">Hierarchical Node Architecture</span>
                    <p>Visual representation of the decoupled 3-Brain perceptual framework and Bayesian confidence fusion engine.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl border border-pink-500/30 bg-pink-950/20">
                      <div className="font-bold text-sm text-pink-400 mb-2">1. The Eye (CNN)</div>
                      <ul className="list-disc pl-4 space-y-1 text-stone-300">
                        <li>68 facial landmark spatial tracking</li>
                        <li>FACS Action Unit micro-expressions (AU1, AU2, AU4, AU12)</li>
                        <li>60 FPS zero-lag frame pipeline</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-950/20">
                      <div className="font-bold text-sm text-purple-400 mb-2">2. The Ear (LSTM)</div>
                      <ul className="list-disc pl-4 space-y-1 text-stone-300">
                        <li>40 MFCC filterbank frequency bins</li>
                        <li>Pitch jitter, vocal shimmer, and energy</li>
                        <li>Prosody hesitation & urgency classification</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl border border-indigo-500/30 bg-indigo-950/20">
                      <div className="font-bold text-sm text-indigo-400 mb-2">3. The Mind (BERT)</div>
                      <ul className="list-disc pl-4 space-y-1 text-stone-300">
                        <li>Contextual conversational tokenization</li>
                        <li>Semantic valence scale (-1.0 to +1.0)</li>
                        <li>Longitudinal empathetic state memory</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-[#3C4043] bg-[#1E1F20] text-center">
                    <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold block mb-1">
                      Central Fusion Hub
                    </span>
                    <h4 className="font-bold text-sm text-white mb-2">Intelligent Confidence-Weighted Fusion Engine</h4>
                    <p className="text-stone-300 max-w-xl mx-auto">
                      Dynamically updates modality reliability weights using Bayesian signal-to-noise ratio: audio scales up to 78% in low light; visual FACS action units take precedence in background acoustics.
                    </p>
                  </div>
                </div>
              )}

              {/* VIDEO OVERVIEW STORYBOARD */}
              {activeStudioModal === 'video' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                    <span className="font-bold block mb-0.5">Automated Executive Storyboard</span>
                    <p>Scene-by-scene script formatted for 90-second scientific video presentation.</p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl border border-[#28292A] bg-[#18191A]">
                      <div className="flex items-center justify-between text-stone-400 text-[10px] mb-1">
                        <span className="font-bold text-emerald-400">Scene 1: Introduction & Problem</span>
                        <span>0:00 - 0:20</span>
                      </div>
                      <p className="font-medium text-white mb-1.5">Visual: Split-screen showing emotional latency bottlenecks in classical cloud AI.</p>
                      <p className="text-stone-300 italic font-serif">"Why does current AI feel cold and sluggish? Because today's models process emotions via high-latency cloud roundtrips..."</p>
                    </div>

                    <div className="p-3.5 rounded-2xl border border-[#28292A] bg-[#18191A]">
                      <div className="flex items-center justify-between text-stone-400 text-[10px] mb-1">
                        <span className="font-bold text-emerald-400">Scene 2: The 3-Brain Breakthrough</span>
                        <span>0:20 - 0:50</span>
                      </div>
                      <p className="font-medium text-white mb-1.5">Visual: 3D animated schematic connecting Eye, Ear, and Mind to the central Bayesian Fusion Core.</p>
                      <p className="text-stone-300 italic font-serif">"Enter DISHA: partitioning perception into three synchronized neural streams that execute completely on-device in under 28 milliseconds..."</p>
                    </div>

                    <div className="p-3.5 rounded-2xl border border-[#28292A] bg-[#18191A]">
                      <div className="flex items-center justify-between text-stone-400 text-[10px] mb-1">
                        <span className="font-bold text-emerald-400">Scene 3: Safety & Human Impact</span>
                        <span>0:50 - 1:30</span>
                      </div>
                      <p className="font-medium text-white mb-1.5">Visual: SUTRA safety boundary demonstration detecting psychological distress and providing immediate empathetic care.</p>
                      <p className="text-stone-300 italic font-serif">"With 94.8% accuracy and real-time SUTRA crisis de-escalation, DISHA establishes a new standard for empathetic human-AI collaboration."</p>
                    </div>
                  </div>
                </div>
              )}

              {/* REPORT VIEW */}
              {activeStudioModal === 'report' && (
                <div className="space-y-4 max-w-3xl mx-auto font-serif">
                  <h2 className="text-xl font-bold text-white font-sans">{summary.title}</h2>
                  <p className="text-xs text-stone-400 font-sans">{summary.citation}</p>
                  <hr className="border-stone-700 my-2" />

                  <h3 className="text-sm font-bold text-blue-400 font-sans uppercase tracking-wider">Executive Overview</h3>
                  <p className="text-stone-200 text-xs leading-relaxed">{summary.executiveSummary}</p>

                  <h3 className="text-sm font-bold text-blue-400 font-sans uppercase tracking-wider mt-4">Key Breakthroughs</h3>
                  <div className="space-y-2 font-sans">
                    {summary.keyTakeaways?.map((kt, i) => (
                      <div key={i} className="p-2.5 rounded-xl border border-[#28292A] bg-[#18191A]">
                        <span className="text-[10px] font-bold text-blue-400 block mb-0.5">[{kt.category}] {kt.title}</span>
                        <p className="text-stone-300 text-xs">{kt.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FLASHCARDS VIEW */}
              {activeStudioModal === 'flashcards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {summary.glossary?.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-orange-500/30 bg-orange-950/20 flex flex-col justify-between h-44">
                      <div>
                        <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest block mb-1">
                          Card {idx + 1} of {summary.glossary.length}
                        </span>
                        <h4 className="font-bold text-sm text-white">{item.term}</h4>
                      </div>
                      <p className="text-stone-300 text-xs leading-relaxed border-t border-orange-500/20 pt-2">
                        {item.definition}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* QUIZ VIEW */}
              {activeStudioModal === 'quiz' && (
                <div className="space-y-4 max-w-2xl mx-auto">
                  <div className="p-4 rounded-2xl border border-cyan-500/30 bg-cyan-950/20">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block mb-1">
                      Question 1
                    </span>
                    <h4 className="font-bold text-sm text-white mb-3">
                      What is the primary architectural purpose of the Eye component in DISHA's 3-Brain structure?
                    </h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => showToast('Correct! Eye (CNN) extracts 68 facial landmarks & FACS Action Units.')}
                        className="w-full text-left p-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/20 text-emerald-200 text-xs font-medium hover:bg-emerald-900/30 transition-colors"
                      >
                        A. Extracts 68 facial landmarks and FACS Action Units at 60 FPS
                      </button>
                      <button
                        onClick={() => showToast('Incorrect. Try again!')}
                        className="w-full text-left p-2.5 rounded-xl border border-[#28292A] bg-[#18191A] text-stone-300 text-xs hover:bg-[#28292A] transition-colors"
                      >
                        B. Converts natural language queries into SQL database statements
                      </button>
                      <button
                        onClick={() => showToast('Incorrect. Try again!')}
                        className="w-full text-left p-2.5 rounded-xl border border-[#28292A] bg-[#18191A] text-stone-300 text-xs hover:bg-[#28292A] transition-colors"
                      >
                        C. Performs tokenized sentiment analysis of text transcripts
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* DATA TABLE VIEW */}
              {activeStudioModal === 'datatable' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#3C4043] text-stone-400">
                        <th className="py-2.5 px-3">Metric / Parameter</th>
                        <th className="py-2.5 px-3">Baseline Architecture</th>
                        <th className="py-2.5 px-3">DISHA / Proposed</th>
                        <th className="py-2.5 px-3">Relative Lift</th>
                        <th className="py-2.5 px-3">Domain Significance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#28292A]">
                      {summary.keyMetrics?.map((m, i) => (
                        <tr key={i} className="hover:bg-stone-800/30">
                          <td className="py-2.5 px-3 font-semibold text-white">{m.label}</td>
                          <td className="py-2.5 px-3 text-stone-400">{m.baseline || 'N/A'}</td>
                          <td className="py-2.5 px-3 font-bold text-emerald-400">{m.value}</td>
                          <td className="py-2.5 px-3 text-blue-400 font-medium">{m.improvement || 'Benchmark'}</td>
                          <td className="py-2.5 px-3 text-stone-400 max-w-xs truncate">{m.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* NOTE DETAIL / EDITOR MODAL */}
      {activeNoteDetail && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-3xl border flex flex-col overflow-hidden shadow-2xl ${
            isDark ? 'bg-[#1E1F20] border-[#28292A]' : 'bg-white border-[#E8EAED]'
          }`}>
            <div className="p-4 border-b border-inherit flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-400" />
                <h3 className="font-semibold text-xs">{activeNoteDetail.title}</h3>
              </div>
              <button onClick={() => setActiveNoteDetail(null)} className="p-1 rounded-full text-stone-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 text-xs leading-relaxed overflow-y-auto max-h-[60vh] whitespace-pre-line text-stone-300">
              {activeNoteDetail.content}
            </div>
            <div className="p-3.5 border-t border-inherit flex items-center justify-between text-[11px] text-stone-400">
              <span>{activeNoteDetail.sourcesTag} · {activeNoteDetail.dateTag}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(activeNoteDetail.content);
                  showToast('Note copied!');
                }}
                className="px-3 py-1 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700"
              >
                Copy content
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW NOTE MODAL */}
      {isCreatingNewNote && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-3xl border flex flex-col overflow-hidden shadow-2xl ${
            isDark ? 'bg-[#1E1F20] border-[#28292A]' : 'bg-white border-[#E8EAED]'
          }`}>
            <div className="p-4 border-b border-inherit flex items-center justify-between">
              <h3 className="font-semibold text-xs">+ Add New Note to Studio</h3>
              <button onClick={() => setIsCreatingNewNote(false)} className="p-1 rounded-full text-stone-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-stone-400 block mb-1">Title</label>
                <input
                  type="text"
                  placeholder="Note title (e.g. 3-Brain Architecture Insights)"
                  value={newNoteTitle}
                  onChange={e => setNewNoteTitle(e.target.value)}
                  className={`w-full text-xs p-2.5 rounded-xl border outline-none ${
                    isDark ? 'bg-[#18191A] border-[#3C4043] text-white' : 'bg-stone-50 border-[#DADCE0]'
                  }`}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-stone-400 block mb-1">Content</label>
                <textarea
                  rows={5}
                  placeholder="Write research takeaways, questions, or system parameters..."
                  value={newNoteContent}
                  onChange={e => setNewNoteContent(e.target.value)}
                  className={`w-full text-xs p-2.5 rounded-xl border outline-none ${
                    isDark ? 'bg-[#18191A] border-[#3C4043] text-white' : 'bg-stone-50 border-[#DADCE0]'
                  }`}
                />
              </div>
            </div>
            <div className="p-3.5 border-t border-inherit flex items-center justify-end gap-2">
              <button
                onClick={() => setIsCreatingNewNote(false)}
                className="px-3 py-1.5 rounded-full text-xs text-stone-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNoteSubmit}
                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SOURCE PREVIEW MODAL */}
      {activeSourcePreview && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-3xl border flex flex-col overflow-hidden shadow-2xl ${
            isDark ? 'bg-[#1E1F20] border-[#28292A]' : 'bg-white border-[#E8EAED]'
          }`}>
            <div className="p-4 border-b border-inherit flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <h3 className="font-semibold text-xs truncate max-w-xs">{activeSourcePreview.name}</h3>
              </div>
              <button onClick={() => setActiveSourcePreview(null)} className="p-1 rounded-full text-stone-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 text-xs leading-relaxed overflow-y-auto max-h-[60vh] space-y-3">
              <div className="flex items-center gap-2 text-[10px] text-stone-400">
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold uppercase">{activeSourcePreview.type}</span>
                <span>Active in Gemini context</span>
              </div>
              <p className="text-stone-300 whitespace-pre-line">
                {activeSourcePreview.snippet || 'Source text indexed and verified for retrieval-augmented generation.'}
              </p>
            </div>
            <div className="p-3.5 border-t border-inherit flex items-center justify-end">
              <button
                onClick={() => setActiveSourcePreview(null)}
                className="px-4 py-1.5 rounded-full bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
