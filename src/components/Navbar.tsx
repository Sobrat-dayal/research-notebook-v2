import React from 'react';
import { Sparkles, BookOpen, ShieldCheck, Plus, Key, Cpu, Compass, GitCompare } from 'lucide-react';
import { ApiConfig } from '../types';

interface NavbarProps {
  onReset: () => void;
  activePresetTitle?: string;
  apiConfig: ApiConfig;
  onOpenApiSettings: () => void;
  onOpenCompare?: () => void;
  onOpenExplorer?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onReset, 
  activePresetTitle,
  apiConfig,
  onOpenApiSettings,
  onOpenCompare,
  onOpenExplorer
}) => {
  const getProviderBadgeLabel = () => {
    if (!apiConfig.apiKey) {
      return 'Google (Default)';
    }
    const pMap: Record<string, string> = {
      google: 'Google Key',
      openai: 'OpenAI Key',
      anthropic: 'Claude Key',
      deepseek: 'DeepSeek Key',
      groq: 'Groq Key',
      custom: 'Custom Key'
    };
    return pMap[apiConfig.provider] || 'Custom Key';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#1A1A1A]/10 text-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div 
          onClick={onReset}
          className="flex items-center gap-3 cursor-pointer group transition-transform active:scale-98"
          id="brand-header-logo"
        >
          <div className="w-9 h-9 bg-[#1A1A1A] rounded-full flex items-center justify-center text-white font-serif text-lg italic shadow-xs group-hover:bg-[#A67C52] transition-colors">
            P
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif italic text-xl tracking-tight font-semibold text-[#1A1A1A]">
                PaperVision
              </span>
              <span className="px-2 py-0.5 text-[9px] uppercase tracking-[0.15em] font-bold rounded-full bg-[#A67C52]/10 text-[#A67C52] border border-[#A67C52]/20">
                Multi-AI Engine
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-[#1A1A1A]/50 font-bold hidden sm:block">
              Research Intelligence Lab
            </p>
          </div>
        </div>

        {/* Status / Active Selection / Actions */}
        <div className="flex items-center gap-2.5">
          {activePresetTitle && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F9F7F2] border border-[#1A1A1A]/10 text-xs text-[#1A1A1A]/80">
              <BookOpen className="w-3.5 h-3.5 text-[#A67C52]" />
              <span className="truncate max-w-[180px] font-serif italic text-[#1A1A1A]">{activePresetTitle}</span>
            </div>
          )}

          {/* Explore arXiv & Compare Buttons */}
          {onOpenExplorer && (
            <button
              onClick={onOpenExplorer}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#1A1A1A]/15 hover:border-[#A67C52] hover:text-[#A67C52] text-[#1A1A1A] text-[10px] uppercase tracking-[0.12em] font-bold transition-all cursor-pointer shadow-xs btn-tactile"
              id="btn-navbar-explore"
              title="Explore Trending arXiv Research Papers"
            >
              <Compass className="w-3.5 h-3.5 text-[#A67C52]" />
              <span>Explore arXiv</span>
            </button>
          )}

          {onOpenCompare && (
            <button
              onClick={onOpenCompare}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#1A1A1A]/15 hover:border-[#A67C52] hover:text-[#A67C52] text-[#1A1A1A] text-[10px] uppercase tracking-[0.12em] font-bold transition-all cursor-pointer shadow-xs btn-tactile"
              id="btn-navbar-compare"
              title="Compare 2 Research Papers Side-by-Side"
            >
              <GitCompare className="w-3.5 h-3.5 text-[#A67C52]" />
              <span>Compare Papers</span>
            </button>
          )}

          {/* API Key Configuration Button */}
          <button
            onClick={onOpenApiSettings}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F9F7F2] border border-[#1A1A1A]/15 hover:border-[#A67C52] hover:bg-[#A67C52]/5 text-[#1A1A1A] text-[10px] uppercase tracking-[0.12em] font-bold transition-all cursor-pointer shadow-xs"
            title="Configure Custom API Key & Model Provider"
            id="btn-open-api-settings"
          >
            <Key className="w-3.5 h-3.5 text-[#A67C52]" />
            <span className="hidden sm:inline">{getProviderBadgeLabel()}</span>
            <span className="sm:hidden">API</span>
          </button>

          <button
            onClick={onReset}
            className="bg-[#1A1A1A] text-white hover:bg-[#A67C52] px-4 py-2 text-[10px] uppercase tracking-[0.15em] font-bold rounded-full transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            id="btn-new-summary"
          >
            <Plus className="w-3.5 h-3.5" />
            New Paper
          </button>
        </div>

      </div>
    </header>
  );
};

