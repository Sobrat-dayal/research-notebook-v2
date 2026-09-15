import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, BookOpen, Layers, Lightbulb, 
  Brain, RefreshCw, Copy, Check, ExternalLink, ArrowRight, Tag,
  Terminal, Edit3, RotateCcw, Send
} from 'lucide-react';
import { PaperSummary, ApiConfig, TopicExplanation } from '../types';

interface TopicExplanationModalProps {
  topicName: string | null;
  onClose: () => void;
  paperTitle: string;
  paperSummary: PaperSummary;
  apiConfig: ApiConfig;
  onSelectRelatedTopic?: (topic: string) => void;
}

export const TopicExplanationModal: React.FC<TopicExplanationModalProps> = ({
  topicName,
  onClose,
  paperTitle,
  paperSummary,
  apiConfig,
  onSelectRelatedTopic
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<TopicExplanation | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Prompt Editor State
  const [isPromptEditorOpen, setIsPromptEditorOpen] = useState<boolean>(false);
  const [customPromptText, setCustomPromptText] = useState<string>('');

  const getDefaultPrompt = (topic: string) => {
    return `Explain the topic "${topic}" in detail within the context of the research paper "${paperTitle}".
Provide a clear simple layman overview, technical deep dive, importance in research, and related concepts.`;
  };

  useEffect(() => {
    if (!topicName) {
      setExplanation(null);
      setError(null);
      setIsPromptEditorOpen(false);
      return;
    }

    const defaultPrompt = getDefaultPrompt(topicName);
    setCustomPromptText(defaultPrompt);

    fetchExplanation(topicName, defaultPrompt);
  }, [topicName, paperTitle, apiConfig]);

  const fetchExplanation = async (topic: string, promptToSend?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/explain-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicName: topic,
          paperTitle,
          paperContext: {
            tldr: paperSummary.tldr,
            executiveSummary: paperSummary.executiveSummary,
            field: paperSummary.field,
            keyTakeaways: paperSummary.keyTakeaways
          },
          apiConfig,
          customPrompt: promptToSend
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to fetch topic explanation');
      }

      setExplanation(data);
    } catch (err: any) {
      console.error('Topic explanation error:', err);
      setError(err.message || 'An error occurred while generating the topic breakdown.');
    } finally {
      setLoading(false);
    }
  };

  if (!topicName) return null;

  const handleApplyCustomPrompt = () => {
    fetchExplanation(topicName, customPromptText);
    setIsPromptEditorOpen(false);
  };

  const handleResetPrompt = () => {
    const defaultP = getDefaultPrompt(topicName);
    setCustomPromptText(defaultP);
  };

  const handleCopyExplanation = () => {
    if (!explanation) return;
    const fullText = `[AI Explanation: ${explanation.topicName}]\nPaper: ${paperTitle}\n\nSimple Overview:\n${explanation.simpleExplanation}\n\nTechnical Deep Dive:\n${explanation.technicalDeepDive}\n\nSignificance:\n${explanation.importanceInPaper}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#1A1A1A]/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-[#FDFCFB] border border-[#1A1A1A]/15 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 bg-[#F9F7F2] border-b border-[#1A1A1A]/10 flex items-start justify-between gap-3 sm:gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#A67C52]/10 text-[#A67C52] text-[10px] font-bold uppercase tracking-widest border border-[#A67C52]/20">
                <Brain className="w-3 h-3 text-[#A67C52]" />
                AI Topic Analysis
              </span>
              
              <button
                onClick={() => setIsPromptEditorOpen(!isPromptEditorOpen)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isPromptEditorOpen
                    ? 'bg-[#1A1A1A] text-white'
                    : 'bg-white hover:bg-[#1A1A1A]/5 text-[#1A1A1A] border border-[#1A1A1A]/20'
                }`}
                title="View & Edit AI Prompt"
                id="btn-toggle-topic-prompt"
              >
                <Terminal className="w-3 h-3 text-[#A67C52]" />
                <span>Prompt</span>
                <Edit3 className="w-3 h-3 opacity-60" />
              </button>
            </div>

            <h3 className="font-serif text-xl sm:text-2xl text-[#1A1A1A] font-medium leading-tight">
              {topicName}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#1A1A1A]/50 hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5 rounded-full transition-colors cursor-pointer"
            aria-label="Close explanation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prompt Editor Collapsible Panel */}
        {isPromptEditorOpen && (
          <div className="p-4 bg-[#1A1A1A] text-white border-b border-[#1A1A1A]/20 animate-fadeIn space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#A67C52] flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#A67C52]" />
                AI Prompt Inspector & Customizer
              </span>
              <button
                onClick={handleResetPrompt}
                className="text-[10px] uppercase font-bold text-white/60 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Default</span>
              </button>
            </div>

            <textarea
              value={customPromptText}
              onChange={(e) => setCustomPromptText(e.target.value)}
              rows={3}
              className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl p-3 text-xs text-white/90 font-mono focus:outline-none focus:border-[#A67C52] resize-y"
              placeholder="Type custom prompt instructions for the AI..."
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsPromptEditorOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] uppercase font-bold tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCustomPrompt}
                className="px-4 py-1.5 rounded-lg bg-[#A67C52] hover:bg-[#8C643E] text-white text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
                id="btn-run-custom-prompt"
              >
                <Send className="w-3 h-3" />
                <span>Regenerate with Prompt</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm leading-relaxed">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#A67C52] flex items-center justify-center text-white animate-pulse">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <p className="font-serif text-lg text-[#1A1A1A] mb-1">Generating AI Explanation...</p>
                <p className="text-xs text-[#1A1A1A]/60 font-serif italic max-w-sm">
                  Synthesizing layman overview and mathematical deep dive for "{topicName}".
                </p>
              </div>
              <div className="flex items-center gap-2 text-[#A67C52] text-xs font-bold uppercase tracking-widest pt-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#A67C52]" />
                <span>Consulting Academic Engine</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
              <p className="font-bold text-xs uppercase tracking-wider text-rose-700">Analysis Error</p>
              <p>{error}</p>
              <button
                onClick={() => fetchExplanation(topicName, customPromptText)}
                className="mt-2 text-xs font-bold text-rose-800 underline cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && explanation && (
            <div className="space-y-6 animate-fadeIn">
              {/* Layman Overview Box */}
              <div className="p-4 rounded-xl bg-[#A67C52]/5 border border-[#A67C52]/20 space-y-2">
                <div className="flex items-center gap-2 text-[#A67C52]">
                  <Lightbulb className="w-4 h-4 flex-shrink-0" />
                  <span className="text-[10px] uppercase tracking-wider font-bold">Plain Language Summary</span>
                </div>
                <p className="text-[#1A1A1A] font-sans leading-relaxed text-xs sm:text-sm font-medium">
                  {explanation.simpleExplanation}
                </p>
              </div>

              {/* Technical Deep Dive */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#1A1A1A]/70 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#A67C52]" />
                  Technical Deep Dive
                </h4>
                <div className="p-4 rounded-xl bg-[#F9F7F2] border border-[#1A1A1A]/10 text-[#1A1A1A]/90 whitespace-pre-line font-sans leading-relaxed text-xs sm:text-sm">
                  {explanation.technicalDeepDive}
                </div>
              </div>

              {/* Significance in Paper */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#1A1A1A]/70 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#A67C52]" />
                  Significance & Role in Research
                </h4>
                <p className="p-4 rounded-xl bg-[#F9F7F2] border border-[#1A1A1A]/10 text-[#1A1A1A]/90 leading-relaxed text-xs sm:text-sm">
                  {explanation.importanceInPaper}
                </p>
              </div>

              {/* Related Concepts / Topics */}
              {explanation.relatedConcepts && explanation.relatedConcepts.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#1A1A1A]/10">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#1A1A1A]/60 block mb-2">
                    Explore Related Concepts (Click to Explain)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {explanation.relatedConcepts.map((concept, idx) => (
                      <button
                        key={idx}
                        onClick={() => onSelectRelatedTopic && onSelectRelatedTopic(concept)}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#1A1A1A] hover:text-white border border-[#1A1A1A]/15 text-[11px] font-medium text-[#1A1A1A] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs group"
                      >
                        <Tag className="w-3 h-3 text-[#A67C52] group-hover:text-white" />
                        <span>{concept}</span>
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F9F7F2] border-t border-[#1A1A1A]/10 flex items-center justify-between gap-3">
          <button
            onClick={handleCopyExplanation}
            disabled={!explanation || loading}
            className="px-4 py-2 rounded-xl border border-[#1A1A1A]/20 bg-white hover:bg-[#1A1A1A]/5 text-[#1A1A1A] text-[10px] uppercase tracking-widest font-bold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#A67C52]" />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1A1A1A] hover:bg-[#A67C52] text-white text-[10px] uppercase tracking-widest font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

