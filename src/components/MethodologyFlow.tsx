import React, { useState } from 'react';
import { PipelineStep } from '../types';
import { ArrowRight, Layers, CheckCircle2, ChevronRight, Zap, Brain } from 'lucide-react';

interface MethodologyFlowProps {
  steps: PipelineStep[];
  onExplainTopic?: (topic: string) => void;
}

export const MethodologyFlow: React.FC<MethodologyFlowProps> = ({ steps, onExplainTopic }) => {
  const [selectedStep, setSelectedStep] = useState<number>(1);

  if (!steps || steps.length === 0) {
    return (
      <div className="p-8 text-center bg-[#F9F7F2] rounded-2xl border border-[#1A1A1A]/10 text-xs font-serif italic text-[#1A1A1A]/60">
        No methodology pipeline available for this paper.
      </div>
    );
  }

  const currentStepData = steps.find(s => s.stepNumber === selectedStep) || steps[0];

  return (
    <div className="bg-[#F9F7F2] rounded-2xl border border-[#1A1A1A]/10 p-4 sm:p-8 shadow-xs">
      <div className="mb-4 sm:mb-6">
        <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-bold text-[#A67C52] block mb-1">
          System Architecture
        </span>
        <h3 className="font-serif text-xl sm:text-2xl text-[#1A1A1A] flex items-center gap-2">
          <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-[#A67C52]" />
          Methodology & Architecture Pipeline
        </h3>
        <p className="text-xs font-serif italic text-[#1A1A1A]/60 mt-1">
          Sequential breakdown of the core algorithm, model pipeline, or experimental workflow.
        </p>
      </div>

      {/* Steps Visual Connection Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3 mb-4 sm:mb-6">
        {steps.map((step) => {
          const isSelected = step.stepNumber === selectedStep;
          return (
            <button
              key={step.stepNumber}
              onClick={() => setSelectedStep(step.stepNumber)}
              className={`p-3 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between active:scale-[0.98] ${
                isSelected
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs'
                  : 'bg-white text-[#1A1A1A] border-[#1A1A1A]/10 hover:border-[#A67C52]'
              }`}
              id={`step-node-${step.stepNumber}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isSelected ? 'bg-[#A67C52] text-white' : 'bg-[#1A1A1A]/10 text-[#1A1A1A]'
                }`}>
                  {step.stepNumber}
                </span>
                {step.keyTechnique && (
                  <Zap className={`w-3.5 h-3.5 ${isSelected ? 'text-[#A67C52]' : 'text-[#A67C52]'}`} />
                )}
              </div>

              <span className={`text-xs font-bold line-clamp-2 leading-tight ${isSelected ? 'text-white' : 'text-[#1A1A1A]'}`}>
                {step.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Step Deep Dive Details */}
      {currentStepData && (
        <div className="p-4 sm:p-6 rounded-2xl bg-white border border-[#1A1A1A]/10 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] font-bold text-[#A67C52]">
              Phase #{currentStepData.stepNumber} Focus
            </span>
            {currentStepData.keyTechnique && (
              <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[8px] sm:text-[9px] uppercase tracking-widest font-bold bg-[#A67C52]/10 text-[#A67C52] border border-[#A67C52]/20">
                Technique: {currentStepData.keyTechnique}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-2">
            <h4 className="font-serif text-base sm:text-lg text-[#1A1A1A]">
              {currentStepData.name}
            </h4>
            {onExplainTopic && (
              <button
                onClick={() => onExplainTopic(currentStepData.keyTechnique || currentStepData.name)}
                className="self-start sm:self-auto px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#A67C52]/10 hover:bg-[#A67C52] text-[#A67C52] hover:text-white text-[9px] sm:text-[10px] uppercase tracking-wider font-bold transition-colors flex items-center gap-1.5 cursor-pointer flex-shrink-0"
              >
                <Brain className="w-3.5 h-3.5" />
                <span>Explain Step</span>
              </button>
            )}
          </div>

          <p className="text-xs sm:text-sm text-[#1A1A1A]/80 leading-relaxed">
            {currentStepData.description}
          </p>
        </div>
      )}
    </div>
  );
};
