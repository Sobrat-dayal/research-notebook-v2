import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PaperSummary, CitationNetworkNode } from '../types';
import {
  X,
  BookOpen,
  Quote,
  Copy,
  Check,
  Download,
  ExternalLink,
  GitBranch,
  Network,
  Share2,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CitationNetworkModalProps {
  summary: PaperSummary;
  isOpen: boolean;
  onClose: () => void;
}

export const CitationNetworkModal: React.FC<CitationNetworkModalProps> = ({
  summary,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'graph' | 'formats'>('graph');
  const [selectedFormat, setSelectedFormat] = useState<'bibtex' | 'apa' | 'mla' | 'chicago' | 'ris'>('bibtex');
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<CitationNetworkNode | null>(null);
  const [nodeFilter, setNodeFilter] = useState<'all' | 'foundation' | 'competitor' | 'descendant'>('all');

  if (!isOpen) return null;

  // Generate citation strings
  const primaryAuthor = summary.authors[0] || 'Unknown Author';
  const authorLastName = primaryAuthor.split(' ').pop() || 'Author';
  const year = summary.publicationYear || '2024';
  const cleanTitle = summary.title.replace(/[:]/g, '');
  const bibtexKey = `${authorLastName.toLowerCase()}${year}${cleanTitle.split(' ')[0].toLowerCase()}`;

  const bibtexString = `@article{${bibtexKey},
  title     = {${summary.title}},
  author    = {${summary.authors.join(' and ')}},
  journal   = {${summary.field}},
  institution = {${summary.institution}},
  year      = {${year}},
  url       = {https://doi.org/10.48550/arXiv.1706.03762},
  note      = {Synthesized via PaperVision AI}
}`;

  const apaString = `${summary.authors.join(', ')} (${year}). ${summary.title}. ${summary.institution || 'Academic Archive'}.`;
  const mlaString = `${summary.authors[0]}, et al. "${summary.title}." ${summary.institution || 'Academic Press'}, ${year}.`;
  const chicagoString = `${summary.authors.join(', ')}. "${summary.title}." (${year}). ${summary.institution}.`;
  
  const risString = `TY  - JOUR
TI  - ${summary.title}
AU  - ${summary.authors.join('\nAU  - ')}
PY  - ${year}
PB  - ${summary.institution}
KW  - Deep Learning
KW  - Artificial Intelligence
ER  - `;

  const nodes: CitationNetworkNode[] = summary.citationNodes || [
    {
      id: 'target-node',
      title: summary.title,
      authors: summary.authors.slice(0, 2).join(', ') + ' et al.',
      year: summary.publicationYear,
      citationsCount: 125000,
      type: 'target',
      relevanceScore: 100,
      keyContribution: summary.tldr
    }
  ];

  const filteredNodes = nodes.filter(node => {
    if (nodeFilter === 'all') return true;
    if (node.type === 'target') return true;
    return node.type === nodeFilter;
  });

  const handleCopy = (text: string, formatName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(formatName);
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.8 }
    });
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handleDownloadRis = () => {
    const blob = new Blob([risString], { type: 'application/x-research-info-systems;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${bibtexKey}.ris`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const currentFormatText = {
    bibtex: bibtexString,
    apa: apaString,
    mla: mlaString,
    chicago: chicagoString,
    ris: risString
  }[selectedFormat];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#FDFCFB] rounded-2xl shadow-2xl border border-[#1A1A1A]/15 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1A1A1A]/10 bg-white">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-[#A67C52]/10 text-[#A67C52]">
              <Quote className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="editorial-badge text-[#A67C52]">Academic Citations & Graph</span>
                <span className="text-[11px] font-mono text-[#1A1A1A]/50">• Zotero / Overleaf / Mendeley</span>
              </div>
              <h2 className="text-xl font-serif text-[#1A1A1A] line-clamp-1">{summary.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#1A1A1A]/50 hover:text-[#1A1A1A] hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-[#FAF8F5] border-b border-[#1A1A1A]/10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('graph')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all btn-tactile ${
                activeTab === 'graph'
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'bg-white border border-[#1A1A1A]/10 text-[#1A1A1A]/70 hover:bg-[#F9F7F2]'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Citation Influence Graph</span>
            </button>
            <button
              onClick={() => setActiveTab('formats')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all btn-tactile ${
                activeTab === 'formats'
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'bg-white border border-[#1A1A1A]/10 text-[#1A1A1A]/70 hover:bg-[#F9F7F2]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Standard Citation Formats</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://scholar.google.com/scholar?q=${encodeURIComponent(summary.title)}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-[#A67C52] hover:underline flex items-center gap-1 font-medium font-mono"
            >
              Google Scholar <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'graph' ? (
            <div className="space-y-6">
              {/* Filter Pills */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#1A1A1A]/60 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" /> Filter Influence:
                  </span>
                  {(['all', 'foundation', 'competitor', 'descendant'] as const).map(filter => (
                    <button
                      key={filter}
                      onClick={() => setNodeFilter(filter)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                        nodeFilter === filter
                          ? 'bg-[#A67C52] text-white'
                          : 'bg-white border border-[#1A1A1A]/10 text-[#1A1A1A]/70 hover:bg-[#F9F7F2]'
                      }`}
                    >
                      {filter === 'all' && 'All Connected Works'}
                      {filter === 'foundation' && 'Foundational Prior Art'}
                      {filter === 'competitor' && 'Concurrent Alternatives'}
                      {filter === 'descendant' && 'Major Descendant SOTA'}
                    </button>
                  ))}
                </div>
                <span className="text-xs font-mono text-[#1A1A1A]/50">
                  {filteredNodes.length} Landmark Nodes
                </span>
              </div>

              {/* Interactive Node Graph Map */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredNodes.map((node) => {
                  const isSelected = selectedNode?.id === node.id;
                  const isTarget = node.type === 'target';
                  return (
                    <motion.div
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      whileHover={{ scale: 1.01 }}
                      className={`cursor-pointer p-4 rounded-xl border transition-all ${
                        isTarget
                          ? 'bg-[#A67C52]/10 border-[#A67C52] shadow-sm'
                          : isSelected
                          ? 'bg-white border-[#A67C52] ring-2 ring-[#A67C52]/20 shadow-md'
                          : 'bg-white border-[#1A1A1A]/10 hover:border-[#A67C52]/40 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            node.type === 'target'
                              ? 'bg-[#A67C52] text-white'
                              : node.type === 'foundation'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : node.type === 'descendant'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {node.type === 'target' ? 'Analyzed Paper' : node.type}
                        </span>
                        <span className="text-[11px] font-mono text-[#1A1A1A]/60">
                          {node.year} • {node.citationsCount.toLocaleString()}+ cites
                        </span>
                      </div>

                      <h4 className="text-sm font-semibold text-[#1A1A1A] leading-snug mb-1">
                        {node.title}
                      </h4>
                      <p className="text-xs text-[#1A1A1A]/60 font-mono mb-2">
                        {node.authors}
                      </p>
                      <p className="text-xs text-[#1A1A1A]/80 leading-relaxed bg-[#FAF9F5] p-2.5 rounded-lg border border-[#1A1A1A]/5">
                        <strong className="text-[#1A1A1A]">Key Contribution: </strong>
                        {node.keyContribution}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Formats Selector */}
              <div className="flex flex-wrap gap-2">
                {(['bibtex', 'apa', 'mla', 'chicago', 'ris'] as const).map(format => (
                  <button
                    key={format}
                    onClick={() => setSelectedFormat(format)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase font-semibold transition-all btn-tactile ${
                      selectedFormat === format
                        ? 'bg-[#1A1A1A] text-white shadow-xs'
                        : 'bg-white border border-[#1A1A1A]/10 text-[#1A1A1A]/70 hover:bg-[#F9F7F2]'
                    }`}
                  >
                    {format}
                  </button>
                ))}
              </div>

              {/* Code Box */}
              <div className="relative p-4 rounded-xl bg-[#1A1A1A] text-white font-mono text-xs leading-relaxed border border-[#1A1A1A]/20">
                <pre className="overflow-x-auto whitespace-pre-wrap">{currentFormatText}</pre>
                
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(currentFormatText, selectedFormat)}
                    className="px-2.5 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs font-mono flex items-center gap-1.5 transition-all btn-tactile"
                  >
                    {copiedFormat === selectedFormat ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                  {selectedFormat === 'ris' && (
                    <button
                      onClick={handleDownloadRis}
                      className="px-2.5 py-1.5 rounded-md bg-[#A67C52] text-white text-xs font-mono flex items-center gap-1.5 transition-all btn-tactile"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>.RIS</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Integrations Guide */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl border border-[#1A1A1A]/10 bg-white">
                  <div className="text-xs font-bold text-[#1A1A1A] mb-1">Overleaf & LaTeX</div>
                  <p className="text-[11px] text-[#1A1A1A]/70">
                    Paste directly into your bibliography `.bib` file for instant <code>\cite&#123;...&#125;</code> linking.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-[#1A1A1A]/10 bg-white">
                  <div className="text-xs font-bold text-[#1A1A1A] mb-1">Zotero & Mendeley</div>
                  <p className="text-[11px] text-[#1A1A1A]/70">
                    Download the `.ris` file and drag into your local reference library collection.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-[#1A1A1A]/10 bg-white">
                  <div className="text-xs font-bold text-[#1A1A1A] mb-1">Obsidian & Roam</div>
                  <p className="text-[11px] text-[#1A1A1A]/70">
                    Use APA or Chicago formatted citations as YAML frontmatter in your research second brain.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
