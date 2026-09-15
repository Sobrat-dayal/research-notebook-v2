import React, { useState, useEffect } from 'react';
import { 
  X, ExternalLink, Sparkles, Flame, TrendingUp, 
  BookOpen, Star, RefreshCw, ArrowRight, Search, 
  Share2, Heart, Award
} from 'lucide-react';
import { PresetPaper } from '../types';
import { PRESET_PAPERS } from '../data/presetPapers';

interface FrontierPaper {
  id: string;
  title: string;
  summary: string;
  authors: string;
  publishedAt: string;
  upvotes: number;
  arxivUrl: string;
  hfUrl: string;
}

interface FrontierPapersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: PresetPaper) => void;
  onSelectArxiv: (arxivId: string, title: string, fullText: string) => void;
  isDark: boolean;
}

export const FrontierPapersModal: React.FC<FrontierPapersModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
  onSelectArxiv,
  isDark
}) => {
  const [activeTab, setActiveTab] = useState<'huggingface' | 'trending' | 'popular' | 'recent'>('huggingface');
  const [hfPapers, setHfPapers] = useState<FrontierPaper[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchHfPapers();
    }
  }, [isOpen]);

  const fetchHfPapers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/huggingface/daily-papers');
      if (res.ok) {
        const data = await res.json();
        setHfPapers(data.papers || []);
      }
    } catch (err) {
      console.warn('Failed to fetch Hugging Face daily papers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleOpenPaperInNotebook = (paper: FrontierPaper) => {
    onSelectArxiv(
      paper.id, 
      paper.title, 
      `${paper.title}\n\nAuthors: ${paper.authors}\narXiv: ${paper.id}\n\nAbstract:\n${paper.summary}`
    );
    onClose();
  };

  const filteredHf = hfPapers.filter(p => 
    p.title.toLowerCase().includes(searchFilter.toLowerCase()) || 
    p.authors.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.id.includes(searchFilter)
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className={`w-full max-w-5xl h-[90vh] rounded-3xl border flex flex-col overflow-hidden shadow-2xl animate-fade-in ${
        isDark ? 'bg-[#18191A] border-[#28292A] text-white' : 'bg-white border-[#E8EAED] text-[#1F1F1F]'
      }`}>
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isDark ? 'border-[#28292A] bg-[#1E1F20]' : 'border-[#E8EAED] bg-[#F8F9FA]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-sm">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-base">Frontier Research & Daily Papers</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Hugging Face & arXiv
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Browse trending, popular, and daily curated landmark AI research papers
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar & Search */}
        <div className={`px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 ${
          isDark ? 'border-[#28292A] bg-[#141516]' : 'border-[#E8EAED] bg-[#F1F3F4]'
        }`}>
          <div className="flex items-center gap-1 sm:gap-2 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('huggingface')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'huggingface'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <span>🤗 Hugging Face Daily</span>
            </button>
            <button
              onClick={() => setActiveTab('popular')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'popular'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Landmark Benchmarks</span>
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'trending'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Trending AI</span>
            </button>
          </div>

          {/* Search Filter */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Filter papers..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border outline-none ${
                isDark ? 'bg-[#1E1F20] border-[#3C4043] text-white' : 'bg-white border-[#DADCE0]'
              }`}
            />
          </div>
        </div>

        {/* Papers Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'huggingface' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span>Directly linked to Hugging Face Daily Papers API & arXiv feeds</span>
                <a 
                  href="https://huggingface.co/papers" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1 text-amber-400 hover:underline"
                >
                  <span>Visit huggingface.co/papers</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {isLoading ? (
                <div className="p-16 text-center text-xs text-stone-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
                  <span>Fetching latest daily papers from Hugging Face...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredHf.map(paper => (
                    <div
                      key={paper.id}
                      className={`p-4 rounded-2xl border flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                        isDark 
                          ? 'bg-[#1E1F20] border-[#28292A] hover:border-[#3C4043]' 
                          : 'bg-stone-50 border-[#E8EAED] hover:border-[#DADCE0]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-2">
                          <span className="font-mono text-amber-400 font-semibold">arXiv:{paper.id}</span>
                          <span className="flex items-center gap-1 text-rose-400 font-semibold">
                            <Heart className="w-3 h-3 fill-rose-400" />
                            <span>{paper.upvotes}</span>
                          </span>
                        </div>

                        <h3 className="font-semibold text-xs leading-snug mb-1 line-clamp-2">
                          {paper.title}
                        </h3>

                        <p className="text-[11px] text-stone-400 line-clamp-1 mb-2">
                          {paper.authors}
                        </p>

                        <p className="text-xs text-stone-300 line-clamp-3 leading-relaxed mb-4">
                          {paper.summary}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-inherit flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <a
                            href={paper.hfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-stone-400 hover:text-amber-400 flex items-center gap-0.5"
                          >
                            <span>Hugging Face</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                          <span className="text-stone-600">•</span>
                          <a
                            href={paper.arxivUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-stone-400 hover:text-blue-400 flex items-center gap-0.5"
                          >
                            <span>arXiv</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>

                        <button
                          onClick={() => handleOpenPaperInNotebook(paper)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1 shadow-sm cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Open in Notebook</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'popular' && (
            <div className="space-y-3">
              <p className="text-xs text-stone-400">
                The most influential foundational AI and deep learning research benchmarks:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {PRESET_PAPERS.map(preset => (
                  <div
                    key={preset.id}
                    className={`p-4 rounded-2xl border flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                      isDark 
                        ? 'bg-[#1E1F20] border-[#28292A] hover:border-[#3C4043]' 
                        : 'bg-stone-50 border-[#E8EAED] hover:border-[#DADCE0]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="font-semibold text-blue-400">{preset.field}</span>
                        <span className="text-stone-400">{preset.year}</span>
                      </div>
                      <h3 className="font-semibold text-xs leading-snug mb-1">
                        {preset.title}
                      </h3>
                      <p className="text-[11px] text-stone-400 mb-2">
                        {preset.authors}
                      </p>
                      <p className="text-xs text-stone-300 line-clamp-3 leading-relaxed mb-4">
                        {preset.abstractSnippet}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-inherit flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400">
                        {preset.badge}
                      </span>
                      <button
                        onClick={() => {
                          onSelectPreset(preset);
                          onClose();
                        }}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Synthesize Notebook</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'trending' && (
            <div className="space-y-3">
              <p className="text-xs text-stone-400">
                Frontier multimodal reasoning, quantized architectures, and affective AI papers:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredHf.slice(0, 6).map(paper => (
                  <div
                    key={paper.id}
                    className={`p-4 rounded-2xl border flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                      isDark 
                        ? 'bg-[#1E1F20] border-[#28292A] hover:border-[#3C4043]' 
                        : 'bg-stone-50 border-[#E8EAED] hover:border-[#DADCE0]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-2">
                        <span className="font-mono text-purple-400 font-semibold">arXiv:{paper.id}</span>
                        <span className="flex items-center gap-1 text-purple-400 font-semibold">
                          <Flame className="w-3 h-3" />
                          <span>{paper.upvotes} upvotes</span>
                        </span>
                      </div>
                      <h3 className="font-semibold text-xs leading-snug mb-1">
                        {paper.title}
                      </h3>
                      <p className="text-[11px] text-stone-400 mb-2">
                        {paper.authors}
                      </p>
                      <p className="text-xs text-stone-300 line-clamp-3 leading-relaxed mb-4">
                        {paper.summary}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-inherit flex items-center justify-end">
                      <button
                        onClick={() => handleOpenPaperInNotebook(paper)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Open in Notebook</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
