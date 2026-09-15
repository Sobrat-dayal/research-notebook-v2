import React, { useState, useRef } from 'react';
import { 
  X, Upload, FileText, Globe, Sparkles, BookOpen, 
  ArrowRight, Check, AlertCircle, FileUp
} from 'lucide-react';
import { PRESET_PAPERS } from '../data/presetPapers';
import { PresetPaper } from '../types';

interface CreateNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: PresetPaper) => void;
  onSummarizeText: (text: string, title?: string) => void;
  onSummarizeFile: (base64: string, mimeType: string, filename: string) => void;
  onSelectArxiv?: (arxivId: string, title: string, fullText: string) => void;
  isDark: boolean;
}

export const CreateNotebookModal: React.FC<CreateNotebookModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
  onSummarizeText,
  onSummarizeFile,
  onSelectArxiv,
  isDark
}) => {
  const [activeTab, setActiveTab] = useState<'arxiv' | 'presets' | 'upload' | 'paste'>('arxiv');
  const [arxivInput, setArxivInput] = useState('');
  const [isResolvingArxiv, setIsResolvingArxiv] = useState(false);
  const [arxivError, setArxivError] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [pastedTitle, setPastedTitle] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleResolveArxiv = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!arxivInput.trim()) return;

    setIsResolvingArxiv(true);
    setArxivError(null);

    try {
      const res = await fetch('/api/arxiv/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: arxivInput.trim() })
      });

      if (!res.ok) throw new Error('Failed to resolve arXiv identifier.');

      const data = await res.json();
      if (onSelectArxiv) {
        onSelectArxiv(data.arxivId, data.title, data.fullText);
      } else {
        onSummarizeText(data.fullText, data.title);
      }
      onClose();
    } catch (err: any) {
      setArxivError(err.message || 'Could not fetch arXiv paper. Please check the URL or ID.');
    } finally {
      setIsResolvingArxiv(false);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      onSummarizeFile(base64, file.type || 'application/pdf', file.name);
      onClose();
    };
    reader.readAsDataURL(file);
  };

  const handlePasteSubmit = () => {
    if (!pastedText.trim()) return;
    onSummarizeText(pastedText, pastedTitle.trim() || 'Custom Research Document');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full max-w-2xl rounded-3xl border flex flex-col overflow-hidden shadow-2xl animate-fade-in ${
        isDark ? 'bg-[#1E1F20] border-[#28292A] text-white' : 'bg-white border-[#E8EAED] text-[#1F1F1F]'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-inherit flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm">Add Sources & Create Notebook</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={`flex border-b text-xs font-medium px-4 overflow-x-auto ${
          isDark ? 'border-[#28292A] bg-[#18191A]' : 'border-[#E8EAED] bg-[#F8F9FA]'
        }`}>
          <button
            onClick={() => setActiveTab('arxiv')}
            className={`py-3 px-3.5 border-b-2 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'arxiv'
                ? isDark ? 'border-amber-400 text-amber-400' : 'border-amber-600 text-amber-600'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>arXiv Link / ID</span>
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`py-3 px-3.5 border-b-2 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'presets'
                ? isDark ? 'border-blue-400 text-blue-400' : 'border-blue-600 text-blue-600'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Curated Benchmarks ({PRESET_PAPERS.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-3.5 border-b-2 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'upload'
                ? isDark ? 'border-blue-400 text-blue-400' : 'border-blue-600 text-blue-600'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload PDF / Text</span>
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`py-3 px-3.5 border-b-2 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'paste'
                ? isDark ? 'border-blue-400 text-blue-400' : 'border-blue-600 text-blue-600'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Paste Notes</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* ARXIV LINK TAB */}
          {activeTab === 'arxiv' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-xs font-semibold">Paste arXiv Paper URL or ID</h4>
                <p className="text-xs text-stone-400">
                  Accepts full URLs (e.g. <code className="font-mono text-amber-400">https://arxiv.org/abs/1706.03762</code>) or raw IDs (<code className="font-mono text-amber-400">1706.03762</code>, <code className="font-mono text-amber-400">2107.03374</code>). We will automatically extract metadata, abstract, and formulations.
                </p>
              </div>

              {arxivError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{arxivError}</span>
                </div>
              )}

              <form onSubmit={handleResolveArxiv} className="space-y-3">
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    required
                    placeholder="https://arxiv.org/abs/1706.03762 or 1706.03762"
                    value={arxivInput}
                    onChange={e => setArxivInput(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border outline-none font-mono ${
                      isDark ? 'bg-[#18191A] border-[#3C4043] text-white focus:border-amber-400' : 'bg-stone-50 border-[#DADCE0] focus:border-amber-600'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2 text-[11px] text-stone-400">
                    <span>Quick presets:</span>
                    <button
                      type="button"
                      onClick={() => setArxivInput('https://arxiv.org/abs/1706.03762')}
                      className="text-amber-400 hover:underline cursor-pointer"
                    >
                      Attention (Transformer)
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setArxivInput('https://arxiv.org/abs/2107.03374')}
                      className="text-amber-400 hover:underline cursor-pointer"
                    >
                      AlphaFold
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isResolvingArxiv || !arxivInput.trim()}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <span>{isResolvingArxiv ? 'Fetching arXiv...' : 'Load & Synthesize'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* PRESETS TAB */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs text-stone-400 mb-3">
                Select an instant research paper to load with full multi-source context, pre-synthesized takeaways, formulas, and slide decks:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PRESET_PAPERS.map(paper => (
                  <div
                    key={paper.id}
                    onClick={() => {
                      onSelectPreset(paper);
                      onClose();
                    }}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                      isDark 
                        ? 'bg-[#18191A] border-[#28292A] hover:border-[#3C4043]' 
                        : 'bg-stone-50 border-[#E8EAED] hover:border-[#DADCE0]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-stone-400 mb-1">
                      <span className="font-semibold text-blue-400">{paper.field}</span>
                      <span>{paper.year}</span>
                    </div>
                    <h4 className="text-xs font-semibold line-clamp-2 leading-snug mb-1">
                      {paper.title}
                    </h4>
                    <p className="text-[10px] text-stone-400 line-clamp-1">
                      {paper.authors}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* UPLOAD TAB */}
          {activeTab === 'upload' && (
            <div className="space-y-4 text-center">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-10 cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : isDark ? 'border-[#3C4043] hover:border-blue-400 bg-[#18191A]' : 'border-[#DADCE0] hover:border-blue-500 bg-stone-50'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center mx-auto mb-3">
                  <FileUp className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold mb-1">Upload Research Document</h4>
                <p className="text-xs text-stone-400 mb-3">PDF, TXT, or Markdown (up to 50MB)</p>
                <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-600 text-white shadow-sm inline-block">
                  Browse Files
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.md"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFile(e.target.files[0]);
                  }}
                />
              </div>
            </div>
          )}

          {/* PASTE TAB */}
          {activeTab === 'paste' && (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                  Notebook / Paper Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Consensus in Modern Clusters"
                  value={pastedTitle}
                  onChange={e => setPastedTitle(e.target.value)}
                  className={`w-full text-xs p-2.5 rounded-xl border outline-none ${
                    isDark ? 'bg-[#18191A] border-[#3C4043] text-white' : 'bg-stone-50 border-[#DADCE0]'
                  }`}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                  Document Text / Content
                </label>
                <textarea
                  rows={8}
                  placeholder="Paste research paper text, abstract, methodology, or notes here..."
                  value={pastedText}
                  onChange={e => setPastedText(e.target.value)}
                  className={`w-full text-xs p-3 rounded-xl border outline-none ${
                    isDark ? 'bg-[#18191A] border-[#3C4043] text-white' : 'bg-stone-50 border-[#DADCE0]'
                  }`}
                />
              </div>

              <div className="text-right pt-2">
                <button
                  onClick={handlePasteSubmit}
                  disabled={!pastedText.trim()}
                  className={`px-5 py-2 rounded-full text-xs font-semibold shadow-sm transition-all ${
                    pastedText.trim()
                      ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                      : 'bg-stone-600/30 text-stone-500 cursor-not-allowed'
                  }`}
                >
                  Create & Analyze
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
