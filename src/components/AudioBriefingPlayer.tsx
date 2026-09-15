import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PaperSummary, AudioBriefingChapter } from '../types';
import {
  Headphones,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  User,
  Copy,
  Check,
  Minimize2,
  Maximize2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AudioBriefingPlayerProps {
  summary: PaperSummary;
  isOpen: boolean;
  onClose: () => void;
}

export const AudioBriefingPlayer: React.FC<AudioBriefingPlayerProps> = ({
  summary,
  isOpen,
  onClose
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [copiedTranscript, setCopiedTranscript] = useState(false);

  // Chapters & Dialog generation
  const chapters: AudioBriefingChapter[] = [
    {
      id: 'ch1',
      chapterTitle: '1. The Core Paradigm Shift',
      durationSeconds: 90,
      segments: [
        {
          id: 's1',
          speaker: 'Sarah',
          role: 'Principal AI Scientist',
          text: `Welcome to today's deep dive. We're breaking down "${summary.title}". To start us off, why was this paper such a turning point in the field?`,
          timestamp: '00:00'
        },
        {
          id: 's2',
          speaker: 'Alex',
          role: 'Systems Architect',
          text: `Prior to this work from ${summary.institution}, everyone was locked into legacy architectures that had severe bottlenecking. The authors completely flipped the conventional wisdom with: "${summary.tldr}"`,
          timestamp: '00:18'
        },
        {
          id: 's3',
          speaker: 'Sarah',
          role: 'Principal AI Scientist',
          text: `Exactly. And looking at their core premise, they argue that rather than processing step-by-step, we can compute dependencies globally in parallel.`,
          timestamp: '00:38'
        }
      ]
    },
    {
      id: 'ch2',
      chapterTitle: '2. Technical Mechanics & Innovation',
      durationSeconds: 110,
      segments: [
        {
          id: 's4',
          speaker: 'Alex',
          role: 'Systems Architect',
          text: `Let's dig into the engine under the hood. Their primary innovation was: ${summary.keyTakeaways[0]?.description || 'a radical architectural rethinking that replaced sequential loops with matrix multiplications'}.`,
          timestamp: '00:52'
        },
        {
          id: 's5',
          speaker: 'Sarah',
          role: 'Principal AI Scientist',
          text: `And don't overlook the secondary methodology: ${summary.keyTakeaways[1]?.description || 'clever mathematical formulations ensuring gradients flow smoothly through deep representations'}. It solves what was previously thought to be an intractable trade-off.`,
          timestamp: '01:20'
        }
      ]
    },
    {
      id: 'ch3',
      chapterTitle: '3. Empirical Breakthroughs & Numbers',
      durationSeconds: 85,
      segments: [
        {
          id: 's6',
          speaker: 'Alex',
          role: 'Systems Architect',
          text: `The benchmarks were undeniable. Specifically: ${summary.keyMetrics[0]?.label || 'their benchmark score'} hit ${summary.keyMetrics[0]?.value || 'a new state of the art'}, beating prior records by ${summary.keyMetrics[0]?.improvement || 'a significant margin'}.`,
          timestamp: '01:50'
        },
        {
          id: 's7',
          speaker: 'Sarah',
          role: 'Principal AI Scientist',
          text: `And they accomplished that while cutting computational overhead. That efficiency leap is what turned this academic preprint into an industry standard.`,
          timestamp: '02:15'
        }
      ]
    },
    {
      id: 'ch4',
      chapterTitle: '4. Actionable Real-World Impact',
      durationSeconds: 95,
      segments: [
        {
          id: 's8',
          speaker: 'Alex',
          role: 'Systems Architect',
          text: `For practitioners and engineering teams listening, what is the key takeaway? The paper recommends: "${summary.actionableInsights[0]?.recommendation || 'adopt modern parallelized representations for massive performance gains'}"`,
          timestamp: '02:40'
        },
        {
          id: 's9',
          speaker: 'Sarah',
          role: 'Principal AI Scientist',
          text: `A timeless insight that continues to shape modern software. Thanks for joining us for this PaperVision audio briefing!`,
          timestamp: '03:10'
        }
      ]
    }
  ];

  const currentChapter = chapters[currentChapterIndex];
  const currentSegment = currentChapter.segments[currentSegmentIndex];

  // Speech Synthesis Controller
  useEffect(() => {
    if (!isOpen) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      return;
    }
  }, [isOpen]);

  const speakCurrentSegment = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (!isPlaying) return;

    const utterance = new SpeechSynthesisUtterance(currentSegment.text);
    utterance.rate = playbackSpeed;

    // Pick distinct voices if available
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      if (currentSegment.speaker === 'Sarah') {
        const femaleVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Zira') || v.name.includes('Google UK English Female')));
        if (femaleVoice) utterance.voice = femaleVoice;
      } else {
        const maleVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Male') || v.name.includes('David') || v.name.includes('Google US English')));
        if (maleVoice) utterance.voice = maleVoice;
      }
    }

    utterance.onend = () => {
      // Advance to next segment or chapter
      if (currentSegmentIndex < currentChapter.segments.length - 1) {
        setCurrentSegmentIndex(prev => prev + 1);
      } else if (currentChapterIndex < chapters.length - 1) {
        setCurrentChapterIndex(prev => prev + 1);
        setCurrentSegmentIndex(0);
      } else {
        setIsPlaying(false);
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (isPlaying) {
      speakCurrentSegment();
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isPlaying, currentChapterIndex, currentSegmentIndex, playbackSpeed]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setCurrentChapterIndex(0);
    setCurrentSegmentIndex(0);
    setIsPlaying(true);
  };

  const handleNextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      setCurrentChapterIndex(prev => prev + 1);
      setCurrentSegmentIndex(0);
    }
  };

  const handleCopyTranscript = () => {
    const fullTranscript = chapters
      .map(ch => `## ${ch.chapterTitle}\n` + ch.segments.map(s => `**${s.speaker} (${s.role}):** ${s.text}`).join('\n\n'))
      .join('\n\n---\n\n');
    navigator.clipboard.writeText(fullTranscript);
    setCopiedTranscript(true);
    confetti({ particleCount: 20, spread: 40 });
    setTimeout(() => setCopiedTranscript(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ${
        isMinimized
          ? 'bottom-6 right-6 w-80 shadow-xl'
          : 'bottom-6 right-6 sm:right-8 w-[calc(100vw-2rem)] sm:w-[500px] shadow-2xl'
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        className="bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Top Control Bar */}
        <div className="bg-[#1A1A1A] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-[#A67C52] text-white">
              <Headphones className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#A67C52]">
                  NotebookLM Style
                </span>
                <span className="text-[10px] text-white/50">• 2-Speaker AI Podcast</span>
              </div>
              <h3 className="text-xs font-semibold text-white/90 line-clamp-1">
                {summary.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              title={isMinimized ? 'Expand briefing' : 'Minimize player'}
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                onClose();
              }}
              className="p-1.5 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <div className="p-5 bg-[#FAF9F5] border-b border-[#1A1A1A]/10">
            {/* Waveform Visualizer */}
            <div className="flex items-center justify-center gap-1 h-10 mb-4 bg-white/70 p-2 rounded-xl border border-[#1A1A1A]/5">
              {[18, 35, 60, 24, 80, 45, 90, 65, 30, 75, 40, 95, 55, 35, 70, 40, 20].map((height, i) => (
                <div
                  key={i}
                  style={{
                    height: isPlaying ? `${Math.max(12, (height * (1 + Math.sin(Date.now() / 200 + i) * 0.4))) * 0.35}px` : '4px'
                  }}
                  className={`w-1.5 rounded-full transition-all duration-150 ${
                    currentSegment.speaker === 'Sarah' ? 'bg-[#A67C52]' : 'bg-[#1A1A1A]'
                  } ${!isPlaying && 'opacity-30'}`}
                />
              ))}
            </div>

            {/* Live Synchronized Speaker Card */}
            <div className="bg-white rounded-xl p-4 border border-[#1A1A1A]/10 shadow-xs mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      currentSegment.speaker === 'Sarah'
                        ? 'bg-[#A67C52]/15 text-[#A67C52]'
                        : 'bg-[#1A1A1A] text-white'
                    }`}
                  >
                    {currentSegment.speaker === 'Sarah' ? 'SV' : 'AC'}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-[#1A1A1A] flex items-center gap-1.5">
                      {currentSegment.speaker === 'Sarah' ? 'Dr. Sarah Vance' : 'Alex Chen'}
                      <span className="text-[10px] font-normal text-[#1A1A1A]/50">
                        ({currentSegment.role})
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#1A1A1A]/50">
                  {currentSegment.timestamp}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#1A1A1A]/85 leading-relaxed font-serif">
                "{currentSegment.text}"
              </p>
            </div>

            {/* Chapter Selection Chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3">
              {chapters.map((ch, idx) => {
                const isActive = idx === currentChapterIndex;
                return (
                  <button
                    key={ch.id}
                    onClick={() => {
                      setCurrentChapterIndex(idx);
                      setCurrentSegmentIndex(0);
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-[#A67C52] text-white font-medium shadow-xs'
                        : 'bg-white border border-[#1A1A1A]/10 text-[#1A1A1A]/70 hover:bg-[#F9F7F2]'
                    }`}
                  >
                    {ch.chapterTitle}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Player Controls Bar */}
        <div className="px-5 py-3.5 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleRestart}
              title="Restart from beginning"
              className="p-2 rounded-full hover:bg-black/5 text-[#1A1A1A]/60 transition-colors btn-tactile"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className={`p-3 rounded-full text-white shadow-md transition-all btn-tactile ${
                isPlaying ? 'bg-[#1A1A1A]' : 'bg-[#A67C52] hover:bg-[#8F6640]'
              }`}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            <button
              onClick={handleNextChapter}
              title="Next chapter"
              className="p-2 rounded-full hover:bg-black/5 text-[#1A1A1A]/60 transition-colors btn-tactile"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Speed Toggle */}
            <div className="flex items-center rounded-lg bg-[#FAF8F5] border border-[#1A1A1A]/10 p-0.5">
              {[1, 1.25, 1.5].map(speed => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-2 py-1 text-[10px] font-mono font-bold rounded transition-all ${
                    playbackSpeed === speed
                      ? 'bg-[#1A1A1A] text-white'
                      : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Copy Transcript Button */}
            <button
              onClick={handleCopyTranscript}
              title="Copy full audio briefing transcript"
              className="p-2 rounded-lg border border-[#1A1A1A]/10 text-xs font-mono text-[#1A1A1A]/70 hover:bg-[#FAF8F5] transition-colors flex items-center gap-1 btn-tactile"
            >
              {copiedTranscript ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
