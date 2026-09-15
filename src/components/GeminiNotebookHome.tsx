import React, { useState } from 'react';
import { 
  Sparkles, Plus, Search, Grid, List, ChevronDown, Settings, 
  Share2, MoreVertical, BookOpen, FileText, Globe, CheckSquare, 
  Layers, User, ArrowRight, ExternalLink, ShieldCheck, Zap,
  TrendingUp, Compass, Cpu, Network, Binary, Lightbulb, Check,
  Flame, Shield, LogIn, LogOut, Award
} from 'lucide-react';
import { PresetPaper, PaperSummary, ApiConfig } from '../types';
import { PRESET_PAPERS } from '../data/presetPapers';
import { useAuth } from '../context/AuthContext';

interface GeminiNotebookHomeProps {
  onSelectPaper: (preset: PresetPaper) => void;
  onSelectArxiv: (arxivId: string, title: string, fullText: string) => void;
  onOpenCreateModal: () => void;
  onOpenSettings: () => void;
  onOpenAdminPanel: () => void;
  onOpenAuth: (mode?: 'signin' | 'signup' | 'admin') => void;
  onOpenFrontierPapers: () => void;
  recentNotebooks: Array<{
    id: string;
    title: string;
    field: string;
    date: string;
    sourceCount: number;
    arxivId?: string;
    presetId?: string;
    fullText?: string;
  }>;
  apiConfig: ApiConfig;
  isDark: boolean;
}

interface FeaturedNotebook {
  id: string;
  title: string;
  sourceBadge: string;
  dateAndSources: string;
  coverImage: string;
  field: string;
  presetId?: string;
  arxivId?: string;
}

const FEATURED_NOTEBOOKS: FeaturedNotebook[] = [
  {
    id: 'feat-1',
    title: 'Attention Is All You Need (Transformers)',
    sourceBadge: 'Ashish Vaswani et al. (Google Brain)',
    dateAndSources: 'arXiv:1706.03762 · 8 sources',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    field: 'Foundation Architecture',
    presetId: 'transformer-2017',
    arxivId: '1706.03762'
  },
  {
    id: 'feat-2',
    title: 'Deep Residual Learning for Image Recognition',
    sourceBadge: 'Kaiming He et al. (Microsoft Research)',
    dateAndSources: 'arXiv:1512.03385 · 12 sources',
    coverImage: 'https://images.unsplash.com/photo-1507842229451-79731e71a804?auto=format&fit=crop&w=600&q=80',
    field: 'Computer Vision & ResNet',
    presetId: 'ai-fundamentals',
    arxivId: '1512.03385'
  },
  {
    id: 'feat-3',
    title: 'Highly Accurate Protein Structure Prediction with AlphaFold',
    sourceBadge: 'John Jumper et al. (DeepMind)',
    dateAndSources: 'arXiv:2107.03374 · 24 sources',
    coverImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    field: 'Computational Biology',
    presetId: 'disha-2026',
    arxivId: '2107.03374'
  },
  {
    id: 'feat-4',
    title: 'Language Models are Few-Shot Learners (GPT-3)',
    sourceBadge: 'Tom Brown et al. (OpenAI)',
    dateAndSources: 'arXiv:2005.14165 · 31 sources',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    field: 'In-Context Learning',
    presetId: 'vector-embeddings',
    arxivId: '2005.14165'
  },
  {
    id: 'feat-5',
    title: 'Mastering the Game of Go with Deep Neural Networks',
    sourceBadge: 'David Silver et al. (Nature / DeepMind)',
    dateAndSources: 'AlphaGo · 19 sources',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    field: 'Reinforcement Learning',
    presetId: 'algorithm-design',
    arxivId: '1712.01815'
  }
];

export const GeminiNotebookHome: React.FC<GeminiNotebookHomeProps> = ({
  onSelectPaper,
  onSelectArxiv,
  onOpenCreateModal,
  onOpenSettings,
  onOpenAdminPanel,
  onOpenAuth,
  onOpenFrontierPapers,
  recentNotebooks,
  apiConfig,
  isDark
}) => {
  const { currentUser, dbUser, isAdmin, logout } = useAuth();
  const [activeNavTab, setActiveNavTab] = useState<'all' | 'my' | 'discover' | 'shared' | 'collections'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortOrder, setSortOrder] = useState<'recent' | 'az' | 'sources'>('recent');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Quick arXiv Bar State
  const [quickArxivInput, setQuickArxivInput] = useState('');
  const [isResolvingQuick, setIsResolvingQuick] = useState(false);
  const [quickError, setQuickError] = useState<string | null>(null);

  const handleQuickArxivSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickArxivInput.trim()) return;

    setIsResolvingQuick(true);
    setQuickError(null);

    try {
      const res = await fetch('/api/arxiv/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: quickArxivInput.trim() })
      });

      if (!res.ok) throw new Error('Could not fetch arXiv paper.');
      const data = await res.json();
      onSelectArxiv(data.arxivId, data.title, data.fullText);
    } catch (err: any) {
      setQuickError(err.message || 'Failed to fetch arXiv paper.');
    } finally {
      setIsResolvingQuick(false);
    }
  };

  // Filter papers
  const filteredPapers = PRESET_PAPERS.filter(paper => {
    const q = searchQuery.toLowerCase();
    return (
      paper.title.toLowerCase().includes(q) ||
      paper.field.toLowerCase().includes(q) ||
      paper.authors.toLowerCase().includes(q)
    );
  });

  // Color & Icon mapping for notebook cards based on subject
  const getNotebookBadgeDetails = (field: string) => {
    const f = field.toLowerCase();
    if (f.includes('neuro') || f.includes('biology')) {
      return { bg: isDark ? 'bg-purple-950/60 border-purple-500/30 text-purple-300' : 'bg-purple-100 text-purple-800 border-purple-200', icon: Zap };
    }
    if (f.includes('vector') || f.includes('embedding')) {
      return { bg: isDark ? 'bg-blue-950/60 border-blue-500/30 text-blue-300' : 'bg-blue-100 text-blue-800 border-blue-200', icon: TrendingUp };
    }
    if (f.includes('ai') || f.includes('foundation') || f.includes('transformer')) {
      return { bg: isDark ? 'bg-amber-950/60 border-amber-500/30 text-amber-300' : 'bg-amber-100 text-amber-800 border-amber-200', icon: Cpu };
    }
    if (f.includes('algorithm') || f.includes('computer')) {
      return { bg: isDark ? 'bg-orange-950/60 border-orange-500/30 text-orange-300' : 'bg-orange-100 text-orange-800 border-orange-200', icon: Binary };
    }
    return { bg: isDark ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300' : 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: BookOpen };
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#131314] text-[#E3E3E3]' : 'bg-[#F8F9FA] text-[#1F1F1F]'} transition-colors duration-200 font-sans pb-24`}>
      {/* Top Header Bar matching Screenshot 1 */}
      <header className={`sticky top-0 z-30 px-4 sm:px-6 py-3.5 flex items-center justify-between border-b ${isDark ? 'bg-[#131314]/95 border-[#28292A]' : 'bg-[#F8F9FA]/95 border-[#E8EAED]'} backdrop-blur-md`}>
        {/* Left: Gemini Notebook logo + Navigation Pills */}
        <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveNavTab('all')}>
            <div className="relative flex items-center justify-center">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1A73E8] via-[#8AB4F8] to-[#9334E8] flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <span className={`font-medium tracking-tight text-lg sm:text-xl ${isDark ? 'text-white' : 'text-[#1F1F1F]'}`}>
              Gemini Notebook
            </span>
          </div>

          {/* Navigation Filter Pills */}
          <nav className="hidden md:flex items-center gap-1.5 ml-2">
            <button
              onClick={() => setActiveNavTab('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeNavTab === 'all'
                  ? isDark 
                    ? 'bg-[#28292A] text-white border border-[#3C4043]' 
                    : 'bg-[#E8EAED] text-[#1F1F1F] font-semibold'
                  : isDark 
                    ? 'text-[#C4C7C5] hover:bg-[#1E1F20]' 
                    : 'text-[#5E5E5E] hover:bg-[#F1F3F4]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveNavTab('my')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeNavTab === 'my'
                  ? isDark ? 'bg-[#28292A] text-white' : 'bg-[#E8EAED] text-[#1F1F1F] font-semibold'
                  : isDark ? 'text-[#C4C7C5] hover:bg-[#1E1F20]' : 'text-[#5E5E5E] hover:bg-[#F1F3F4]'
              }`}
            >
              My notebooks
            </button>
            <button
              onClick={onOpenFrontierPapers}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                isDark ? 'text-[#C4C7C5] hover:bg-[#1E1F20]' : 'text-[#5E5E5E] hover:bg-[#F1F3F4]'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Hugging Face & Frontier</span>
            </button>
          </nav>
        </div>

        {/* Right Toolbar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Toggle */}
          {isSearchOpen ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Search notebooks, papers..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoFocus
                className={`text-xs px-3 py-1.5 rounded-full border outline-none w-40 sm:w-60 ${
                  isDark ? 'bg-[#1E1F20] border-[#3C4043] text-white' : 'bg-white border-[#DADCE0] text-black'
                }`}
              />
              <button 
                onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                className="p-1 text-xs text-stone-400 hover:text-stone-200"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSearchOpen(true)}
              className={`p-2 rounded-full transition-colors ${
                isDark ? 'hover:bg-[#1E1F20] text-[#C4C7C5]' : 'hover:bg-[#E8EAED] text-[#5E5E5E]'
              }`}
              title="Search notebooks"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* View Toggle */}
          <button
            onClick={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'hover:bg-[#1E1F20] text-[#C4C7C5]' : 'hover:bg-[#E8EAED] text-[#5E5E5E]'
            }`}
            title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </button>

          {/* SaaS Admin Panel Button */}
          <button
            onClick={onOpenAdminPanel}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              isDark 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20' 
                : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
            }`}
            title="Open SaaS User Management Console (Cloud SQL PostgreSQL)"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin Panel</span>
          </button>

          {/* + Create New prominent button (TOP BUTTON) */}
          <button
            onClick={onOpenCreateModal}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold shadow-xs cursor-pointer transition-all duration-200 active:scale-95 ${
              isDark 
                ? 'bg-white text-black hover:bg-stone-200' 
                : 'bg-black text-white hover:bg-stone-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Create new</span>
          </button>

          {/* User Profile / Auth Button */}
          {currentUser || dbUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('signin')}
                className="flex items-center gap-2 p-1 pl-2 rounded-full hover:bg-inherit cursor-pointer"
                title={`Logged in as ${currentUser?.email || dbUser?.email}`}
              >
                <img 
                  src={currentUser?.photoURL || dbUser?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUser?.email || 'admin')}`}
                  alt="Avatar"
                  className="w-7 h-7 rounded-full border border-stone-600 object-cover"
                />
              </button>
              <button
                onClick={logout}
                title="Sign out"
                className="p-1.5 text-stone-400 hover:text-white cursor-pointer hidden sm:block"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth('signin')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                isDark ? 'border-stone-700 hover:bg-stone-800 text-white' : 'border-stone-300 hover:bg-stone-100 text-stone-800'
              }`}
            >
              <LogIn className="w-3.5 h-3.5 text-blue-400" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* HERO: DEDICATED ARXIV LINK PASTE BAR */}
        <section className={`p-6 rounded-3xl border transition-all ${
          isDark ? 'bg-[#18191A] border-[#28292A]' : 'bg-white border-[#E8EAED] shadow-sm'
        }`}>
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">
              <Globe className="w-3.5 h-3.5" />
              <span>Direct arXiv Paper Synthesis</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Paste Any arXiv Link or Identifier
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-xl mx-auto">
              Extract abstract, methodologies, mathematical formulas, and generate instant slide decks from any arXiv URL.
            </p>

            {quickError && (
              <p className="text-xs text-rose-400 font-medium">{quickError}</p>
            )}

            {/* Prominent Input Bar */}
            <form onSubmit={handleQuickArxivSubmit} className="relative flex items-center gap-2 max-w-2xl mx-auto mt-2">
              <div className="relative flex-1">
                <Globe className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  required
                  placeholder="Paste arXiv link (e.g., https://arxiv.org/abs/1706.03762 or 1706.03762)..."
                  value={quickArxivInput}
                  onChange={e => setQuickArxivInput(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 text-xs sm:text-sm rounded-2xl border outline-none font-mono transition-all ${
                    isDark 
                      ? 'bg-[#1E1F20] border-[#3C4043] text-white focus:border-amber-400' 
                      : 'bg-stone-50 border-[#DADCE0] text-black focus:border-amber-600'
                  }`}
                />
              </div>
              <button
                type="submit"
                disabled={isResolvingQuick || !quickArxivInput.trim()}
                className="px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 flex-shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isResolvingQuick ? 'Synthesizing...' : 'Synthesize Paper'}</span>
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-stone-400 pt-1">
              <span>Try well-known papers:</span>
              <button
                type="button"
                onClick={() => setQuickArxivInput('https://arxiv.org/abs/1706.03762')}
                className="text-amber-400 hover:underline cursor-pointer"
              >
                Attention Is All You Need
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setQuickArxivInput('https://arxiv.org/abs/1512.03385')}
                className="text-amber-400 hover:underline cursor-pointer"
              >
                ResNet (Vision)
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setQuickArxivInput('https://arxiv.org/abs/2107.03374')}
                className="text-amber-400 hover:underline cursor-pointer"
              >
                AlphaFold
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 1: Featured notebooks matching Screenshot 1 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h2 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-[#1F1F1F]'}`}>
                Featured Landmark Papers
              </h2>
            </div>
            <button 
              onClick={onOpenFrontierPapers}
              className={`text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                isDark ? 'text-[#8AB4F8] hover:text-[#B2D1FD]' : 'text-blue-600 hover:text-blue-800'
              }`}
            >
              <span>View all (Hugging Face Daily & Trending)</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Featured Horizontal Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {FEATURED_NOTEBOOKS.map((feat) => {
              const matchedPreset = PRESET_PAPERS.find(p => p.id === feat.presetId) || PRESET_PAPERS[0];
              return (
                <div
                  key={feat.id}
                  onClick={() => {
                    if (feat.arxivId) {
                      onSelectPaper({
                        ...matchedPreset,
                        title: feat.title,
                        authors: feat.sourceBadge,
                        field: feat.field
                      });
                    } else {
                      onSelectPaper(matchedPreset);
                    }
                  }}
                  className={`group relative rounded-2xl overflow-hidden cursor-pointer border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between h-[210px] ${
                    isDark 
                      ? 'bg-[#1E1F20] border-[#28292A] hover:border-[#3C4043]' 
                      : 'bg-white border-[#E8EAED] hover:border-[#DADCE0]'
                  }`}
                >
                  {/* Background Image Container */}
                  <div className="absolute inset-0 z-0">
                    <img
                      src={feat.coverImage}
                      alt={feat.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-35 group-hover:opacity-45 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-t from-[#1E1F20] via-[#1E1F20]/75 to-transparent' : 'bg-gradient-to-t from-white via-white/80 to-transparent'}`} />
                  </div>

                  {/* Top Badge */}
                  <div className="relative z-10 p-3.5 flex items-start justify-between">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide backdrop-blur-md ${
                      isDark 
                        ? 'bg-black/50 text-white border border-white/10' 
                        : 'bg-white/80 text-black border border-black/10'
                    }`}>
                      {feat.sourceBadge}
                    </span>
                    <div className="w-6 h-6 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Bottom Text */}
                  <div className="relative z-10 p-3.5 pt-0">
                    <h3 className={`font-semibold text-xs leading-snug line-clamp-2 mb-1.5 ${
                      isDark ? 'text-white' : 'text-[#1F1F1F]'
                    }`}>
                      {feat.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-stone-400">
                      <Globe className="w-3 h-3 text-stone-400" />
                      <span>{feat.dateAndSources}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 2: Recent notebooks */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-[#1F1F1F]'}`}>
              Recent notebooks
            </h2>
            <span className="text-xs text-stone-400">
              {recentNotebooks.length + filteredPapers.length} notebooks saved
            </span>
          </div>

          {/* Grid of Notebooks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
            {/* Card 1: + Create new notebook card (MIDDLE / GRID BUTTON) */}
            <div
              onClick={onOpenCreateModal}
              className={`rounded-2xl border-2 border-dashed p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 hover:-translate-y-1 h-[190px] group ${
                isDark 
                  ? 'border-[#28292A] hover:border-[#8AB4F8] hover:bg-[#1E1F20]/50' 
                  : 'border-[#DADCE0] hover:border-blue-500 hover:bg-white'
              }`}
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${
                isDark ? 'bg-[#28292A] text-[#8AB4F8]' : 'bg-[#E8EAED] text-blue-600'
              }`}>
                <Plus className="w-5 h-5" />
              </div>
              <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-[#1F1F1F]'}`}>
                + Create new notebook
              </span>
              <span className="text-[10px] text-stone-400 mt-1 max-w-[130px]">
                Paste arXiv Link, Upload PDF, or Notes
              </span>
            </div>

            {/* User's dynamically saved recent notebooks from search or upload */}
            {recentNotebooks.map(rn => {
              const badge = getNotebookBadgeDetails(rn.field);
              const BadgeIcon = badge.icon;
              return (
                <div
                  key={rn.id}
                  onClick={() => {
                    if (rn.arxivId) {
                      onSelectArxiv(rn.arxivId, rn.title, rn.fullText || rn.title);
                    } else if (rn.presetId) {
                      const found = PRESET_PAPERS.find(p => p.id === rn.presetId);
                      if (found) onSelectPaper(found);
                    }
                  }}
                  className={`group rounded-2xl border p-4 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg h-[190px] relative ${
                    isDark 
                      ? 'bg-[#1E1F20] border-[#28292A] hover:border-[#3C4043]' 
                      : 'bg-white border-[#E8EAED] hover:border-[#DADCE0]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${badge.bg}`}>
                      <BadgeIcon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-semibold font-mono">
                      Recent
                    </span>
                  </div>

                  <div className="mt-2 flex-1">
                    <h3 className={`font-semibold text-xs leading-snug line-clamp-2 mb-1 group-hover:text-blue-400 transition-colors ${
                      isDark ? 'text-white' : 'text-[#1F1F1F]'
                    }`}>
                      {rn.title}
                    </h3>
                    <p className="text-[10px] text-stone-400 line-clamp-1">
                      {rn.field}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-inherit flex items-center justify-between text-[10px] text-stone-400">
                    <span>{rn.date}</span>
                    <span>{rn.sourceCount} source{rn.sourceCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              );
            })}

            {/* Preset Papers Cards */}
            {filteredPapers.map((paper) => {
              const badgeDetails = getNotebookBadgeDetails(paper.field);
              const BadgeIcon = badgeDetails.icon;

              return (
                <div
                  key={paper.id}
                  onClick={() => onSelectPaper(paper)}
                  className={`group rounded-2xl border p-4 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg h-[190px] relative ${
                    isDark 
                      ? 'bg-[#1E1F20] border-[#28292A] hover:border-[#3C4043]' 
                      : 'bg-white border-[#E8EAED] hover:border-[#DADCE0]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${badgeDetails.bg}`}>
                      <BadgeIcon className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="mt-2 flex-1">
                    <h3 className={`font-semibold text-xs leading-snug line-clamp-2 mb-1 group-hover:text-blue-400 transition-colors ${
                      isDark ? 'text-white' : 'text-[#1F1F1F]'
                    }`}>
                      {paper.title}
                    </h3>
                    <p className="text-[10px] text-stone-400 line-clamp-1">
                      {paper.authors}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-inherit flex items-center justify-between text-[10px] text-stone-400">
                    <span>{paper.year}</span>
                    <span>1 source</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};
