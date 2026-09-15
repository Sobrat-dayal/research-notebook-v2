import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Compass,
  X,
  ExternalLink,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Flame,
  BookOpen,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExplorePaperItem {
  id: string;
  title: string;
  authors: string;
  venue: string;
  year: string;
  category: 'LLMs & AI' | 'Vision & Multimodal' | 'Systems & Hardware' | 'Bio & Science';
  citations: string;
  arxivId: string;
  abstract: string;
  codeUrl?: string;
}

const CURATED_PAPERS: ExplorePaperItem[] = [
  {
    id: 'mamba-2023',
    title: 'Mamba: Linear-Time Sequence Modeling with Selective State Spaces',
    authors: 'Albert Gu, Tri Dao (Carnegie Mellon & Together AI)',
    venue: 'arXiv:2312.00752',
    year: '2023',
    category: 'LLMs & AI',
    citations: '1,450+',
    arxivId: '2312.00752',
    abstract: 'Foundation models are now predominantly based on the Transformer architecture. However, Transformers cannot scale efficiently to long contexts due to quadratic attention. We introduce Mamba, a selective state space model that achieves linear scaling in sequence length with 5x higher inference throughput.',
    codeUrl: 'https://github.com/state-spaces/mamba'
  },
  {
    id: 'flashattention-2',
    title: 'FlashAttention-2: Faster Attention with Better Work Partitioning and Parallelism',
    authors: 'Tri Dao (Princeton University)',
    venue: 'ICLR 2024',
    year: '2023',
    category: 'Systems & Hardware',
    citations: '2,100+',
    arxivId: '2307.08691',
    abstract: 'FlashAttention is an exact attention algorithm that yields 2-4x wall-clock speedup on GPUs. We propose FlashAttention-2 with optimized thread block scheduling and warp work partitioning, achieving up to 73% theoretical peak FLOPs on A100 GPUs.',
    codeUrl: 'https://github.com/Dao-AILab/flash-attention'
  },
  {
    id: 'sam-segment-anything',
    title: 'Segment Anything (SAM)',
    authors: 'Alexander Kirillov, Eric Mintun, Ross Girshick et al. (Meta AI)',
    venue: 'ICCV 2023',
    year: '2023',
    category: 'Vision & Multimodal',
    citations: '4,800+',
    arxivId: '2304.02643',
    abstract: 'We introduce the Segment Anything project: a new task, model, and dataset for image segmentation. Using our efficient model in a data collection loop, we built the largest segmentation dataset to date (over 1 billion masks on 11M licensed images).',
    codeUrl: 'https://github.com/facebookresearch/segment-anything'
  },
  {
    id: 'paged-attention-vllm',
    title: 'Efficient Memory Management for Large Language Model Serving with PagedAttention',
    authors: 'Woosuk Kwon, Zhuohan Li, Siyuan Shen, Ion Stoica et al. (UC Berkeley)',
    venue: 'SOSP 2023',
    year: '2023',
    category: 'Systems & Hardware',
    citations: '1,900+',
    arxivId: '2309.06180',
    abstract: 'High throughput serving of LLMs is bottlenecked by KV cache memory fragmentation. We present PagedAttention, an attention algorithm inspired by virtual memory paging in operating systems, increasing serving throughput by 2-4x in vLLM.',
    codeUrl: 'https://github.com/vllm-project/vllm'
  },
  {
    id: 'esm-3-meta',
    title: 'Simulating 500 Million Years of Evolution with a Language Model (ESM-3)',
    authors: 'Tomasz Krivov et al. (EvolutionaryScale)',
    venue: 'BioRxiv / Nature',
    year: '2024',
    category: 'Bio & Science',
    citations: '420+',
    arxivId: '2406.20792',
    abstract: 'ESM-3 is a multimodal generative frontier model reasoning across protein sequence, structure, and function simultaneously. We demonstrate de novo generation of green fluorescent proteins separated by 500 million years of natural evolution.',
    codeUrl: 'https://github.com/evolutionaryscale/esm'
  }
];

interface PaperExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPaperForAnalysis: (title: string, text: string) => void;
}

export const PaperExplorerModal: React.FC<PaperExplorerModalProps> = ({
  isOpen,
  onClose,
  onSelectPaperForAnalysis
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  if (!isOpen) return null;

  const filteredPapers = CURATED_PAPERS.filter(paper => {
    const matchesCategory = activeCategory === 'all' || paper.category === activeCategory;
    const matchesSearch =
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.abstract.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelect = (paper: ExplorePaperItem) => {
    confetti({ particleCount: 30, spread: 60 });
    onSelectPaperForAnalysis(paper.title, `${paper.title}\n${paper.authors}\n${paper.venue}\n\nAbstract:\n${paper.abstract}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#FDFCFB] rounded-2xl shadow-2xl border border-[#1A1A1A]/15 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1A1A1A]/10 bg-white">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-[#A67C52]/10 text-[#A67C52]">
              <Compass className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="editorial-badge text-[#A67C52]">Research Feed & arXiv Explorer</span>
                <span className="text-[11px] font-mono text-[#1A1A1A]/50">• Semantic Scholar</span>
              </div>
              <h2 className="text-xl font-serif text-[#1A1A1A]">
                Discover & Analyze Frontier Papers
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#1A1A1A]/50 hover:text-[#1A1A1A] hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter bar */}
        <div className="p-6 bg-[#FAF9F5] border-b border-[#1A1A1A]/10 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A1A]/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by paper title, author, keyword (e.g. Mamba, Attention, vLLM)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#1A1A1A]/15 bg-white text-xs text-[#1A1A1A] focus:outline-none focus:border-[#A67C52] focus:ring-1 focus:ring-[#A67C52]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[11px] font-semibold text-[#1A1A1A]/60 flex items-center gap-1 shrink-0">
              <Filter className="w-3 h-3" /> Category:
            </span>
            {(['all', 'LLMs & AI', 'Vision & Multimodal', 'Systems & Hardware', 'Bio & Science'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all whitespace-nowrap btn-tactile ${
                  activeCategory === cat
                    ? 'bg-[#1A1A1A] text-white shadow-xs'
                    : 'bg-white border border-[#1A1A1A]/10 text-[#1A1A1A]/70 hover:bg-[#FAF9F5]'
                }`}
              >
                {cat === 'all' ? 'All Frontier Papers' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Papers List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredPapers.map((paper) => (
            <div
              key={paper.id}
              className="fragment-card p-5 rounded-xl border border-[#1A1A1A]/10 bg-white hover:border-[#A67C52]/40 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#A67C52]/15 text-[#A67C52]">
                    {paper.category}
                  </span>
                  <span className="text-xs font-mono text-[#1A1A1A]/50">
                    {paper.venue} • {paper.citations} cites
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://arxiv.org/abs/${paper.arxivId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-mono text-[#A67C52] hover:underline flex items-center gap-1"
                  >
                    arXiv:{paper.arxivId} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <h3 className="text-base font-serif font-bold text-[#1A1A1A] mb-1 leading-snug">
                {paper.title}
              </h3>
              <p className="text-xs text-[#1A1A1A]/60 font-mono mb-2.5">
                {paper.authors}
              </p>
              <p className="text-xs text-[#1A1A1A]/80 leading-relaxed line-clamp-3 mb-4">
                {paper.abstract}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-[#1A1A1A]/5">
                {paper.codeUrl ? (
                  <a
                    href={paper.codeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono text-[#1A1A1A]/60 hover:text-[#1A1A1A] flex items-center gap-1"
                  >
                    Official Code Repository <ExternalLink className="w-3 h-3" />
                  </a>
                ) : <span />}

                <button
                  onClick={() => handleSelect(paper)}
                  className="px-4 py-2 rounded-lg bg-[#1A1A1A] hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs btn-tactile"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#A67C52]" />
                  <span>Analyze in PaperVision</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
