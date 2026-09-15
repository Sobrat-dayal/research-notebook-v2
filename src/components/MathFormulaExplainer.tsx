import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FormulaItem, FormulaVariable } from '../types';
import { Sigma, Copy, Check, Info, Sparkles, Variable as VariableIcon, Layers } from 'lucide-react';
import katex from 'katex';
import confetti from 'canvas-confetti';

interface MathFormulaExplainerProps {
  formulas?: FormulaItem[];
  paperTitle: string;
}

export const MathFormulaExplainer: React.FC<MathFormulaExplainerProps> = ({
  formulas,
  paperTitle
}) => {
  const [activeFormulaId, setActiveFormulaId] = useState<string>(
    formulas && formulas.length > 0 ? formulas[0].id : ''
  );
  const [selectedVariable, setSelectedVariable] = useState<FormulaVariable | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeFormula = useMemo(() => {
    if (!formulas || formulas.length === 0) return null;
    return formulas.find(f => f.id === activeFormulaId) || formulas[0];
  }, [formulas, activeFormulaId]);

  if (!formulas || formulas.length === 0) {
    return null;
  }

  const renderKatex = (latexString: string, displayMode: boolean = true) => {
    try {
      return katex.renderToString(latexString, {
        throwOnError: false,
        displayMode
      });
    } catch {
      return `<code>${latexString}</code>`;
    }
  };

  const handleCopyLatex = (latex: string, id: string) => {
    navigator.clipboard.writeText(latex);
    setCopiedId(id);
    confetti({
      particleCount: 25,
      spread: 45,
      origin: { y: 0.8 }
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section id="math-formulations-section" className="mb-14 scroll-mt-24">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-3 border-b border-[#1A1A1A]/10 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center justify-center p-1 rounded bg-[#A67C52]/10 text-[#A67C52]">
              <Sigma className="w-4 h-4" />
            </span>
            <span className="editorial-badge text-[#A67C52]">Mathematical Formulations</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-[#1A1A1A]">
            Core Equations & Tensor Mechanics
          </h2>
        </div>
        <div className="text-xs text-[#1A1A1A]/60 flex items-center gap-1.5 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-[#A67C52]" />
          Interactive Variable Breakdown
        </div>
      </div>

      {/* Formula Selector Tabs (Fragments UI) */}
      <div className="flex flex-wrap gap-2 mb-6">
        {formulas.map((formula) => {
          const isActive = formula.id === (activeFormula?.id || '');
          return (
            <button
              key={formula.id}
              onClick={() => {
                setActiveFormulaId(formula.id);
                setSelectedVariable(null);
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-2 btn-tactile ${
                isActive
                  ? 'bg-[#1A1A1A] text-white shadow-md'
                  : 'bg-white border border-[#1A1A1A]/10 text-[#1A1A1A]/80 hover:bg-[#F9F7F2] hover:border-[#A67C52]/40'
              }`}
            >
              <VariableIcon className="w-3.5 h-3.5 opacity-70" />
              <span>{formula.name}</span>
            </button>
          );
        })}
      </div>

      {activeFormula && (
        <motion.div
          key={activeFormula.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="fragment-card rounded-2xl p-6 sm:p-8 bg-white border border-[#1A1A1A]/10 shadow-sm"
        >
          {/* Formula Display Banner */}
          <div className="relative p-6 sm:p-8 rounded-xl bg-[#FAF9F5] border border-[#1A1A1A]/10 mb-6 overflow-x-auto text-center flex flex-col items-center justify-center min-h-[130px]">
            <div
              className="text-lg sm:text-2xl text-[#1A1A1A] max-w-full overflow-x-auto py-2"
              dangerouslySetInnerHTML={{ __html: renderKatex(activeFormula.latex, true) }}
            />

            {/* Quick Actions */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <button
                onClick={() => handleCopyLatex(activeFormula.latex, activeFormula.id)}
                title="Copy LaTeX formula"
                className="px-2.5 py-1.5 rounded-md bg-white border border-[#1A1A1A]/15 text-[11px] font-mono text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:border-[#A67C52] transition-colors flex items-center gap-1.5 shadow-xs btn-tactile"
              >
                {copiedId === activeFormula.id ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>LaTeX</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Conceptual Description */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5 text-[#A67C52]">
              <Info className="w-3.5 h-3.5" /> Conceptual Breakdown
            </h3>
            <p className="text-sm text-[#1A1A1A]/80 leading-relaxed">
              {activeFormula.description}
            </p>
          </div>

          {/* Interactive Variable Chips */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]/60 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#A67C52]" />
                Click Any Variable to Inspect Tensor Semantics
              </h4>
              <span className="text-[11px] text-[#1A1A1A]/50">
                {activeFormula.variables.length} parameters
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
              {activeFormula.variables.map((variable, idx) => {
                const isSelected = selectedVariable?.symbol === variable.symbol;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedVariable(isSelected ? null : variable)}
                    className={`p-3 rounded-xl border text-left transition-all btn-tactile ${
                      isSelected
                        ? 'bg-[#A67C52]/10 border-[#A67C52] ring-2 ring-[#A67C52]/20 shadow-xs'
                        : 'bg-[#FDFCFB] border-[#1A1A1A]/10 hover:border-[#A67C52]/50 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-baseline justify-between mb-1">
                      <span
                        className="font-mono text-base font-bold text-[#1A1A1A]"
                        dangerouslySetInnerHTML={{ __html: renderKatex(variable.symbol, false) }}
                      />
                      {variable.dimensions && (
                        <span className="text-[10px] font-mono text-[#A67C52] bg-[#A67C52]/10 px-1.5 py-0.5 rounded">
                          {variable.dimensions.replace(/\\times/g, '×').replace(/\\mathbb\{R\}/g, 'ℝ').replace(/\\text\{.*?\}/g, '')}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-medium text-[#1A1A1A]/80 truncate">
                      {variable.meaning}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Variable Explainer Callout */}
            <AnimatePresence>
              {selectedVariable && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 rounded-xl bg-[#F5F2EA] border border-[#A67C52]/30 text-xs">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-base font-bold text-[#1A1A1A]"
                        dangerouslySetInnerHTML={{ __html: renderKatex(selectedVariable.symbol, false) }}
                      />
                      <span className="font-semibold text-[#1A1A1A]">
                        {selectedVariable.meaning}
                      </span>
                      {selectedVariable.dimensions && (
                        <span className="text-[11px] font-mono bg-white/70 px-2 py-0.5 rounded border border-[#A67C52]/20 text-[#A67C52]">
                          Dimension: {selectedVariable.dimensions.replace(/\\times/g, '×')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#1A1A1A]/80 leading-relaxed">
                      <strong className="text-[#1A1A1A]">Intuition: </strong>
                      {selectedVariable.intuition}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </section>
  );
};
