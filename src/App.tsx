import React, { useState, useEffect } from 'react';
import { GeminiNotebookHome } from './components/GeminiNotebookHome';
import { GeminiNotebookWorkspace } from './components/GeminiNotebookWorkspace';
import { CreateNotebookModal } from './components/CreateNotebookModal';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { PaperExplorerModal } from './components/PaperExplorerModal';
import { ComparativeSynthesisModal } from './components/ComparativeSynthesisModal';
import { AuthModal } from './components/AuthModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { FrontierPapersModal } from './components/FrontierPapersModal';
import { PRESET_PAPERS } from './data/presetPapers';
import { PaperSummary, PresetPaper, ApiConfig, PresentationDeck } from './types';
import { useAuth } from './context/AuthContext';
import { AlertCircle, RefreshCw, Sparkles, Brain, Moon, Sun } from 'lucide-react';

const DEFAULT_API_CONFIG: ApiConfig = {
  provider: 'google',
  apiKey: '',
  modelName: 'gemini-3.6-flash'
};

interface RecentNotebookItem {
  id: string;
  title: string;
  field: string;
  date: string;
  sourceCount: number;
  arxivId?: string;
  presetId?: string;
  fullText?: string;
}

export default function App() {
  const { currentUser, dbUser, isAdmin } = useAuth();

  const [activeSummary, setActiveSummary] = useState<PaperSummary | null>(null);
  const [activePreset, setActivePreset] = useState<PresetPaper | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Persistent Slide Decks by paper title
  const [savedDecks, setSavedDecks] = useState<Record<string, PresentationDeck>>({});

  // Dynamic Recent Notebooks (Stored in LocalStorage)
  const [recentNotebooks, setRecentNotebooks] = useState<RecentNotebookItem[]>(() => {
    try {
      const saved = localStorage.getItem('gemini_recent_notebooks');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'rec-1',
        title: 'Attention Is All You Need (Transformers)',
        field: 'Foundation Architecture',
        date: 'Recent',
        sourceCount: 8,
        arxivId: '1706.03762'
      },
      {
        id: 'rec-2',
        title: 'Deep Residual Learning for Image Recognition',
        field: 'Computer Vision & ResNet',
        date: 'Recent',
        sourceCount: 12,
        arxivId: '1512.03385'
      }
    ];
  });

  const saveToRecent = (item: Omit<RecentNotebookItem, 'id' | 'date'>) => {
    setRecentNotebooks(prev => {
      const filtered = prev.filter(p => p.title !== item.title);
      const updated = [
        {
          ...item,
          id: 'rec-' + Date.now(),
          date: 'Just now'
        },
        ...filtered
      ].slice(0, 15);
      try {
        localStorage.setItem('gemini_recent_notebooks', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Dark Mode State (Floating button on bottom right)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('gemini_notebook_theme');
      return saved !== null ? saved === 'dark' : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('gemini_notebook_theme', isDarkMode ? 'dark' : 'light');
    } catch {}
  }, [isDarkMode]);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'admin'>('signin');
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isFrontierPapersOpen, setIsFrontierPapersOpen] = useState(false);

  // API Config
  const [apiConfig, setApiConfig] = useState<ApiConfig>(() => {
    try {
      const saved = localStorage.getItem('papervision_api_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved API config from localStorage:', e);
    }
    return DEFAULT_API_CONFIG;
  });

  const handleSaveApiConfig = (newConfig: ApiConfig) => {
    setApiConfig(newConfig);
    try {
      localStorage.setItem('papervision_api_config', JSON.stringify(newConfig));
    } catch (e) {
      console.warn('Failed to save API config to localStorage:', e);
    }
  };

  const handleResetApiConfig = () => {
    setApiConfig(DEFAULT_API_CONFIG);
    try {
      localStorage.removeItem('papervision_api_config');
    } catch (e) {
      console.warn('Failed to remove API config from localStorage:', e);
    }
  };

  // Close research paper altogether
  const handleReset = () => {
    setActiveSummary(null);
    setActivePreset(null);
    setErrorMessage(null);
  };

  // Select a preset notebook
  const handleSelectPreset = (preset: PresetPaper) => {
    setActivePreset(preset);
    saveToRecent({
      title: preset.title,
      field: preset.field,
      sourceCount: 1,
      presetId: preset.id,
      fullText: preset.fullText
    });

    if (preset.preCalculatedSummary) {
      setActiveSummary(preset.preCalculatedSummary);
      setErrorMessage(null);
    } else {
      handleSummarizeText(preset.fullText, preset.title);
    }
  };

  // Select an arXiv Paper directly
  const handleSelectArxiv = (arxivId: string, title: string, fullText: string) => {
    saveToRecent({
      title,
      field: `arXiv:${arxivId}`,
      sourceCount: 1,
      arxivId,
      fullText
    });
    handleSummarizeText(fullText, title);
  };

  // Open SaaS Admin Console check
  const handleOpenAdminPanel = () => {
    if (!currentUser && !dbUser) {
      setAuthModalMode('admin');
      setIsAuthModalOpen(true);
      return;
    }
    setIsAdminPanelOpen(true);
  };

  // Summarize raw text
  const handleSummarizeText = async (paperText: string, paperTitle?: string) => {
    if (!paperText.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/summarize-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paperText,
          paperTitle: paperTitle || 'Custom Research Paper',
          apiConfig
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to synthesize research paper.');
      }

      setActiveSummary(data);
    } catch (err: any) {
      console.error('Summarization error:', err);
      setErrorMessage(err.message || 'An error occurred while connecting to AI Engine.');
    } finally {
      setIsLoading(false);
    }
  };

  // Summarize uploaded document file
  const handleSummarizeFile = async (fileBase64: string, mimeType: string, filename: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      saveToRecent({
        title: filename,
        field: 'Uploaded Document',
        sourceCount: 1
      });

      const response = await fetch('/api/summarize-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64,
          mimeType,
          paperTitle: filename,
          apiConfig
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to analyze uploaded paper file.');
      }

      setActiveSummary(data);
    } catch (err: any) {
      console.error('File summarization error:', err);
      setErrorMessage(err.message || 'An error occurred while processing the research document.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-[#131314]' : 'bg-[#F8F9FA]'} transition-colors duration-200 relative font-sans`}>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-[#131314]/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white mb-6 animate-pulse shadow-2xl">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-blue-400 block mb-2">
            Gemini Notebook Intelligence Engine
          </span>
          <h2 className="font-sans font-semibold text-2xl sm:text-3xl text-white mb-3">
            Synthesizing Research Notebook...
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 max-w-md leading-relaxed mb-6">
            Extracting 3-brain sensory pipelines, LaTeX mathematical derivations, and quantitative benchmark graphics via {apiConfig.apiKey ? apiConfig.provider.toUpperCase() : 'Google Gemini'}.
          </p>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-widest">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
            <span>Structuring Workspace & Sources...</span>
          </div>
        </div>
      )}

      {/* Error Callout Banner */}
      {errorMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4">
          <div className="p-3.5 rounded-2xl bg-rose-950/90 border border-rose-500/50 text-rose-200 text-xs flex items-start justify-between gap-3 shadow-2xl backdrop-blur-md">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5 uppercase tracking-wider text-[10px] text-rose-400">Processing Alert</span>
                <p>{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs font-bold uppercase text-rose-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main View: First Page (GeminiNotebookHome) vs Inside Page (GeminiNotebookWorkspace) */}
      <main className="w-full">
        {activeSummary ? (
          <GeminiNotebookWorkspace
            summary={activeSummary}
            onBackToHome={handleReset}
            onOpenSettings={() => setIsApiModalOpen(true)}
            apiConfig={apiConfig}
            isDark={isDarkMode}
            savedDeck={activeSummary ? savedDecks[activeSummary.title] : null}
            onSaveDeck={(deck) => {
              if (activeSummary) {
                setSavedDecks(prev => ({ ...prev, [activeSummary.title]: deck }));
              }
            }}
          />
        ) : (
          <GeminiNotebookHome
            onSelectPaper={handleSelectPreset}
            onSelectArxiv={handleSelectArxiv}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onOpenSettings={() => setIsApiModalOpen(true)}
            onOpenAdminPanel={handleOpenAdminPanel}
            onOpenAuth={(mode) => {
              setAuthModalMode(mode || 'signin');
              setIsAuthModalOpen(true);
            }}
            onOpenFrontierPapers={() => setIsFrontierPapersOpen(true)}
            recentNotebooks={recentNotebooks}
            apiConfig={apiConfig}
            isDark={isDarkMode}
          />
        )}
      </main>

      {/* FLOATING DARK MODE BUTTON (Fixed to bottom right of the page, does not scroll) */}
      <button
        id="floating-dark-mode-button"
        onClick={() => setIsDarkMode(prev => !prev)}
        className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer border ${
          isDarkMode 
            ? 'bg-[#28292A] text-amber-300 border-[#3C4043] hover:bg-[#3C4043] hover:text-amber-200' 
            : 'bg-white text-stone-700 border-[#DADCE0] hover:bg-stone-50 hover:text-stone-900'
        }`}
        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label="Toggle dark mode theme"
      >
        {isDarkMode ? (
          <Sun className="w-5 h-5 transition-transform hover:rotate-45 duration-300" />
        ) : (
          <Moon className="w-5 h-5 transition-transform hover:-rotate-12 duration-300" />
        )}
      </button>

      {/* Create New Notebook Modal (contains tabs: presets, file upload, paste text, paste arXiv link) */}
      <CreateNotebookModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSelectPreset={handleSelectPreset}
        onSummarizeText={handleSummarizeText}
        onSummarizeFile={handleSummarizeFile}
        onSelectArxiv={handleSelectArxiv}
        isDark={isDarkMode}
      />

      {/* Auth Modal (Sign In, Sign Up, Admin Direct Access) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={() => {
          if (authModalMode === 'admin') {
            setIsAdminPanelOpen(true);
          }
        }}
        isDark={isDarkMode}
      />

      {/* SaaS Admin Management Panel Modal (PostgreSQL users table) */}
      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        isDark={isDarkMode}
      />

      {/* Frontier Research Papers & Hugging Face Daily Papers Modal */}
      <FrontierPapersModal
        isOpen={isFrontierPapersOpen}
        onClose={() => setIsFrontierPapersOpen(false)}
        onSelectArxivPaper={handleSelectArxiv}
        isDark={isDarkMode}
      />

      {/* API Key Settings Modal */}
      <ApiSettingsModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        config={apiConfig}
        onSaveConfig={handleSaveApiConfig}
        onResetToDefault={handleResetApiConfig}
      />

      {/* arXiv Paper Explorer Modal */}
      <PaperExplorerModal
        isOpen={isExplorerOpen}
        onClose={() => setIsExplorerOpen(false)}
        onSelectPaperForAnalysis={(title, text) => {
          handleSummarizeText(text, title);
        }}
      />

      {/* Comparative Synthesis Modal */}
      <ComparativeSynthesisModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        currentSummary={activeSummary}
        paperA={PRESET_PAPERS[0]}
        paperB={PRESET_PAPERS[1]}
      />
    </div>
  );
}
