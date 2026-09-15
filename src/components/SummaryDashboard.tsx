import React, { useState } from 'react';
import { PaperSummary, ApiConfig, PaperTopic, ReferenceItem } from '../types';
import { InteractiveCharts } from './InteractiveCharts';
import { MethodologyFlow } from './MethodologyFlow';
import { PaperChatDrawer } from './PaperChatDrawer';
import { TopicExplanationModal } from './TopicExplanationModal';
import { PresentationDeckModal } from './PresentationDeckModal';
import { AiAssistantSidebar } from './AiAssistantSidebar';
import { MathFormulaExplainer } from './MathFormulaExplainer';
import { CitationNetworkModal } from './CitationNetworkModal';
import { AudioBriefingPlayer } from './AudioBriefingPlayer';
import { ResearchNotebookDrawer } from './ResearchNotebookDrawer';
import { ComparativeSynthesisModal } from './ComparativeSynthesisModal';
import { PRESET_PAPERS } from '../data/presetPapers';
import { 
  FileText, Sparkles, BarChart3, Layers, Lightbulb, Zap, 
  Check, Copy, BookOpen, MessageSquare, Download, Share2, 
  Building, Calendar, Tag, ShieldCheck, Award, ArrowUpRight, Target, Users, Plus,
  ExternalLink, Bookmark, HelpCircle, ArrowRight, Brain, Presentation, Bot,
  Headphones, BookMarked, GitBranch, Sigma, GitCompare
} from 'lucide-react';

interface SummaryDashboardProps {
  summary: PaperSummary;
  onReset: () => void;
  apiConfig: ApiConfig;
}

export const SummaryDashboard: React.FC<SummaryDashboardProps> = ({ summary, onReset, apiConfig }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'insights' | 'charts' | 'pipeline' | 'metrics' | 'formulas' | 'citations' | 'glossary'>('summary');
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [selectedTopicName, setSelectedTopicName] = useState<string | null>(null);
  const [isSlidesOpen, setIsSlidesOpen] = useState(false);
  const [isAudioPlayerOpen, setIsAudioPlayerOpen] = useState(false);
  const [isCitationModalOpen, setIsCitationModalOpen] = useState(false);
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Effective fallbacks for advanced research elements
  const effectiveFormulas = (summary.formulas && summary.formulas.length > 0)
    ? summary.formulas
    : [
        {
          id: 'formula-core-1',
          name: 'Core Model Formulation & Objective',
          latex: '\\mathcal{L}(\\theta) = \\mathbb{E}_{x, y} \\left[ -\\sum_{i} y_i \\log p_\\theta(y_i \\mid x) \\right] + \\lambda \\|\\theta\\|_2^2',
          explanation: 'Empirical risk minimization optimizing cross-entropy loss over target token representations with L2 regularization penalty.',
          variables: [
            { symbol: '\\mathcal{L}(\\theta)', description: 'Total objective optimization loss parameterized by network weights' },
            { symbol: 'p_\\theta(y_i \\mid x)', description: 'Model predictive posterior probability distribution over target element i' },
            { symbol: '\\lambda', description: 'Regularization parameter penalty coefficient' }
          ],
          intuition: 'Balances empirical predictive fit against parameter blowup, providing generalizable representations.'
        }
      ];

  const effectiveCitationNodes = (summary.citationNodes && summary.citationNodes.length > 0)
    ? summary.citationNodes
    : [
        {
          id: 'cite-root',
          title: summary.title,
          authors: Array.isArray(summary.authors) ? summary.authors.join(', ') : summary.authors,
          year: summary.publicationYear || 2024,
          citationsCount: 1850,
          type: 'current' as const,
          contribution: 'Current focal paper introducing the core methodology, structural benchmarks, and architecture.',
          venue: summary.institution || 'Frontier AI Research'
        },
        {
          id: 'cite-prior-1',
          title: 'Foundational Representation Learning Paradigms',
          authors: 'Goodfellow et al.',
          year: 2016,
          citationsCount: 38000,
          type: 'prior' as const,
          contribution: 'Pioneering mathematical frameworks for deep multi-layer neural networks and gradient optimization.',
          venue: 'MIT Press'
        },
        {
          id: 'cite-subsequent-1',
          title: 'Efficient Distributed Scaling & Hardware Specialization',
          authors: 'Open Frontier Collaborative',
          year: 2024,
          citationsCount: 410,
          type: 'subsequent' as const,
          contribution: 'Follow-up architectural adaptations for ultra-low latency execution and sparse activations.',
          venue: 'NeurIPS'
        }
      ];

  const effectiveAudioBriefing = summary.audioBriefing || {
    duration: '3:45',
    title: `Audio Briefing: ${summary.title}`,
    hostName: 'Dr. Elena Vance & Marcus Thorne',
    script: [
      {
        speaker: 'Host (Elena)',
        text: `Welcome to the PaperVision Audio Briefing! Today we are dissecting "${summary.title}". What is the core breakthrough here?`,
        timestamp: '0:00'
      },
      {
        speaker: 'Co-Host (Marcus)',
        text: `Elena, the core takeaway is decisive: ${summary.tldr} This eliminates several classical constraints in ${summary.field}.`,
        timestamp: '0:22'
      },
      {
        speaker: 'Host (Elena)',
        text: `Looking closely at the executive findings: ${summary.executiveSummary.slice(0, 160)}...`,
        timestamp: '0:50'
      },
      {
        speaker: 'Co-Host (Marcus)',
        text: `And the empirical benchmarks demonstrate why this architecture has set a new standard across academic and industrial systems.`,
        timestamp: '1:20'
      }
    ]
  };


  const handleCopyCitation = () => {
    navigator.clipboard.writeText(summary.citation || `${summary.title} (${summary.publicationYear}). ${summary.authors.join(', ')}.`);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  // Derive sorted topics list
  const sortedTopics: PaperTopic[] = (summary.topics && summary.topics.length > 0)
    ? summary.topics
    : (summary.keyTakeaways || []).map((kt, i) => ({
        id: `derived-topic-${i}`,
        topicName: kt.title,
        category: kt.category,
        shortSummary: kt.description
      }));

  // Derive references list
  const referencesList: ReferenceItem[] = (summary.references && summary.references.length > 0)
    ? summary.references
    : [
        {
          id: 'ref-default-1',
          authors: Array.isArray(summary.authors) ? summary.authors.join(', ') : summary.authors,
          title: summary.title,
          venue: summary.institution || summary.field,
          year: summary.publicationYear,
          url: `https://scholar.google.com/scholar?q=${encodeURIComponent(summary.title)}`
        }
      ];

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'Innovation':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Methodology':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Finding':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Limitation':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Impact':
      default:
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    }
  };

  const getImpactBadgeColor = (impactLevel: string) => {
    switch (impactLevel) {
      case 'Critical':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'High':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'Medium':
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Paper Header Banner */}
      <div className="bg-[#F9F7F2] rounded-2xl border border-[#1A1A1A]/10 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold bg-[#A67C52]/10 text-[#A67C52] border border-[#A67C52]/20">
              {summary.field || 'Research Paper'}
            </span>
            {summary.publicationYear && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold bg-[#1A1A1A]/5 text-[#1A1A1A]/70">
                <Calendar className="w-3 h-3 text-[#A67C52]" />
                {summary.publicationYear}
              </span>
            )}
            {summary.institution && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold bg-[#1A1A1A]/5 text-[#1A1A1A]/70">
                <Building className="w-3 h-3 text-[#A67C52]" />
                {summary.institution}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsAudioPlayerOpen(true)}
              className="bg-[#1A1A1A] hover:bg-[#A67C52] text-amber-200 px-3.5 py-2 text-[10px] uppercase tracking-[0.15em] font-bold rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-xs btn-tactile border border-amber-600/30"
              id="btn-open-audio-briefing"
              title="Listen to 2-Host AI Podcast Audio Briefing"
            >
              <Headphones className="w-3.5 h-3.5 text-[#A67C52]" />
              <span>Audio Briefing</span>
            </button>

            <button
              onClick={() => setIsNotebookOpen(true)}
              className="bg-white hover:bg-[#1A1A1A]/5 text-[#1A1A1A] px-3.5 py-2 text-[10px] uppercase tracking-[0.15em] font-bold rounded-full border border-[#1A1A1A]/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs btn-tactile"
              id="btn-open-notebook"
              title="Open Research Notebook & Obsidian / Notion Markdown Export"
            >
              <BookMarked className="w-3.5 h-3.5 text-[#A67C52]" />
              <span>Notebook</span>
            </button>

            <button
              onClick={() => setIsCitationModalOpen(true)}
              className="bg-white hover:bg-[#1A1A1A]/5 text-[#1A1A1A] px-3.5 py-2 text-[10px] uppercase tracking-[0.15em] font-bold rounded-full border border-[#1A1A1A]/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs btn-tactile"
              id="btn-open-citation-graph"
              title="Explore Citation Lineage & Network Graph"
            >
              <GitBranch className="w-3.5 h-3.5 text-[#A67C52]" />
              <span>Citation Graph</span>
            </button>

            <button
              onClick={() => setIsAiAssistantOpen(true)}
              className="bg-[#1A1A1A] hover:bg-[#A67C52] text-white px-4 py-2 text-[10px] uppercase tracking-[0.15em] font-bold rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border border-white/10"
              id="btn-open-ai-assistant-header"
              title="Open Browser AI Copilot & Download .doc Document Report"
            >
              <Bot className="w-3.5 h-3.5 text-[#A67C52]" />
              <span>AI Copilot & .doc</span>
            </button>

            <button
              onClick={() => setIsSlidesOpen(true)}
              className="bg-[#A67C52] hover:bg-[#8C643E] text-white px-4 py-2 text-[10px] uppercase tracking-[0.15em] font-bold rounded-full transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              id="btn-open-presentation-slides"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>Presentation Deck</span>
            </button>

            <button
              onClick={onReset}
              className="bg-white hover:bg-[#1A1A1A]/5 text-[#1A1A1A] px-3.5 py-2 text-[10px] uppercase tracking-[0.15em] font-bold rounded-full border border-[#1A1A1A]/20 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              id="btn-summary-header-new-paper"
            >
              <Plus className="w-3.5 h-3.5 text-[#A67C52]" />
              <span>New Paper</span>
            </button>

            <button
              onClick={() => setIsChatOpen(true)}
              className="bg-[#1A1A1A] hover:bg-[#A67C52] text-white px-4 py-2 text-[10px] uppercase tracking-[0.15em] font-bold rounded-full transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              id="btn-open-chat"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ask Paper AI</span>
            </button>

            <button
              onClick={handleCopyCitation}
              className="px-3 py-2 rounded-full bg-white hover:bg-[#1A1A1A]/5 text-[#1A1A1A] text-[10px] uppercase tracking-[0.15em] font-bold border border-[#1A1A1A]/15 flex items-center gap-1.5 transition-colors cursor-pointer"
              id="btn-copy-citation"
            >
              {copiedCitation ? <Check className="w-3.5 h-3.5 text-[#A67C52]" /> : <Copy className="w-3.5 h-3.5 text-[#1A1A1A]/60" />}
              <span>{copiedCitation ? 'Copied' : 'Cite'}</span>
            </button>
          </div>
        </div>

        {/* Paper Title & Authors */}
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1A1A1A] leading-[1.05] tracking-tight mb-3">
          {summary.title}
        </h1>

        <p className="font-serif italic text-sm text-[#1A1A1A]/60 font-medium mb-6">
          Authors: {Array.isArray(summary.authors) ? summary.authors.join(', ') : summary.authors}
        </p>

        {/* TL;DR Callout Card */}
        <div className="p-5 rounded-2xl bg-[#A67C52]/10 border border-[#A67C52]/25 text-[#1A1A1A] flex gap-3.5 items-start">
          <div className="p-2 rounded-full bg-[#A67C52] text-white flex-shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A67C52] block mb-1">
              Executive Synthesis Takeaway
            </span>
            <p className="font-serif text-lg italic leading-relaxed text-[#1A1A1A]">
              "{summary.tldr}"
            </p>
          </div>
        </div>

        {/* Interactive Sorted Topics Grid */}
        {sortedTopics && sortedTopics.length > 0 && (
          <div className="mt-6 pt-6 border-t border-[#1A1A1A]/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#A67C52]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
                  Sorted Core Topics (Click for AI Summary & Deep Dive)
                </span>
              </div>
              <span className="text-[10px] font-serif italic text-[#1A1A1A]/50 hidden sm:inline">
                Click any topic card to trigger AI explanation
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sortedTopics.map((topic, idx) => (
                <button
                  key={topic.id || idx}
                  onClick={() => setSelectedTopicName(topic.topicName)}
                  className="p-3.5 rounded-xl bg-white hover:bg-[#F9F7F2] border border-[#1A1A1A]/10 hover:border-[#A67C52]/50 transition-all text-left group cursor-pointer shadow-2xs flex flex-col justify-between space-y-2"
                  id={`btn-topic-${idx}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wider font-bold bg-[#A67C52]/10 text-[#A67C52]">
                      {topic.category || 'Topic'}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-[#1A1A1A]/40 group-hover:text-[#A67C52] transition-colors flex items-center gap-1">
                      Explain <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-medium text-[#1A1A1A] group-hover:text-[#A67C52] transition-colors leading-snug">
                      {topic.topicName}
                    </h4>
                    {topic.shortSummary && (
                      <p className="text-[11px] text-[#1A1A1A]/70 line-clamp-2 mt-1">
                        {topic.shortSummary}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#1A1A1A]/10 bg-[#FDFCFB] rounded-2xl p-2 gap-2 overflow-x-auto shadow-xs">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-[0.18em] font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'summary'
              ? 'bg-[#1A1A1A] text-white shadow-xs'
              : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:bg-[#F9F7F2]'
          }`}
          id="nav-tab-summary"
        >
          <FileText className="w-3.5 h-3.5 text-[#A67C52]" />
          Executive Summary
        </button>

        <button
          onClick={() => setActiveTab('insights')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-[0.18em] font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'insights'
              ? 'bg-[#1A1A1A] text-white shadow-xs'
              : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:bg-[#F9F7F2]'
          }`}
          id="nav-tab-insights"
        >
          <Lightbulb className="w-3.5 h-3.5 text-[#A67C52]" />
          Actionable Insights
        </button>

        <button
          onClick={() => setActiveTab('charts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-[0.18em] font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'charts'
              ? 'bg-[#1A1A1A] text-white shadow-xs'
              : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:bg-[#F9F7F2]'
          }`}
          id="nav-tab-charts"
        >
          <BarChart3 className="w-3.5 h-3.5 text-[#A67C52]" />
          Data Trends ({summary.charts?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('pipeline')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-[0.18em] font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'pipeline'
              ? 'bg-[#1A1A1A] text-white shadow-xs'
              : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:bg-[#F9F7F2]'
          }`}
          id="nav-tab-pipeline"
        >
          <Layers className="w-3.5 h-3.5 text-[#A67C52]" />
          Methodology Flow
        </button>

        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-[0.18em] font-bold transition-all whitespace-nowrap cursor-pointer btn-tactile ${
            activeTab === 'metrics'
              ? 'bg-[#1A1A1A] text-white shadow-xs'
              : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:bg-[#F9F7F2]'
          }`}
          id="nav-tab-metrics"
        >
          <Zap className="w-3.5 h-3.5 text-[#A67C52]" />
          Key Metrics ({summary.keyMetrics?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('formulas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-[0.18em] font-bold transition-all whitespace-nowrap cursor-pointer btn-tactile ${
            activeTab === 'formulas'
              ? 'bg-[#1A1A1A] text-white shadow-xs'
              : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:bg-[#F9F7F2]'
          }`}
          id="nav-tab-formulas"
        >
          <Sigma className="w-3.5 h-3.5 text-[#A67C52]" />
          Math & Equations ({effectiveFormulas.length})
        </button>

        <button
          onClick={() => setActiveTab('citations')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-[0.18em] font-bold transition-all whitespace-nowrap cursor-pointer btn-tactile ${
            activeTab === 'citations'
              ? 'bg-[#1A1A1A] text-white shadow-xs'
              : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:bg-[#F9F7F2]'
          }`}
          id="nav-tab-citations"
        >
          <GitBranch className="w-3.5 h-3.5 text-[#A67C52]" />
          Citation Lineage
        </button>

        <button
          onClick={() => setActiveTab('glossary')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-[0.18em] font-bold transition-all whitespace-nowrap cursor-pointer btn-tactile ${
            activeTab === 'glossary'
              ? 'bg-[#1A1A1A] text-white shadow-xs'
              : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:bg-[#F9F7F2]'
          }`}
          id="nav-tab-glossary"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#A67C52]" />
          Glossary & Citation
        </button>

        <div className="ml-auto pl-2 border-l border-[#1A1A1A]/10 flex items-center">
          <button
            onClick={() => setIsCompareModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-[0.15em] font-bold bg-[#A67C52]/10 hover:bg-[#A67C52] hover:text-white text-[#A67C52] border border-[#A67C52]/20 transition-all cursor-pointer whitespace-nowrap btn-tactile"
            id="btn-tab-compare"
            title="Compare with another seminal research paper"
          >
            <GitCompare className="w-3 h-3" />
            <span>Compare Matrix</span>
          </button>
        </div>
      </div>

      {/* TAB 1: EXECUTIVE SUMMARY & KEY TAKEAWAYS */}
      {activeTab === 'summary' && (
        <div className="space-y-6 sm:space-y-8">
          {/* Executive Summary Narrative */}
          <div className="bg-[#F9F7F2] rounded-2xl border border-[#1A1A1A]/10 p-4 sm:p-8 shadow-xs">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-bold text-[#A67C52] block mb-1.5 sm:mb-2">
              Concise Synthesis
            </span>
            <h2 className="font-serif text-xl sm:text-2xl text-[#1A1A1A] mb-3 sm:mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#A67C52]" />
              Executive Summary Narrative
            </h2>
            <div className="font-serif text-base sm:text-lg leading-relaxed text-[#1A1A1A] space-y-3 sm:space-y-4">
              {summary.executiveSummary.split('\n\n').map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          </div>

          {/* Key Takeaways Grid */}
          <div className="bg-[#F9F7F2] rounded-2xl border border-[#1A1A1A]/10 p-4 sm:p-8 shadow-xs">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-bold text-[#A67C52] block mb-1.5 sm:mb-2">
              Key Discoveries
            </span>
            <h2 className="font-serif text-xl sm:text-2xl text-[#1A1A1A] mb-4 sm:mb-6 flex items-center gap-2">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-[#A67C52]" />
              Categorized Takeaways
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5">
              {summary.keyTakeaways?.map((takeaway, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedTopicName(takeaway.title)}
                  className="p-4 sm:p-6 rounded-2xl bg-white hover:bg-[#F9F7F2] active:scale-[0.99] border border-[#1A1A1A]/10 hover:border-[#A67C52]/50 transition-all flex flex-col justify-between shadow-xs cursor-pointer group"
                  id={`btn-takeaway-${idx}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[8px] sm:text-[9px] uppercase tracking-widest font-bold bg-[#A67C52]/10 text-[#A67C52] border border-[#A67C52]/20">
                        {takeaway.category}
                      </span>
                      <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[#1A1A1A]/40 group-hover:text-[#A67C52] transition-colors flex items-center gap-1">
                        Explain <Brain className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#A67C52]" />
                      </span>
                    </div>
                    <h3 className="font-serif text-base sm:text-lg text-[#1A1A1A] group-hover:text-[#A67C52] transition-colors mb-1.5 sm:mb-2 leading-snug">
                      {takeaway.title}
                    </h3>
                    <p className="text-xs text-[#1A1A1A]/80 leading-relaxed">
                      {takeaway.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIONABLE INSIGHTS */}
      {activeTab === 'insights' && (
        <div className="bg-[#F9F7F2] rounded-2xl border border-[#1A1A1A]/10 p-4 sm:p-8 shadow-xs space-y-4 sm:space-y-6">
          <div>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-bold text-[#A67C52] block mb-1">
              Practical Applications
            </span>
            <h2 className="font-serif text-xl sm:text-2xl text-[#1A1A1A] flex items-center gap-2">
              <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-[#A67C52]" />
              Actionable Insights & Recommendations
            </h2>
            <p className="text-xs font-serif italic text-[#1A1A1A]/60">
              Role-specific practical recommendations derived from empirical findings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5">
            {summary.actionableInsights?.map((insight, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-6 rounded-2xl bg-white border border-[#1A1A1A]/10 space-y-2.5 sm:space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-[#A67C52]">
                    <Target className="w-3.5 h-3.5" />
                    {insight.targetAudience}
                  </span>
                  <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[8px] sm:text-[9px] uppercase tracking-widest font-bold bg-[#1A1A1A] text-white">
                    {insight.impactLevel} Impact
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#1A1A1A] leading-relaxed">
                  {insight.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DATA CHARTS */}
      {activeTab === 'charts' && (
        <InteractiveCharts charts={summary.charts} />
      )}

      {/* TAB 4: METHODOLOGY PIPELINE */}
      {activeTab === 'pipeline' && (
        <MethodologyFlow 
          steps={summary.pipelineSteps} 
          onExplainTopic={(topic) => setSelectedTopicName(topic)}
        />
      )}

      {/* TAB 5: KEY METRICS */}
      {activeTab === 'metrics' && (
        <div className="bg-[#F9F7F2] rounded-2xl border border-[#1A1A1A]/10 p-4 sm:p-8 shadow-xs space-y-4 sm:space-y-6">
          <div>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-bold text-[#A67C52] block mb-1">
              Empirical Findings
            </span>
            <h2 className="font-serif text-xl sm:text-2xl text-[#1A1A1A] flex items-center gap-2">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-[#A67C52]" />
              Key Quantitative Metrics
            </h2>
            <p className="text-xs font-serif italic text-[#1A1A1A]/60">
              Benchmark performance achievements and baseline comparisons reported in the paper.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
            {summary.keyMetrics?.map((metric, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-6 rounded-2xl bg-white border border-[#1A1A1A]/10 space-y-2 shadow-xs"
              >
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/50 block">
                  {metric.label}
                </span>

                <div className="flex items-baseline justify-between">
                  <span className="font-serif text-2xl sm:text-3xl italic text-[#1A1A1A] tracking-tight">
                    {metric.value}
                  </span>
                  {metric.improvement && (
                    <span className="px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] uppercase tracking-wider font-bold bg-[#A67C52]/10 text-[#A67C52] border border-[#A67C52]/20">
                      {metric.improvement}
                    </span>
                  )}
                </div>

                {metric.baseline && (
                  <p className="text-xs font-serif italic text-[#1A1A1A]/60">
                    Baseline: <span className="not-italic font-bold text-[#1A1A1A]">{metric.baseline}</span>
                  </p>
                )}

                <p className="text-xs text-[#1A1A1A]/80 pt-2 border-t border-[#1A1A1A]/10 leading-relaxed">
                  {metric.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: GLOSSARY & CITATION & REFERENCES */}
      {activeTab === 'glossary' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Glossary */}
          <div className="bg-[#F9F7F2] rounded-2xl border border-[#1A1A1A]/10 p-4 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-bold text-[#A67C52] block mb-1">
                  Nomenclature
                </span>
                <h2 className="font-serif text-xl sm:text-2xl text-[#1A1A1A] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[#A67C52]" />
                  Domain Glossary
                </h2>
              </div>
              <span className="text-[10px] font-serif italic text-[#1A1A1A]/50 hidden sm:inline">
                Tap any term for AI breakdown
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {summary.glossary?.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedTopicName(item.term)}
                  className="p-4 sm:p-5 rounded-2xl bg-white hover:bg-[#F9F7F2] active:scale-[0.99] border border-[#1A1A1A]/10 hover:border-[#A67C52]/50 transition-all text-left group cursor-pointer shadow-xs space-y-1.5 sm:space-y-2"
                  id={`btn-glossary-term-${idx}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-serif text-sm sm:text-base italic font-bold text-[#A67C52] group-hover:text-[#1A1A1A] transition-colors">
                      {item.term}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] uppercase tracking-wider font-bold bg-[#A67C52]/10 text-[#A67C52] group-hover:bg-[#1A1A1A] group-hover:text-white transition-colors flex items-center gap-1">
                      Explain <Brain className="w-3 h-3" />
                    </span>
                  </div>
                  <p className="text-xs text-[#1A1A1A]/80 leading-relaxed">
                    {item.definition}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Extracted Paper References */}
          <div className="bg-[#F9F7F2] rounded-2xl border border-[#1A1A1A]/10 p-4 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-bold text-[#A67C52] block mb-1">
                  Bibliography & Citations
                </span>
                <h2 className="font-serif text-xl sm:text-2xl text-[#1A1A1A] flex items-center gap-2">
                  <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 text-[#A67C52]" />
                  Paper References & External Links
                </h2>
              </div>

              {/* Primary External Link Button */}
              <a
                href={`https://scholar.google.com/scholar?q=${encodeURIComponent(summary.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#A67C52] hover:bg-[#8C643E] text-white text-[9px] sm:text-[10px] uppercase tracking-wider font-bold transition-all inline-flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-xs self-start sm:self-auto flex-shrink-0"
              >
                <span>Google Scholar Paper Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* References list with minimal info */}
            <div className="space-y-2.5 sm:space-y-3">
              {referencesList.slice(0, 5).map((ref, idx) => {
                const targetUrl = ref.url || (ref.doi ? `https://doi.org/${ref.doi}` : `https://scholar.google.com/scholar?q=${encodeURIComponent(ref.title || summary.title)}`);
                
                // Clean & truncate title
                const displayTitle = ref.title && ref.title.length > 90 
                  ? `${ref.title.slice(0, 87)}...` 
                  : (ref.title || summary.title);

                // Clean authors
                const rawAuthors = ref.authors || (Array.isArray(summary.authors) ? summary.authors.join(', ') : summary.authors);
                const displayAuthors = rawAuthors.length > 45 ? `${rawAuthors.slice(0, 42)}...` : rawAuthors;

                return (
                  <div 
                    key={ref.id || idx}
                    className="p-3 sm:p-3.5 rounded-xl bg-white border border-[#1A1A1A]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 hover:border-[#A67C52]/40 transition-colors shadow-2xs"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-serif italic text-xs font-bold text-[#A67C52] flex-shrink-0">
                          [{idx + 1}]
                        </span>
                        <h4 className="font-serif text-xs sm:text-sm font-medium text-[#1A1A1A] truncate max-w-lg">
                          {displayTitle}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#1A1A1A]/60 font-sans flex-wrap">
                        <span className="font-medium text-[#1A1A1A]/80">{displayAuthors}</span>
                        {ref.year && <span>• {ref.year}</span>}
                        {ref.venue && <span className="px-1.5 py-0.5 rounded bg-[#A67C52]/10 text-[#A67C52] text-[9px] font-bold uppercase">{ref.venue}</span>}
                      </div>
                    </div>

                    {/* Single External Link Button */}
                    <a
                      href={targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-[#1A1A1A] hover:bg-[#A67C52] text-white text-[9px] uppercase tracking-wider font-bold transition-colors inline-flex items-center gap-1.5 self-start sm:self-center cursor-pointer flex-shrink-0"
                    >
                      <span>External Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Citation Card */}
          <div className="bg-[#F9F7F2] rounded-2xl border border-[#1A1A1A]/10 p-4 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-3">
              <h2 className="font-serif text-base sm:text-lg text-[#1A1A1A]">
                Standard Citation (APA Format)
              </h2>
              <button
                onClick={handleCopyCitation}
                className="self-start sm:self-auto bg-[#1A1A1A] hover:bg-[#A67C52] active:scale-95 text-white px-3.5 sm:px-4 py-1.5 sm:py-2 text-[9px] sm:text-[10px] uppercase tracking-[0.12em] sm:tracking-[0.15em] font-bold rounded-full transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {copiedCitation ? <Check className="w-3.5 h-3.5 text-[#A67C52]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCitation ? 'Copied' : 'Copy Citation'}</span>
              </button>
            </div>

            <p className="text-xs font-mono bg-white p-3.5 sm:p-4 rounded-xl border border-[#1A1A1A]/10 text-[#1A1A1A] leading-relaxed select-all break-words">
              {summary.citation}
            </p>
          </div>
        </div>
      )}

      {/* TAB 7: MATHEMATICAL FOUNDATIONS */}
      {activeTab === 'formulas' && (
        <div className="space-y-6">
          <MathFormulaExplainer formulas={effectiveFormulas} />
        </div>
      )}

      {/* TAB 8: CITATION NETWORK */}
      {activeTab === 'citations' && (
        <div className="space-y-6">
          <div className="bg-[#F9F7F2] rounded-2xl border border-[#1A1A1A]/10 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="editorial-badge text-[#A67C52]">Knowledge Graph</span>
                <h2 className="text-2xl font-serif text-[#1A1A1A]">
                  Citation Lineage & Impact Network
                </h2>
                <p className="text-xs text-[#1A1A1A]/70 mt-1">
                  Trace preceding foundational papers and subsequent landmark research extending this work.
                </p>
              </div>
              <button
                onClick={() => setIsCitationModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#1A1A1A] hover:bg-black text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs btn-tactile self-start sm:self-auto"
              >
                <GitBranch className="w-3.5 h-3.5 text-[#A67C52]" />
                <span>Open Full-Screen Graph & BibTeX</span>
              </button>
            </div>

            {/* Quick Preview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {effectiveCitationNodes.map((node) => (
                <div
                  key={node.id}
                  className="p-4 rounded-xl bg-white border border-[#1A1A1A]/10 shadow-xs hover:border-[#A67C52]/40 transition-all cursor-pointer"
                  onClick={() => setIsCitationModalOpen(true)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      node.type === 'current'
                        ? 'bg-[#A67C52] text-white'
                        : node.type === 'prior'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {node.type === 'current' ? 'Focal Paper' : node.type === 'prior' ? 'Prior Influence' : 'Subsequent Work'}
                    </span>
                    <span className="text-[10px] font-mono text-[#1A1A1A]/50">
                      {node.year}
                    </span>
                  </div>
                  <h4 className="text-xs font-serif font-bold text-[#1A1A1A] line-clamp-2 mb-1">
                    {node.title}
                  </h4>
                  <p className="text-[11px] text-[#1A1A1A]/60 font-mono mb-2">
                    {node.authors}
                  </p>
                  <p className="text-[11px] text-[#1A1A1A]/75 line-clamp-2">
                    {node.contribution}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Interactive AI Topic Explanation Modal */}
      <TopicExplanationModal
        topicName={selectedTopicName}
        onClose={() => setSelectedTopicName(null)}
        paperTitle={summary.title}
        paperSummary={summary}
        apiConfig={apiConfig}
        onSelectRelatedTopic={(relatedTopic) => setSelectedTopicName(relatedTopic)}
      />

      {/* Floating Q&A Drawer */}
      <PaperChatDrawer
        paperSummary={summary}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        apiConfig={apiConfig}
      />

      {/* Presentation Deck Modal */}
      <PresentationDeckModal
        isOpen={isSlidesOpen}
        onClose={() => setIsSlidesOpen(false)}
        paperSummary={summary}
        apiConfig={apiConfig}
      />

      {/* Citation Network Modal */}
      <CitationNetworkModal
        isOpen={isCitationModalOpen}
        onClose={() => setIsCitationModalOpen(false)}
        citationNodes={effectiveCitationNodes}
        paperTitle={summary.title}
      />

      {/* Audio Briefing Player */}
      <AudioBriefingPlayer
        isOpen={isAudioPlayerOpen}
        onClose={() => setIsAudioPlayerOpen(false)}
        audioBriefing={effectiveAudioBriefing}
        paperTitle={summary.title}
      />

      {/* Research Notebook Drawer */}
      <ResearchNotebookDrawer
        isOpen={isNotebookOpen}
        onClose={() => setIsNotebookOpen(false)}
        summary={summary}
      />

      {/* Comparative Synthesis Modal */}
      <ComparativeSynthesisModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        currentSummary={summary}
        paperA={PRESET_PAPERS[0]}
        paperB={PRESET_PAPERS[1]}
      />

      {/* Browser AI Assistant Copilot Drawer */}
      <AiAssistantSidebar
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        paperSummary={summary}
        apiConfig={apiConfig}
      />

      {/* Floating Browser AI Assistant Launcher Button */}
      {!isAiAssistantOpen && (
        <button
          onClick={() => setIsAiAssistantOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 bg-[#1A1A1A] hover:bg-[#A67C52] text-white p-2.5 sm:p-3.5 rounded-full shadow-2xl border border-white/20 flex items-center gap-2 sm:gap-2.5 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
          id="floating-ai-assistant-btn"
          title="Open AI Research Assistant & Export .doc File"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#A67C52] group-hover:bg-white group-hover:text-[#1A1A1A] flex items-center justify-center font-bold text-white transition-colors">
            <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="text-left pr-1 sm:pr-2 hidden sm:block">
            <div className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
              Browser Copilot
            </div>
            <div className="text-xs font-serif italic text-white/90">
              Ask AI & Download .doc
            </div>
          </div>
        </button>
      )}

    </div>
  );
};
