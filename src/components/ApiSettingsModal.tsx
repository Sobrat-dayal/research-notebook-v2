import React, { useState, useEffect } from 'react';
import { 
  X, Key, Check, ShieldCheck, AlertCircle, RefreshCw, Cpu, 
  Eye, EyeOff, Sparkles, Globe, Server, CheckCircle2 
} from 'lucide-react';
import { ApiConfig, ApiProvider } from '../types';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ApiConfig;
  onSaveConfig: (newConfig: ApiConfig) => void;
  onResetToDefault: () => void;
}

const PROVIDER_OPTIONS: { 
  id: ApiProvider; 
  name: string; 
  badge: string; 
  defaultModel: string; 
  models: string[];
  placeholderKey: string;
  defaultBaseUrl?: string;
  description: string;
}[] = [
  {
    id: 'google',
    name: 'Google Gemini',
    badge: 'Official / Default',
    defaultModel: 'gemini-3.6-flash',
    models: ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    placeholderKey: 'AIzaSy...',
    description: 'Google DeepMind multimodal Gemini models. Fast JSON structure generation & native PDF ingestion.'
  },
  {
    id: 'openai',
    name: 'OpenAI',
    badge: 'Custom Key',
    defaultModel: 'gpt-4o',
    models: ['gpt-4o', 'gpt-4o-mini', 'o3-mini', 'gpt-4-turbo'],
    placeholderKey: 'sk-proj-...',
    defaultBaseUrl: 'https://api.openai.com/v1',
    description: 'OpenAI flagship models with structured JSON schema output.'
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    badge: 'Custom Key',
    defaultModel: 'claude-3-5-sonnet-20241022',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
    placeholderKey: 'sk-ant-api03-...',
    defaultBaseUrl: 'https://api.anthropic.com/v1',
    description: 'Anthropic Claude 3.5 Sonnet & Haiku models for deep academic synthesis.'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek AI',
    badge: 'Custom Key',
    defaultModel: 'deepseek-chat',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    placeholderKey: 'sk-...',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
    description: 'DeepSeek V3 and R1 reasoning models for technical research parsing.'
  },
  {
    id: 'groq',
    name: 'Groq LPU',
    badge: 'Ultra Fast',
    defaultModel: 'llama-3.3-70b-versatile',
    models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
    placeholderKey: 'gsk_...',
    defaultBaseUrl: 'https://api.groq.com/openai/v1',
    description: 'Ultra-low latency inference on LPU hardware using open-weights models.'
  },
  {
    id: 'custom',
    name: 'Custom OpenAI Endpoint',
    badge: 'Self-Hosted',
    defaultModel: 'custom-model',
    models: ['custom-model'],
    placeholderKey: 'sk-custom-key...',
    defaultBaseUrl: 'https://my-proxy.example.com/v1',
    description: 'Connect any OpenAI-compatible server, local Ollama, vLLM, or enterprise proxy.'
  }
];

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onResetToDefault
}) => {
  const [provider, setProvider] = useState<ApiProvider>(config.provider || 'google');
  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [modelName, setModelName] = useState(config.modelName || 'gemini-3.6-flash');
  const [baseUrl, setBaseUrl] = useState(config.baseUrl || '');
  const [showKey, setShowKey] = useState(false);

  // Test status state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Update local form state when props update
  useEffect(() => {
    setProvider(config.provider || 'google');
    setApiKey(config.apiKey || '');
    setModelName(config.modelName || 'gemini-3.6-flash');
    setBaseUrl(config.baseUrl || '');
    setTestResult(null);
  }, [config, isOpen]);

  if (!isOpen) return null;

  const currentProviderObj = PROVIDER_OPTIONS.find(p => p.id === provider) || PROVIDER_OPTIONS[0];

  const handleProviderChange = (newProvider: ApiProvider) => {
    setProvider(newProvider);
    const pObj = PROVIDER_OPTIONS.find(p => p.id === newProvider);
    if (pObj) {
      setModelName(pObj.defaultModel);
      setBaseUrl(pObj.defaultBaseUrl || '');
    }
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/test-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey,
          modelName,
          baseUrl
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message || `Successfully connected to ${currentProviderObj.name} using ${modelName}!`
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Connection failed. Please check your API key and model selection.'
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Network error attempting to contact verification endpoint.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSaveConfig({
      provider,
      apiKey: apiKey.trim(),
      modelName: modelName.trim(),
      baseUrl: baseUrl.trim()
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1A1A1A]/60 backdrop-blur-xs animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl bg-[#FDFCFB] rounded-2xl border border-[#1A1A1A]/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-[#F9F7F2] border-b border-[#1A1A1A]/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center shadow-xs flex-shrink-0">
              <Key className="w-4 h-4 sm:w-5 sm:h-5 text-[#A67C52]" />
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-bold text-[#A67C52] block mb-0.5">
                API Key & Model Configuration
              </span>
              <h2 className="font-serif text-lg sm:text-xl text-[#1A1A1A]">
                AI Service Provider Settings
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5 transition-colors cursor-pointer"
            id="btn-close-api-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-8 space-y-5 sm:space-y-6 overflow-y-auto flex-1">
          
          {/* Active Key Status Callout */}
          <div className="p-4 rounded-xl bg-white border border-[#1A1A1A]/10 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <ShieldCheck className={`w-5 h-5 ${config.apiKey ? 'text-[#A67C52]' : 'text-emerald-600'}`} />
              <div>
                <span className="text-xs font-bold text-[#1A1A1A] block">
                  Current Engine Status
                </span>
                <p className="text-xs font-serif italic text-[#1A1A1A]/60">
                  {config.apiKey 
                    ? `Active Custom Key: ${config.provider.toUpperCase()} (${config.modelName})`
                    : 'Default Server Key Active: Google Gemini 3.6 Flash'}
                </p>
              </div>
            </div>

            {config.apiKey && (
              <button
                onClick={() => {
                  onResetToDefault();
                  setApiKey('');
                  setProvider('google');
                  setModelName('gemini-3.6-flash');
                  setBaseUrl('');
                  setTestResult(null);
                }}
                className="text-[10px] uppercase tracking-wider font-bold text-rose-700 hover:text-rose-900 border-b border-rose-300 hover:border-rose-700 cursor-pointer"
                id="btn-reset-api-key"
              >
                Reset to Default
              </button>
            )}
          </div>

          {/* Section 1: API Provider Selection */}
          <div>
            <label className="block text-[10px] uppercase tracking-[0.18em] font-bold text-[#1A1A1A] mb-2">
              1. Select AI Provider / Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PROVIDER_OPTIONS.map((p) => {
                const isSelected = provider === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleProviderChange(p.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs'
                        : 'bg-white text-[#1A1A1A] border-[#1A1A1A]/10 hover:border-[#A67C52]'
                    }`}
                    id={`btn-provider-${p.id}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-[#A67C52] text-white' : 'bg-[#1A1A1A]/5 text-[#A67C52]'
                      }`}>
                        {p.badge}
                      </span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#A67C52]" />}
                    </div>
                    <span className="text-xs font-bold font-serif">{p.name}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs font-serif italic text-[#1A1A1A]/60 mt-2">
              {currentProviderObj.description}
            </p>
          </div>

          {/* Section 2: API Key Code Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] uppercase tracking-[0.18em] font-bold text-[#1A1A1A]">
                2. Enter API Key Code
              </label>
              <span className="text-[10px] text-[#1A1A1A]/50 italic">
                {provider === 'google' ? 'Optional (Leave blank to use default server key)' : 'Required for custom provider'}
              </span>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setTestResult(null);
                }}
                placeholder={currentProviderObj.placeholderKey}
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-[#1A1A1A]/15 bg-white text-[#1A1A1A] text-sm focus:border-[#A67C52] focus:outline-hidden font-mono"
                id="input-api-key-code"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1A1A1A]/50 hover:text-[#1A1A1A] cursor-pointer"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Section 3: Model Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.18em] font-bold text-[#1A1A1A] mb-1">
                3. Model Code / Name
              </label>
              <div className="space-y-2">
                <select
                  value={currentProviderObj.models.includes(modelName) ? modelName : 'custom'}
                  onChange={(e) => {
                    if (e.target.value !== 'custom') {
                      setModelName(e.target.value);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#1A1A1A]/15 bg-white text-[#1A1A1A] text-xs font-serif focus:border-[#A67C52] focus:outline-hidden"
                  id="select-model-preset"
                >
                  {currentProviderObj.models.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                  <option value="custom">Custom Model Name...</option>
                </select>

                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="e.g. gpt-4o, claude-3-5-sonnet, etc."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#1A1A1A]/15 bg-white text-[#1A1A1A] text-xs font-mono focus:border-[#A67C52] focus:outline-hidden"
                  id="input-custom-model-code"
                />
              </div>
            </div>

            {/* Section 4: Custom Base URL (Optional) */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.18em] font-bold text-[#1A1A1A] mb-1">
                4. Custom Endpoint / Base URL (Optional)
              </label>
              <input
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder={currentProviderObj.defaultBaseUrl || 'https://api.openai.com/v1'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#1A1A1A]/15 bg-white text-[#1A1A1A] text-xs font-mono focus:border-[#A67C52] focus:outline-hidden"
                id="input-custom-base-url"
              />
              <p className="text-[10px] text-[#1A1A1A]/50 italic mt-1 font-serif">
                Override base URL for proxies or self-hosted API endpoints.
              </p>
            </div>
          </div>

          {/* Connection Test Result Box */}
          {testResult && (
            <div className={`p-4 rounded-xl border text-xs flex items-start gap-2.5 ${
              testResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              {testResult.success ? (
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 leading-relaxed">
                <span className="font-bold block uppercase tracking-wider text-[10px]">
                  {testResult.success ? 'Verification Successful' : 'Verification Failed'}
                </span>
                <p className="font-serif">{testResult.message}</p>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-[#F9F7F2] border-t border-[#1A1A1A]/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="px-4 py-2.5 rounded-full bg-white text-[#1A1A1A] border border-[#1A1A1A]/15 hover:border-[#A67C52] text-[10px] uppercase tracking-[0.15em] font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            id="btn-test-connection"
          >
            {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#A67C52]" /> : <Cpu className="w-3.5 h-3.5 text-[#A67C52]" />}
            <span>{isTesting ? 'Testing API Key...' : 'Test Connection'}</span>
          </button>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-full text-[#1A1A1A]/70 hover:text-[#1A1A1A] text-[10px] uppercase tracking-[0.15em] font-bold cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-initial bg-[#1A1A1A] hover:bg-[#A67C52] text-white px-5 sm:px-6 py-2.5 rounded-full text-[10px] uppercase tracking-[0.15em] font-bold transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              id="btn-save-api-config"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
