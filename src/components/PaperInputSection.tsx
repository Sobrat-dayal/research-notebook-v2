import React, { useState } from 'react';
import { 
  FileText, UploadCloud, Link as LinkIcon, Sparkles, 
  BookOpen, Check, AlertCircle, ArrowRight, FileCheck, RefreshCw, Zap, Key, RotateCcw,
  Compass, GitCompare, Headphones, Sigma, BookMarked
} from 'lucide-react';
import { PRESET_PAPERS } from '../data/presetPapers';
import { ApiConfig, PresetPaper } from '../types';

interface PaperInputSectionProps {
  onSummarizeText: (text: string, title?: string) => void;
  onSummarizeFile: (fileBase64: string, mimeType: string, filename: string) => void;
  onSelectPreset: (preset: PresetPaper) => void;
  isLoading: boolean;
  apiConfig: ApiConfig;
  onOpenApiSettings: () => void;
  onOpenExplorer?: () => void;
  onOpenCompare?: () => void;
}

export const PaperInputSection: React.FC<PaperInputSectionProps> = ({
  onSummarizeText,
  onSummarizeFile,
  onSelectPreset,
  isLoading,
  apiConfig,
  onOpenApiSettings,
  onOpenExplorer,
  onOpenCompare
}) => {
  const [activeTab, setActiveTab] = useState<'preset' | 'file' | 'text' | 'url'>('preset');
  
  // Text input state
  const [paperTitleInput, setPaperTitleInput] = useState('');
  const [paperTextInput, setPaperTextInput] = useState('');

  // URL input state
  const [urlInput, setUrlInput] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [urlError, setUrlError] = useState('');

  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Handle File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSubmit = () => {
    if (!selectedFile) return;

    const reader = new FileReader();
    if (selectedFile.type === 'application/pdf') {
      reader.readAsDataURL(selectedFile);
      reader.onload = () => {
        const resultStr = reader.result as string;
        const base64Data = resultStr.split(',')[1];
        onSummarizeFile(base64Data, 'application/pdf', selectedFile.name);
      };
    } else {
      // Plain text or markdown
      reader.readAsText(selectedFile);
      reader.onload = () => {
        const text = reader.result as string;
        onSummarizeText(text, selectedFile.name.replace(/\.[^/.]+$/, ''));
      };
    }
  };

  // Handle Fetch URL
  const handleFetchUrl = async () => {
    if (!urlInput.trim()) return;
    setIsFetchingUrl(true);
    setUrlError('');

    try {
      const response = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: urlInput.trim(),
          apiConfig
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch paper content from URL');
      }

      setPaperTextInput(data.extractedText || '');
      setPaperTitleInput(urlInput.includes('arxiv.org') ? `arXiv Paper (${urlInput})` : 'Imported Research Paper');
      setActiveTab('text');
    } catch (err: any) {
      setUrlError(err.message || 'Error importing from URL. Please try pasting the text directly.');
    } finally {
      setIsFetchingUrl(false);
    }
  };

  // Clear all form inputs
  const handleClearAllInputs = () => {
    setPaperTitleInput('');
    setPaperTextInput('');
    setUrlInput('');
    setSelectedFile(null);
    setUrlError('');
  };

  const hasAnyInput = Boolean(paperTitleInput || paperTextInput || urlInput || selectedFile);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Hero Welcome Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#A67C52]/10 border border-[#A67C52]/20 text-[#A67C52] text-[10px] uppercase tracking-[0.2em] font-bold mb-4 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#A67C52]" />
          Academic Intelligence Synthesis Engine
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#1A1A1A] leading-[1.05] tracking-tight mb-4">
          Transform Research Papers into <br className="hidden sm:inline" />
          <span className="italic font-normal text-[#A67C52]">Executive Intelligence & Visual Trends</span>
        </h1>
        <p className="font-serif italic text-[#1A1A1A]/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-4">
          Synthesize complex academic literature into actionable executive summaries, methodology steps, and quantitative data trends in seconds.
        </p>

        {/* API Engine Quick Status Banner & Quick Actions */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-2">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#F9F7F2] border border-[#1A1A1A]/10 text-xs shadow-xs">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#1A1A1A]/60">Engine:</span>
            <span className="font-bold text-[#A67C52] font-serif italic">
              {apiConfig.apiKey ? `${apiConfig.provider.toUpperCase()} (${apiConfig.modelName})` : 'Google Gemini 3.6 Flash (Default)'}
            </span>
            <button
              onClick={onOpenApiSettings}
              className="text-[10px] uppercase tracking-wider font-bold text-[#1A1A1A] underline hover:text-[#A67C52] cursor-pointer flex items-center gap-1"
              id="btn-hero-api-settings"
            >
              <Key className="w-3 h-3 text-[#A67C52]" />
              Settings
            </button>
          </div>

          {onOpenExplorer && (
            <button
              onClick={onOpenExplorer}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#A67C52] text-[#1A1A1A] hover:text-white border border-[#1A1A1A]/15 text-xs font-semibold shadow-xs transition-all cursor-pointer btn-tactile"
              id="btn-hero-open-explorer"
            >
              <Compass className="w-3.5 h-3.5 text-[#A67C52] group-hover:text-white" />
              <span>Explore arXiv Feed</span>
            </button>
          )}

          {onOpenCompare && (
            <button
              onClick={onOpenCompare}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#A67C52] text-[#1A1A1A] hover:text-white border border-[#1A1A1A]/15 text-xs font-semibold shadow-xs transition-all cursor-pointer btn-tactile"
              id="btn-hero-open-compare"
            >
              <GitCompare className="w-3.5 h-3.5 text-[#A67C52] group-hover:text-white" />
              <span>Compare Matrix</span>
            </button>
          )}
        </div>
      </div>


      {/* Main Input Card Container */}
      <div className="bg-[#F9F7F2] rounded-2xl border border-[#1A1A1A]/10 shadow-sm overflow-hidden transition-all">
        
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 bg-[#FDFCFB] p-2 overflow-x-auto gap-2">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('preset')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-[0.18em] font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'preset'
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:bg-[#F9F7F2]'
              }`}
              id="tab-preset-gallery"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#A67C52]" />
              Landmark Papers Gallery
            </button>

            <button
              onClick={() => setActiveTab('file')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-[0.18em] font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'file'
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:bg-[#F9F7F2]'
              }`}
              id="tab-upload-file"
            >
              <UploadCloud className="w-3.5 h-3.5 text-[#A67C52]" />
              Upload PDF / Document
            </button>

            <button
              onClick={() => setActiveTab('text')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-[0.18em] font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'text'
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:bg-[#F9F7F2]'
              }`}
              id="tab-paste-text"
            >
              <FileText className="w-3.5 h-3.5 text-[#A67C52]" />
              Paste Paper Text
            </button>

            <button
              onClick={() => setActiveTab('url')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-[0.18em] font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'url'
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:bg-[#F9F7F2]'
              }`}
              id="tab-arxiv-url"
            >
              <LinkIcon className="w-3.5 h-3.5 text-[#A67C52]" />
              arXiv / Paper URL
            </button>
          </div>

          {hasAnyInput && (
            <button
              onClick={handleClearAllInputs}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-700 hover:text-rose-950 hover:bg-rose-50 text-[10px] uppercase tracking-wider font-bold transition-colors cursor-pointer whitespace-nowrap"
              title="Clear all form fields and start fresh"
              id="btn-clear-all-inputs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Form</span>
            </button>
          )}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 sm:p-8">
          
          {/* TAB 1: PRESET GALLERY */}
          {activeTab === 'preset' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#A67C52] block mb-1">
                    Curated Literature
                  </span>
                  <h2 className="font-serif text-2xl text-[#1A1A1A] leading-tight">
                    Select a Landmark Paper to Analyze Instantly
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {PRESET_PAPERS.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => onSelectPreset(preset)}
                    className="group relative flex flex-col justify-between p-6 rounded-2xl bg-white border border-[#1A1A1A]/10 hover:border-[#A67C52] transition-all cursor-pointer shadow-xs hover:shadow-md fragment-card"
                    id={`preset-card-${preset.id}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-widest font-bold bg-[#A67C52]/10 text-[#A67C52] border border-[#A67C52]/20">
                          {preset.field}
                        </span>
                        <span className="font-serif italic text-xs text-[#1A1A1A]/50">{preset.year}</span>
                      </div>

                      <h3 className="font-serif text-lg leading-snug text-[#1A1A1A] group-hover:text-[#A67C52] transition-colors line-clamp-2 mb-2">
                        {preset.title}
                      </h3>

                      <p className="text-xs font-serif italic text-[#1A1A1A]/60 mb-3 line-clamp-1">
                        {preset.authors}
                      </p>

                      <p className="text-xs text-[#1A1A1A]/80 line-clamp-3 leading-relaxed mb-4">
                        "{preset.abstractSnippet}"
                      </p>

                      {/* Feature Pills */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-mono bg-amber-50 text-amber-900 border border-amber-200/60 flex items-center gap-1">
                          <Sigma className="w-2.5 h-2.5 text-[#A67C52]" />
                          Math Breakdown
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-mono bg-blue-50 text-blue-900 border border-blue-200/60 flex items-center gap-1">
                          <Headphones className="w-2.5 h-2.5 text-blue-700" />
                          Audio Briefing
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-mono bg-emerald-50 text-emerald-900 border border-emerald-200/60 flex items-center gap-1">
                          <BookMarked className="w-2.5 h-2.5 text-emerald-700" />
                          Citation Graph
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#1A1A1A]/10 flex items-center justify-between text-[10px] uppercase tracking-wider font-bold text-[#A67C52] group-hover:translate-x-1 transition-transform">
                      <span>View Intelligence Synthesis</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: FILE UPLOAD */}
          {activeTab === 'file' && (
            <div className="space-y-6">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all bg-white ${
                  isDragOver
                    ? 'border-[#A67C52] bg-[#A67C52]/5'
                    : 'border-[#1A1A1A]/20 hover:border-[#A67C52]'
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,.txt,.md"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id="file-upload-input"
                />

                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-12 h-12 rounded-full border border-[#1A1A1A]/30 flex items-center justify-center text-[#1A1A1A]">
                    <UploadCloud className="w-5 h-5 text-[#A67C52]" />
                  </div>

                  {selectedFile ? (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#A67C52]/10 border border-[#A67C52]/20 text-[#1A1A1A] text-xs font-bold uppercase tracking-wider">
                      <FileCheck className="w-4 h-4 text-[#A67C52]" />
                      <span>{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="font-serif text-lg text-[#1A1A1A]">
                          Drag and drop your PDF or research document here
                        </p>
                        <p className="text-xs text-[#1A1A1A]/50 mt-1">
                          Supports PDF, TXT, or Markdown files up to 20MB
                        </p>
                      </div>
                      <span className="bg-[#1A1A1A] text-white hover:bg-[#A67C52] px-5 py-2 text-[10px] uppercase tracking-[0.15em] font-bold rounded-full transition-colors inline-block cursor-pointer">
                        Browse Files
                      </span>
                    </>
                  )}
                </div>
              </div>

              {selectedFile && (
                <div className="flex justify-end">
                  <button
                    onClick={handleFileSubmit}
                    disabled={isLoading}
                    className="bg-[#1A1A1A] hover:bg-[#A67C52] text-white px-6 py-3 rounded-full text-[10px] uppercase tracking-[0.15em] font-bold transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs"
                    id="btn-process-file"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[#A67C52]" />
                        <span>Analyzing Document...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Synthesize & Build Charts</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PASTE TEXT */}
          {activeTab === 'text' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-[#1A1A1A]/70 mb-1">
                  Paper Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Climate Dynamics in the Anthropocene"
                  value={paperTitleInput}
                  onChange={(e) => setPaperTitleInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#1A1A1A]/15 bg-white text-[#1A1A1A] text-sm focus:border-[#A67C52] focus:outline-hidden font-serif"
                  id="input-paper-title"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-[#1A1A1A]/70 mb-1">
                  Paste Research Text / Abstract / Methodology
                </label>
                <textarea
                  rows={8}
                  placeholder="Paste the research abstract, methodology, data metrics, or complete text..."
                  value={paperTextInput}
                  onChange={(e) => setPaperTextInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#1A1A1A]/15 bg-white text-[#1A1A1A] text-sm focus:border-[#A67C52] focus:outline-hidden font-serif leading-relaxed"
                  id="textarea-paper-text"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-[#1A1A1A]/50 italic font-serif">
                  {paperTextInput.length > 0 ? `${paperTextInput.length.toLocaleString()} characters` : 'Include methodology & numerical results for richer visual charts.'}
                </span>

                <button
                  onClick={() => onSummarizeText(paperTextInput, paperTitleInput)}
                  disabled={isLoading || !paperTextInput.trim()}
                  className="bg-[#1A1A1A] hover:bg-[#A67C52] text-white px-6 py-3 rounded-full text-[10px] uppercase tracking-[0.15em] font-bold transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs"
                  id="btn-process-text"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#A67C52]" />
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Synthesize Literature</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: URL IMPORT */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-[#1A1A1A]/70 mb-1">
                  arXiv Abstract URL or Open Access Paper Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://arxiv.org/abs/1706.03762"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[#1A1A1A]/15 bg-white text-[#1A1A1A] text-sm focus:border-[#A67C52] focus:outline-hidden font-serif"
                    id="input-paper-url"
                  />
                  <button
                    onClick={handleFetchUrl}
                    disabled={isFetchingUrl || !urlInput.trim()}
                    className="bg-[#1A1A1A] hover:bg-[#A67C52] text-white px-5 py-2.5 rounded-full text-[10px] uppercase tracking-[0.15em] font-bold transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs"
                    id="btn-fetch-url"
                  >
                    {isFetchingUrl ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-[#A67C52]" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                    <span>Import Text</span>
                  </button>
                </div>
              </div>

              {urlError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                  <span>{urlError}</span>
                </div>
              )}

              <p className="text-xs text-[#1A1A1A]/50 italic font-serif">
                Example arXiv links: <code className="bg-white border border-[#1A1A1A]/10 px-1.5 py-0.5 rounded text-[#A67C52] not-italic">https://arxiv.org/abs/1706.03762</code>
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
