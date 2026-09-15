import React, { useState, useEffect } from 'react';
import { 
  X, Presentation, Sparkles, ChevronLeft, ChevronRight, Play, Pause,
  Maximize2, Minimize2, Copy, Download, Check, RefreshCw, 
  Sliders, FileText, Lightbulb, Users, BarChart3, Terminal, Edit3, 
  Image as ImageIcon, Palette, Clock, Award, CheckCircle2, ArrowUpRight,
  Tv, Zap, Eye, EyeOff, LayoutGrid, CheckSquare, Wand2, AlertCircle, Info, ExternalLink
} from 'lucide-react';
import { PaperSummary, ApiConfig, PresentationDeck, SlideItem } from '../types';
import pptxgen from 'pptxgenjs';
import confetti from 'canvas-confetti';

interface PresentationDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  paperSummary: PaperSummary;
  apiConfig: ApiConfig;
  initialDeck?: PresentationDeck | null;
  onSaveDeck?: (deck: PresentationDeck) => void;
}

export type SlideTheme = 'luxe' | 'obsidian' | 'navy' | 'emerald' | 'nordic' | 'terracotta';

export interface ThemeConfig {
  id: SlideTheme;
  name: string;
  description: string;
  thumbnailUrl: string;
  bgCanvas: string;
  bgCard: string;
  textTitle: string;
  textSubtitle: string;
  accentBg: string;
  accentBtn: string;
  badgeBg: string;
  sidebarBg: string;
  footerBg: string;
  previewColors: { bg: string; card: string; accent: string; text: string };
}

export const THEME_OPTIONS: ThemeConfig[] = [
  {
    id: 'luxe',
    name: 'Academic Luxe',
    description: 'Gold & Ivory Editorial',
    thumbnailUrl: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=500&q=80',
    bgCanvas: 'bg-[#F5F2EB]',
    bgCard: 'bg-[#FDFCFB] border-[#1A1A1A]/15 text-[#1A1A1A]',
    textTitle: 'text-[#1A1A1A]',
    textSubtitle: 'text-[#A67C52] font-serif italic',
    accentBg: 'bg-[#A67C52]/10 border-[#A67C52]/30 text-[#A67C52]',
    accentBtn: 'bg-[#A67C52] hover:bg-[#8C643E] text-white font-bold',
    badgeBg: 'bg-[#1A1A1A] text-white',
    sidebarBg: 'bg-white border-[#1A1A1A]/10',
    footerBg: 'bg-[#F9F7F2] border-[#1A1A1A]/10 text-[#1A1A1A]/60',
    previewColors: { bg: '#F5F2EB', card: 'bg-[#FDFCFB]', accent: 'bg-[#A67C52]', text: 'text-[#1A1A1A]' }
  },
  {
    id: 'obsidian',
    name: 'Obsidian Cyber',
    description: 'Dark Keynote Glow',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=500&q=80',
    bgCanvas: 'bg-[#0F172A]',
    bgCard: 'bg-[#1E293B] border-slate-700/60 text-slate-100',
    textTitle: 'text-white',
    textSubtitle: 'text-amber-400 font-serif italic',
    accentBg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    accentBtn: 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold',
    badgeBg: 'bg-slate-800 text-amber-400 border border-slate-700',
    sidebarBg: 'bg-[#182234] border-slate-800',
    footerBg: 'bg-[#0F172A] border-slate-800 text-slate-400',
    previewColors: { bg: '#0F172A', card: 'bg-[#1E293B]', accent: 'bg-amber-500', text: 'text-white' }
  },
  {
    id: 'navy',
    name: 'Navy Corporate',
    description: 'Executive Blueprint',
    thumbnailUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=500&q=80',
    bgCanvas: 'bg-[#F0F4F8]',
    bgCard: 'bg-white border-blue-900/15 text-slate-900',
    textTitle: 'text-[#0F2942]',
    textSubtitle: 'text-blue-600 font-sans font-medium',
    accentBg: 'bg-blue-50 border-blue-200 text-blue-900',
    accentBtn: 'bg-[#0F2942] hover:bg-blue-900 text-white font-bold',
    badgeBg: 'bg-blue-100 text-blue-900 font-bold',
    sidebarBg: 'bg-white border-slate-200',
    footerBg: 'bg-slate-100 border-slate-200 text-slate-600',
    previewColors: { bg: '#F0F4F8', card: 'bg-white', accent: 'bg-blue-600', text: 'text-[#0F2942]' }
  },
  {
    id: 'emerald',
    name: 'Emerald BioTech',
    description: 'Scientific Green',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=500&q=80',
    bgCanvas: 'bg-[#F0FDF4]',
    bgCard: 'bg-white border-emerald-900/15 text-emerald-950',
    textTitle: 'text-[#065F46]',
    textSubtitle: 'text-emerald-700 font-sans font-medium',
    accentBg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    accentBtn: 'bg-[#065F46] hover:bg-emerald-900 text-white font-bold',
    badgeBg: 'bg-emerald-100 text-emerald-900 font-bold',
    sidebarBg: 'bg-white border-emerald-100',
    footerBg: 'bg-emerald-50/50 border-emerald-200 text-emerald-800',
    previewColors: { bg: '#F0FDF4', card: 'bg-white', accent: 'bg-[#065F46]', text: 'text-[#065F46]' }
  },
  {
    id: 'nordic',
    name: 'Nordic Slate',
    description: 'Minimalist Monochrome',
    thumbnailUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=500&q=80',
    bgCanvas: 'bg-[#F8FAFC]',
    bgCard: 'bg-white border-slate-300 text-slate-900',
    textTitle: 'text-slate-900',
    textSubtitle: 'text-slate-500 font-sans font-normal',
    accentBg: 'bg-slate-100 border-slate-300 text-slate-800',
    accentBtn: 'bg-slate-900 hover:bg-slate-800 text-white font-bold',
    badgeBg: 'bg-slate-900 text-white',
    sidebarBg: 'bg-white border-slate-200',
    footerBg: 'bg-slate-100 border-slate-200 text-slate-500',
    previewColors: { bg: '#F8FAFC', card: 'bg-white', accent: 'bg-slate-800', text: 'text-slate-900' }
  },
  {
    id: 'terracotta',
    name: 'Sunset Terracotta',
    description: 'Warm Earth Research',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80',
    bgCanvas: 'bg-[#FFF7ED]',
    bgCard: 'bg-white border-orange-900/15 text-stone-900',
    textTitle: 'text-[#431407]',
    textSubtitle: 'text-[#C2410C] font-serif italic',
    accentBg: 'bg-orange-50 border-orange-200 text-[#C2410C]',
    accentBtn: 'bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold',
    badgeBg: 'bg-[#431407] text-white',
    sidebarBg: 'bg-white border-orange-100',
    footerBg: 'bg-orange-50/60 border-orange-200 text-[#431407]/70',
    previewColors: { bg: '#FFF7ED', card: 'bg-white', accent: 'bg-[#C2410C]', text: 'text-[#431407]' }
  }
];

export const PresentationDeckModal: React.FC<PresentationDeckModalProps> = ({
  isOpen,
  onClose,
  paperSummary,
  apiConfig,
  initialDeck,
  onSaveDeck
}) => {
  const [deck, setDeck] = useState<PresentationDeck | null>(initialDeck || null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Configuration State
  const [audience, setAudience] = useState<string>('Academic Conference & Keynote Seminar');
  const [slideCount, setSlideCount] = useState<number>(6);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [showPromptEditor, setShowPromptEditor] = useState<boolean>(false);
  const [showThemeSelector, setShowThemeSelector] = useState<boolean>(false);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState<boolean>(false);
  const [copiedMarp, setCopiedMarp] = useState<boolean>(false);
  const [isExportingPptx, setIsExportingPptx] = useState<boolean>(false);
  const [theme, setTheme] = useState<SlideTheme>('luxe');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Presenter Mode (PowerPoint Style) State
  const [isPresenterMode, setIsPresenterMode] = useState<boolean>(false);
  const [laserPointerActive, setLaserPointerActive] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [presenterTimerSeconds, setPresenterTimerSeconds] = useState<number>(0);
  const [showPresenterNotes, setShowPresenterNotes] = useState<boolean>(false);
  const [imageSeedOffset, setImageSeedOffset] = useState<Record<number, number>>({});

  // Gemini API Image Generation State
  const [generatingSlideImages, setGeneratingSlideImages] = useState<Record<number, boolean>>({});
  const [isBatchGeneratingGemini, setIsBatchGeneratingGemini] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; currentTopic: string } | null>(null);
  const [geminiImageError, setGeminiImageError] = useState<string | null>(null);
  const [geminiSuccessNotice, setGeminiSuccessNotice] = useState<string | null>(null);
  const [editingPromptSlideIdx, setEditingPromptSlideIdx] = useState<number | null>(null);
  const [customSlidePromptInput, setCustomSlidePromptInput] = useState<string>('');

  // Construct topic-relatable image URLs based on paper field, paper title, and slide prompt
  const buildRelatableImageUrl = (slideTitle: string, imagePromptStr?: string, slideIdx: number = 0) => {
    const paperField = paperSummary.field || 'scientific research technology';
    const paperTitleClean = (paperSummary.title || '').replace(/[^a-zA-Z0-9\s]/g, '').slice(0, 30);
    const slideTopicClean = (slideTitle || '').replace(/[^a-zA-Z0-9\s]/g, '').slice(0, 30);
    const promptClean = (imagePromptStr || `${paperField} ${slideTopicClean}`).replace(/[^a-zA-Z0-9\s]/g, '').slice(0, 70);

    const extraSeed = imageSeedOffset[slideIdx] || 0;
    const promptParam = encodeURIComponent(`minimalist clean high quality 3D illustration diagram of ${promptClean}, ${paperField}, academic presentation visual, 8k resolution`);
    
    return `https://image.pollinations.ai/prompt/${promptParam}?width=1200&height=675&nologo=true&seed=${slideIdx + 101 + extraSeed}`;
  };

  // Generate Image with Gemini API for a single slide
  const handleGenerateGeminiImage = async (slideIndex: number, overridePrompt?: string) => {
    if (!deck || !deck.slides[slideIndex]) return;

    const targetSlide = deck.slides[slideIndex];
    setGeneratingSlideImages(prev => ({ ...prev, [slideIndex]: true }));
    setGeminiImageError(null);
    setGeminiSuccessNotice(null);

    try {
      const response = await fetch('/api/generate-slide-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slideTopic: targetSlide.title,
          imagePrompt: overridePrompt || targetSlide.imagePrompt || `Detailed scientific visual diagram of ${targetSlide.title}`,
          paperTitle: paperSummary.title,
          paperField: paperSummary.field,
          slideNumber: targetSlide.slideNumber,
          apiConfig,
          customPrompt: overridePrompt
        })
      });

      const data = await response.json();

      if (data.success && data.imageUrl) {
        setDeck(prevDeck => {
          if (!prevDeck) return null;
          const updatedSlides = [...prevDeck.slides];
          updatedSlides[slideIndex] = {
            ...updatedSlides[slideIndex],
            imageUrl: data.imageUrl,
            isGeminiGenerated: true,
            imageModelUsed: data.model || 'gemini-3.1-flash-lite-image',
            imagePrompt: overridePrompt || updatedSlides[slideIndex].imagePrompt,
            imageError: undefined
          };
          const newDeck = { ...prevDeck, slides: updatedSlides };
          onSaveDeck?.(newDeck);
          return newDeck;
        });

        setGeminiSuccessNotice(`Slide ${slideIndex + 1} image generated with Gemini API (${data.model || 'gemini-3.1-flash-lite-image'})!`);
        setTimeout(() => setGeminiSuccessNotice(null), 5000);
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
      } else {
        if (data.imageUrl) {
          setDeck(prevDeck => {
            if (!prevDeck) return null;
            const updatedSlides = [...prevDeck.slides];
            updatedSlides[slideIndex] = {
              ...updatedSlides[slideIndex],
              imageUrl: data.imageUrl,
              isGeminiGenerated: false,
              imageError: data.error
            };
            const newDeck = { ...prevDeck, slides: updatedSlides };
            onSaveDeck?.(newDeck);
            return newDeck;
          });
        }
        if (data.error) {
          setGeminiImageError(data.error);
        }
      }
    } catch (err: any) {
      console.error('Error generating Gemini image:', err);
      setGeminiImageError(err.message || 'Failed to generate image with Gemini API.');
    } finally {
      setGeneratingSlideImages(prev => ({ ...prev, [slideIndex]: false }));
      setEditingPromptSlideIdx(null);
    }
  };

  // Generate Images with Gemini API for all slides in the deck sequentially
  const handleGenerateAllGeminiImages = async () => {
    if (!deck || deck.slides.length === 0) return;

    setIsBatchGeneratingGemini(true);
    setGeminiImageError(null);
    setGeminiSuccessNotice(null);

    let successCount = 0;

    for (let i = 0; i < deck.slides.length; i++) {
      const slide = deck.slides[i];
      setBatchProgress({
        current: i + 1,
        total: deck.slides.length,
        currentTopic: slide.title
      });

      await handleGenerateGeminiImage(i);
      successCount++;
      // Brief pause to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    setBatchProgress(null);
    setIsBatchGeneratingGemini(false);
    setGeminiSuccessNotice(`Finished generating presentation visuals with Gemini API!`);
    setTimeout(() => setGeminiSuccessNotice(null), 6000);
    confetti({ particleCount: 90, spread: 100, origin: { y: 0.6 } });
  };

  // Generate fallback deck if none exists initially
  const generateFallbackDeck = (): PresentationDeck => {
    const paperTitleClean = paperSummary.title || 'Research Paper';
    const paperAuthors = Array.isArray(paperSummary.authors) ? paperSummary.authors.join(', ') : paperSummary.authors || 'Research Team';

    return {
      deckTitle: paperTitleClean,
      paperTitle: paperTitleClean,
      audience: audience,
      totalSlides: 6,
      slides: [
        {
          slideNumber: 1,
          title: paperTitleClean,
          subtitle: `Keynote Briefing & Core Contributions (${paperSummary.publicationYear || '2026'})`,
          layoutType: 'title',
          bulletPoints: [
            `Field: ${paperSummary.field || 'Computer Science & AI'}`,
            `Authors: ${paperAuthors}`,
            `Institution: ${paperSummary.institution || 'Leading Academic Research Lab'}`
          ],
          speakerNotes: `Welcome everyone. Today we are presenting "${paperTitleClean}". This paper introduces groundbreaking findings in ${paperSummary.field || 'its domain'}.`,
          keyTakeawayBox: paperSummary.tldr || 'Significant advances demonstrated across research benchmarks.',
          imageUrl: buildRelatableImageUrl(paperTitleClean, "Overview neural network diagram or scientific model", 0),
          imagePrompt: `Overview architectural visual of ${paperSummary.field || 'advanced research'}`,
          imageCaption: `Overview of research in ${paperSummary.field || 'advanced research'}`,
          keyHighlights: ['Keynote Briefing', paperSummary.publicationYear || '2026', paperSummary.field || 'Research']
        },
        {
          slideNumber: 2,
          title: "Executive Summary & Key Breakthrough",
          subtitle: "Addressing fundamental limitations in existing approaches",
          layoutType: 'split-image',
          bulletPoints: paperSummary.keyTakeaways?.map(k => `${k.category}: ${k.title}`) || [paperSummary.executiveSummary],
          speakerNotes: `Looking at the core executive summary: ${paperSummary.executiveSummary.slice(0, 180)}... Notice how this directly solves key performance bottlenecks.`,
          accentMetric: paperSummary.keyMetrics?.[0] ? {
            value: paperSummary.keyMetrics[0].value,
            label: paperSummary.keyMetrics[0].label
          } : { value: "SOTA", label: "Breakthrough Accuracy" },
          keyTakeawayBox: paperSummary.executiveSummary.slice(0, 150) + "...",
          imageUrl: buildRelatableImageUrl("Executive Summary", paperSummary.tldr, 1),
          imagePrompt: "Conceptual diagram showing core mechanism and data flow transformation",
          imageCaption: "Executive architecture & breakthrough framework",
          keyHighlights: ['Executive Overview', 'High Impact']
        },
        {
          slideNumber: 3,
          title: "Methodology & Pipeline Architecture",
          subtitle: "Step-by-step procedural framework and technical pipeline",
          layoutType: 'timeline',
          bulletPoints: paperSummary.pipelineSteps?.map(p => `Step ${p.stepNumber}: ${p.name} - ${p.description}`) || ['Multi-stage procedural pipeline architecture.'],
          speakerNotes: `The methodology relies on a sequential multi-stage pipeline. Each stage enhances representation quality while maintaining computational efficiency.`,
          imageUrl: buildRelatableImageUrl("Methodology Pipeline", "Sequential multi stage flowchart architecture diagram", 2),
          imagePrompt: "Isometric flowchart representation of sequential pipeline stages",
          imageCaption: "Methodological pipeline & architecture stages",
          keyHighlights: ['Multi-Stage Pipeline', 'System Design']
        },
        {
          slideNumber: 4,
          title: "Empirical Results & Benchmark Performance",
          subtitle: "Quantitative performance evaluation across standardized baselines",
          layoutType: 'metric-highlight',
          bulletPoints: paperSummary.keyMetrics?.map(m => `${m.label}: ${m.value} (${m.description})`) || ['High performance demonstrated across primary evaluation metrics.'],
          speakerNotes: `Examining the empirical benchmarks, key evaluation metrics show consistent gains over standard baseline implementations.`,
          accentMetric: paperSummary.keyMetrics?.[0] ? {
            value: paperSummary.keyMetrics[0].value,
            label: paperSummary.keyMetrics[0].label
          } : { value: "+18.4%", label: "Metric Improvement" },
          imageUrl: buildRelatableImageUrl("Benchmark Results", "3D bar chart graph displaying metric gains over baselines", 3),
          imagePrompt: "Sleek 3D benchmark chart metric comparison display",
          imageCaption: "Quantitative benchmark evaluation",
          keyHighlights: ['Empirical Gains', 'Benchmark SOTA']
        },
        {
          slideNumber: 5,
          title: "Actionable Insights & Deployment",
          subtitle: "Practical recommendations for research, engineering, and product deployment",
          layoutType: 'comparison',
          bulletPoints: paperSummary.actionableInsights?.map(a => `[${a.targetAudience}] ${a.recommendation}`) || ['Actionable guidance for immediate adoption.'],
          speakerNotes: `Here are key strategic recommendations tailored for engineers, academic researchers, and system architects.`,
          keyTakeawayBox: "Strategic adoption path recommended based on empirical findings.",
          imageUrl: buildRelatableImageUrl("Engineering Deployment", "Engineering blueprint modular system architecture diagram", 4),
          imagePrompt: "Modern engineering blueprint with interconnected modular components",
          imageCaption: "Implementation & adoption strategy",
          keyHighlights: ['Industry Impact', 'Engineering Focus']
        },
        {
          slideNumber: 6,
          title: "Conclusion & Future Horizons",
          subtitle: "Summary takeaway and prospective research directions",
          layoutType: 'summary',
          bulletPoints: [
            `Core Result: ${paperSummary.tldr}`,
            `Impact Domain: ${paperSummary.field}`,
            "Open research questions & future scalability directions"
          ],
          speakerNotes: `In conclusion, this paper establishes a solid foundation. Thank you for your attention. I welcome your questions!`,
          keyTakeawayBox: paperSummary.citation,
          imageUrl: buildRelatableImageUrl("Conclusion Future Horizons", "Futuristic research horizons and expanding neural pathways", 5),
          imagePrompt: "Abstract sunrise over horizon representing future technological research directions",
          imageCaption: "Future research outlook & scalability",
          keyHighlights: ['Conclusion', 'Future Directions']
        }
      ]
    };
  };

  const handleGenerateAiDeck = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paperTitle: paperSummary.title,
          paperSummary,
          audience,
          slideCount,
          customInstructions: customPrompt,
          apiConfig
        })
      });

      const data: PresentationDeck = await response.json();

      if (!response.ok) {
        throw new Error((data as any).error || (data as any).details || 'Failed to generate slide deck');
      }

      setDeck(data);
      onSaveDeck?.(data);
      setCurrentSlideIndex(0);

      // Sequentially synthesize high-resolution visuals for each slide so they are fully loaded and locked
      if (data.slides && data.slides.length > 0) {
        setIsBatchGeneratingGemini(true);
        const updatedSlides = [...data.slides];

        for (let i = 0; i < updatedSlides.length; i++) {
          const slide = updatedSlides[i];
          setBatchProgress({
            current: i + 1,
            total: updatedSlides.length,
            currentTopic: `Generating visual: ${slide.title}`
          });

          try {
            const imgRes = await fetch('/api/generate-slide-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                slideTopic: slide.title,
                imagePrompt: slide.imagePrompt || `Detailed scientific visual diagram of ${slide.title} in ${paperSummary.field}`,
                paperTitle: paperSummary.title,
                paperField: paperSummary.field,
                slideNumber: slide.slideNumber || (i + 1),
                apiConfig
              })
            });

            const imgData = await imgRes.json();
            if (imgData.success && imgData.imageUrl) {
              updatedSlides[i] = {
                ...updatedSlides[i],
                imageUrl: imgData.imageUrl,
                isGeminiGenerated: true,
                imageModelUsed: imgData.model || 'gemini-3.1-flash-lite-image'
              };
            } else if (imgData.imageUrl) {
              updatedSlides[i] = {
                ...updatedSlides[i],
                imageUrl: imgData.imageUrl,
                isGeminiGenerated: false
              };
            }
          } catch (e) {
            console.warn(`Failed image generation for slide ${i + 1}:`, e);
            if (!updatedSlides[i].imageUrl) {
              updatedSlides[i] = {
                ...updatedSlides[i],
                imageUrl: buildRelatableImageUrl(slide.title, slide.imagePrompt, i)
              };
            }
          }

          // Persist incremental progress
          const currentProgressDeck = { ...data, slides: [...updatedSlides] };
          setDeck(currentProgressDeck);
          onSaveDeck?.(currentProgressDeck);

          // Brief pause to prevent rate-limiting
          await new Promise(res => setTimeout(res, 500));
        }

        setIsBatchGeneratingGemini(false);
        setBatchProgress(null);
        setGeminiSuccessNotice(`All ${updatedSlides.length} slide visuals generated and preserved!`);
        setTimeout(() => setGeminiSuccessNotice(null), 5000);
        confetti({ particleCount: 50, spread: 80, origin: { y: 0.6 } });
      }
    } catch (err: any) {
      console.error('Slide generation error:', err);
      setError(err.message || 'Failed to generate presentation deck.');
      if (!deck) {
        const fallback = generateFallbackDeck();
        setDeck(fallback);
        onSaveDeck?.(fallback);
      }
    } finally {
      setLoading(false);
      setIsBatchGeneratingGemini(false);
      setBatchProgress(null);
    }
  };

  useEffect(() => {
    if (initialDeck) {
      setDeck(initialDeck);
    } else if (isOpen && !deck) {
      const fallback = generateFallbackDeck();
      setDeck(fallback);
      onSaveDeck?.(fallback);
    }
  }, [isOpen, initialDeck, paperSummary?.title]);

  // Slideshow auto-advance timer
  useEffect(() => {
    let timer: any;
    if (isPlaying && deck && deck.slides.length > 0) {
      timer = setInterval(() => {
        setCurrentSlideIndex(prev => (prev + 1) % deck.slides.length);
      }, 5000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, deck]);

  // Presenter mode timer count
  useEffect(() => {
    let timer: any;
    if (isPresenterMode) {
      timer = setInterval(() => {
        setPresenterTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setPresenterTimerSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isPresenterMode]);

  // Laser pointer mouse position tracker
  const handleMouseMovePresenter = (e: React.MouseEvent) => {
    if (laserPointerActive) {
      setMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || !deck) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setCurrentSlideIndex(prev => Math.min(prev + 1, deck.slides.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlideIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        if (isPresenterMode) setIsPresenterMode(false);
        else if (showThemeSelector) setShowThemeSelector(false);
        else if (isFullscreen) setIsFullscreen(false);
        else onClose();
      } else if (e.key === 'p' || e.key === 'P') {
        setIsPresenterMode(prev => !prev);
      } else if (e.key === 'l' || e.key === 'L') {
        setLaserPointerActive(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, deck, isFullscreen, isPresenterMode, showThemeSelector, onClose]);

  if (!isOpen) return null;

  const currentSlide: SlideItem | undefined = deck?.slides[currentSlideIndex];
  const geminiGeneratedCount = deck?.slides.filter(s => s.isGeminiGenerated).length || 0;

  // Refresh / Cycle image for current slide
  const handleRefreshSlideImage = (idx: number) => {
    setImageSeedOffset(prev => ({
      ...prev,
      [idx]: (prev[idx] || 0) + 1
    }));
  };

  // Theme styling getter
  const currentThemeConfig = THEME_OPTIONS.find(t => t.id === theme) || THEME_OPTIONS[0];

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyMarkdownDeck = () => {
    if (!deck) return;
    let md = `# ${deck.deckTitle}\n*Audience: ${deck.audience}*\n\n---\n\n`;
    deck.slides.forEach((slide) => {
      md += `## Slide ${slide.slideNumber}: ${slide.title}\n`;
      if (slide.subtitle) md += `*${slide.subtitle}*\n\n`;
      if (slide.imageUrl) md += `![${slide.imageCaption || slide.title}](${slide.imageUrl})\n\n`;
      slide.bulletPoints.forEach(bp => md += `- ${bp}\n`);
      if (slide.accentMetric) md += `\n**Key Metric:** ${slide.accentMetric.value} (${slide.accentMetric.label})\n`;
      if (slide.keyTakeawayBox) md += `\n> ${slide.keyTakeawayBox}\n`;
      md += `\n**Speaker Notes:**\n${slide.speakerNotes}\n\n---\n\n`;
    });

    navigator.clipboard.writeText(md);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  const handleDownloadHtmlSlides = () => {
    if (!deck) return;
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${deck.deckTitle} - Presentation Deck</title>
  <style>
    body { font-family: 'Georgia', serif; background: #0F172A; color: #F8FAFC; margin: 0; padding: 40px; }
    .slide { background: #1E293B; color: #F8FAFC; border-radius: 20px; padding: 48px; margin-bottom: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); page-break-after: always; }
    h1 { color: #F59E0B; font-size: 36px; margin-top: 0; border-bottom: 2px solid #F59E0B; padding-bottom: 12px; }
    .subtitle { font-style: italic; color: #94A3B8; margin-bottom: 24px; font-size: 20px; }
    .img-box { width: 100%; max-height: 400px; object-fit: cover; border-radius: 12px; margin: 24px 0; }
    ul { font-family: sans-serif; line-height: 1.8; font-size: 18px; }
    .notes { background: #0F172A; padding: 20px; border-left: 4px solid #F59E0B; border-radius: 8px; font-family: sans-serif; font-size: 15px; margin-top: 28px; color: #CBD5E1; }
    .metric { background: #F59E0B; color: #0F172A; padding: 14px 24px; border-radius: 12px; display: inline-block; font-weight: bold; margin-top: 16px; font-size: 20px; }
  </style>
</head>
<body>
  ${deck.slides.map(s => `
    <div class="slide">
      <h1>Slide ${s.slideNumber}: ${s.title}</h1>
      ${s.subtitle ? `<div class="subtitle">${s.subtitle}</div>` : ''}
      ${s.imageUrl ? `<img src="${s.imageUrl}" class="img-box" alt="${s.title}" />` : ''}
      <ul>
        ${s.bulletPoints.map(b => `<li>${b}</li>`).join('')}
      </ul>
      ${s.accentMetric ? `<div class="metric">${s.accentMetric.value} - ${s.accentMetric.label}</div>` : ''}
      <div class="notes"><strong>Speaker Talking Points:</strong> ${s.speakerNotes}</div>
    </div>
  `).join('')}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paperSummary.title.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}_Presentation.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPptx = async () => {
    if (!deck) return;
    setIsExportingPptx(true);
    try {
      const pptx = new pptxgen();
      pptx.layout = 'LAYOUT_16x9';
      pptx.author = 'PaperVision AI';
      pptx.title = deck.deckTitle;

      deck.slides.forEach((s) => {
        const slide = pptx.addSlide();
        slide.background = { color: 'FDFCFB' };

        slide.addText(`SLIDE ${s.slideNumber}: ${s.title.toUpperCase()}`, {
          x: 0.8,
          y: 0.5,
          w: 8.5,
          h: 0.8,
          fontSize: 20,
          fontFace: 'Georgia',
          bold: true,
          color: '1A1A1A'
        });

        if (s.subtitle) {
          slide.addText(s.subtitle, {
            x: 0.8,
            y: 1.2,
            w: 8.5,
            h: 0.4,
            fontSize: 13,
            fontFace: 'Arial',
            italic: true,
            color: 'A67C52'
          });
        }

        const bulletItems = s.bulletPoints.map(bp => ({
          text: bp,
          options: { fontSize: 13, color: '262626', bullet: true, breakLine: true }
        }));

        slide.addText(bulletItems, {
          x: 0.8,
          y: 1.8,
          w: 5.5,
          h: 4.2,
          fontFace: 'Arial',
          lineSpacing: 22
        });

        if (s.accentMetric) {
          slide.addShape(pptx.ShapeType.rect, {
            x: 6.7,
            y: 1.8,
            w: 2.6,
            h: 1.6,
            fill: { color: 'FAF8F5' },
            line: { color: 'A67C52', width: 1.5 }
          });
          slide.addText(s.accentMetric.value, {
            x: 6.7,
            y: 1.9,
            w: 2.6,
            h: 0.8,
            fontSize: 22,
            bold: true,
            color: 'A67C52',
            align: 'center'
          });
          slide.addText(s.accentMetric.label, {
            x: 6.7,
            y: 2.6,
            w: 2.6,
            h: 0.6,
            fontSize: 10,
            color: '666666',
            align: 'center'
          });
        }

        if (s.speakerNotes) {
          slide.addNotes(s.speakerNotes);
        }
      });

      await pptx.writeFile({ fileName: `${paperSummary.title.slice(0, 25).replace(/[^a-zA-Z0-9]/g, '_')}_Deck.pptx` });
      confetti({ particleCount: 40, spread: 60 });
    } catch (err) {
      console.error('Failed to export PPTX:', err);
    } finally {
      setIsExportingPptx(false);
    }
  };

  const handleCopyMarpMarkdown = () => {
    if (!deck) return;
    let marp = `---
marp: true
theme: default
paginate: true
header: '${deck.deckTitle}'
footer: 'PaperVision AI • ${deck.audience}'
style: |
  section {
    background-color: #FDFCFB;
    color: #1A1A1A;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  h1 { color: #A67C52; font-family: 'Playfair Display', serif; }
---

<!-- _class: lead -->
# ${deck.deckTitle}
### ${paperSummary.title}
**${deck.audience}**

---
`;
    deck.slides.forEach(s => {
      marp += `
# ${s.title}
${s.subtitle ? `*${s.subtitle}*\n` : ''}
${s.bulletPoints.map(b => `- ${b}`).join('\n')}

${s.accentMetric ? `\n> **${s.accentMetric.value}** — ${s.accentMetric.label}\n` : ''}
<!--
Speaker Notes:
${s.speakerNotes}
-->

---
`;
    });
    navigator.clipboard.writeText(marp);
    setCopiedMarp(true);
    confetti({ particleCount: 25, spread: 45 });
    setTimeout(() => setCopiedMarp(false), 2000);
  };

  // FULLSCREEN POWERPOINT-STYLE PRESENTER MODE CANVAS
  if (isPresenterMode && currentSlide) {
    const activeImgUrl = currentSlide.imageUrl || buildRelatableImageUrl(currentSlide.title, currentSlide.imagePrompt, currentSlideIndex);

    return (
      <div 
        className="fixed inset-0 z-50 bg-[#0A0F1D] text-white flex flex-col justify-between overflow-hidden cursor-default select-none animate-fadeIn"
        onMouseMove={handleMouseMovePresenter}
      >
        {/* Laser Pointer Dot */}
        {laserPointerActive && (
          <div 
            className="pointer-events-none fixed w-6 h-6 rounded-full bg-red-500 shadow-[0_0_20px_#ef4444] z-50 transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
            style={{ left: mousePos.x, top: mousePos.y }}
          />
        )}

        {/* Presenter Top Bar */}
        <div className="px-3 sm:px-8 py-2.5 sm:py-4 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between z-10 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500 text-black flex items-center justify-center font-bold flex-shrink-0">
              <Tv className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-amber-400 block">
                Keynote Presentation Mode
              </span>
              <h3 className="font-serif text-xs sm:text-sm font-medium text-white truncate max-w-[130px] sm:max-w-xl">
                {paperSummary.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-4 flex-shrink-0">
            <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-lg bg-white/10 text-xs font-mono font-bold text-amber-300">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>{formatTimer(presenterTimerSeconds)}</span>
            </div>

            <button
              onClick={() => setLaserPointerActive(!laserPointerActive)}
              className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                laserPointerActive ? 'bg-red-500 text-white shadow-[0_0_15px_#ef4444]' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="Toggle Laser Pointer (Press L)"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Laser</span>
            </button>

            <button
              onClick={() => setShowPresenterNotes(!showPresenterNotes)}
              className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                showPresenterNotes ? 'bg-amber-500 text-black font-bold' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="Toggle Speaker Notes Drawer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Speaker Script</span>
            </button>

            <button
              onClick={() => setIsPresenterMode(false)}
              className="px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Exit Presenter Mode (ESC)"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </div>

        {/* Presenter Slide Stage - Strict Single Slide Canvas */}
        <div className="flex-1 p-3 sm:p-12 flex items-center justify-center overflow-y-auto sm:overflow-hidden relative">
          <div className="w-full max-w-6xl aspect-auto sm:aspect-[16/10] max-h-none sm:max-h-[80vh] bg-[#141C2E] border border-white/15 rounded-2xl sm:rounded-3xl p-4 sm:p-10 shadow-2xl flex flex-col justify-between relative overflow-y-auto sm:overflow-hidden">
            
            {/* Header badges */}
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-md bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-widest">
                    Slide 0{currentSlide.slideNumber}
                  </span>
                  <span className="px-3 py-1 rounded-md bg-white/10 text-amber-300 font-bold text-xs uppercase tracking-widest">
                    {currentSlide.layoutType}
                  </span>
                  {currentSlide.keyHighlights?.map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase border border-emerald-500/30">
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-xs font-serif italic text-white/50">
                  {paperSummary.field || 'Research Paper Keynote'}
                </span>
              </div>

              {/* Title */}
              <h2 className="font-serif text-2xl sm:text-4xl font-medium text-white mb-1 leading-tight truncate">
                {currentSlide.title}
              </h2>
              {currentSlide.subtitle && (
                <p className="text-xs sm:text-base text-amber-300 font-serif italic mb-6 truncate">
                  {currentSlide.subtitle}
                </p>
              )}

              {/* Slide Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-2">
                <div className={`${activeImgUrl ? 'md:col-span-7' : 'md:col-span-12'} space-y-3`}>
                  {currentSlide.bulletPoints.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-normal">
                        {bullet}
                      </p>
                    </div>
                  ))}

                  {currentSlide.accentMetric && (
                    <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-500/5 border border-amber-500/30 flex items-center justify-between">
                      <span className="text-xs uppercase font-bold text-amber-300 tracking-wider">
                        {currentSlide.accentMetric.label}
                      </span>
                      <span className="font-serif text-2xl sm:text-3xl font-bold text-white">
                        {currentSlide.accentMetric.value}
                      </span>
                    </div>
                  )}
                </div>

                {/* Relatable Visual Image */}
                {activeImgUrl && (
                  <div className="md:col-span-5 space-y-2">
                    <div className="relative rounded-2xl overflow-hidden border border-white/20 shadow-2xl group/img bg-slate-950">
                      <img
                        src={activeImgUrl}
                        alt={currentSlide.imageCaption || currentSlide.title}
                        className="w-full h-44 sm:h-56 object-cover transform group-hover/img:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                      {/* Gemini Status Pill & Generator Button */}
                      <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
                        {currentSlide.isGeminiGenerated ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[9px] font-bold tracking-wider uppercase flex items-center gap-1 backdrop-blur-md shadow-md">
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                            <span>Gemini Vision</span>
                          </span>
                        ) : null}

                        <button
                          onClick={() => handleGenerateGeminiImage(currentSlideIndex)}
                          disabled={generatingSlideImages[currentSlideIndex]}
                          className="px-2.5 py-1 rounded-full bg-amber-500/90 hover:bg-amber-400 text-slate-950 text-[9px] font-bold tracking-wider uppercase flex items-center gap-1 backdrop-blur-md shadow-md cursor-pointer transition-all disabled:opacity-50"
                          title="Generate high-resolution visual using Gemini API"
                        >
                          <Wand2 className="w-3 h-3" />
                          <span>{generatingSlideImages[currentSlideIndex] ? 'Generating...' : currentSlide.isGeminiGenerated ? 'Regen' : 'Gemini AI'}</span>
                        </button>
                      </div>

                      <div className="absolute bottom-2 left-3 right-3 text-white text-[10px]">
                        <p className="font-bold truncate text-amber-300">{currentSlide.imageCaption || 'Slide Visual Illustration'}</p>
                      </div>

                      {/* Regenerate Image Seed Button */}
                      <button
                        onClick={() => handleRefreshSlideImage(currentSlideIndex)}
                        className="absolute top-2 right-2 p-1.5 rounded-xl bg-black/60 hover:bg-amber-500 hover:text-black text-white backdrop-blur-md transition-all cursor-pointer opacity-0 group-hover/img:opacity-100"
                        title="Generate Alternative Relatable Image"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>

                      {/* Loading Overlay */}
                      {generatingSlideImages[currentSlideIndex] && (
                        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center text-center p-4 z-20">
                          <RefreshCw className="w-6 h-6 text-amber-400 animate-spin mb-2" />
                          <p className="text-white text-xs font-bold font-serif">Generating with Gemini API...</p>
                          <p className="text-white/70 text-[10px] italic mt-0.5">Creating 3D academic visual for {currentSlide.title}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {currentSlide.keyTakeawayBox && (
                <div className="mt-4 p-3 rounded-xl bg-white/5 border border-amber-500/30 text-xs font-serif italic text-amber-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="truncate">{currentSlide.keyTakeawayBox}</span>
                </div>
              )}
            </div>

            {/* Speaker Script Panel Drawer inside Presenter Mode */}
            {showPresenterNotes && (
              <div className="mt-4 p-3 rounded-xl bg-black/80 border border-amber-500/40 text-xs text-slate-200 animate-slideInUp">
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block mb-1">
                  🎙️ Presenter Script & Talking Points:
                </span>
                <p className="leading-relaxed font-sans">{currentSlide.speakerNotes}</p>
              </div>
            )}

            {/* Slide Footer */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-white/50">
              <span>Audience: {deck.audience}</span>
              <span>Slide {currentSlideIndex + 1} of {deck.slides.length}</span>
            </div>
          </div>
        </div>

        {/* Presenter Navigation HUD */}
        <div className="px-8 py-4 bg-black/90 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={() => setCurrentSlideIndex(prev => Math.max(prev - 1, 0))}
            disabled={currentSlideIndex === 0}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs uppercase font-bold tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Previous</span>
          </button>

          {/* Slide Thumbnails strip in Presenter Mode */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-xl px-4">
            {deck.slides.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  currentSlideIndex === idx
                    ? 'bg-amber-500 text-black shadow-lg scale-105'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                #{s.slideNumber}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentSlideIndex(prev => Math.min(prev + 1, deck.slides.length - 1))}
            disabled={currentSlideIndex === deck.slides.length - 1}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-30"
          >
            <span>Next</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // STANDARD STUDIO MODAL VIEW
  const activeSlideImgUrl = currentSlide?.imageUrl || (currentSlide ? buildRelatableImageUrl(currentSlide.title, currentSlide.imagePrompt, currentSlideIndex) : '');

  return (
    <div className={`fixed inset-0 z-50 bg-[#0F172A]/90 backdrop-blur-md flex flex-col justify-between p-2 sm:p-6 overflow-hidden ${isFullscreen ? 'p-0' : ''}`}>
      {/* Main App Container Box */}
      <div className={`bg-[#FDFCFB] border border-[#1A1A1A]/20 rounded-2xl shadow-2xl flex flex-col w-full max-w-7xl mx-auto h-full overflow-hidden ${isFullscreen ? 'rounded-none border-none max-w-none' : ''}`}>
        
        {/* Top Header Controls */}
        <div className="p-4 bg-[#F9F7F2] border-b border-[#1A1A1A]/10 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#A67C52] text-white flex items-center justify-center font-bold shadow-sm">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#A67C52]">
                  NotebookLM Visual Presentation Studio
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#A67C52]/10 text-[#A67C52] text-[9px] font-bold uppercase tracking-wider">
                  {deck?.slides.length || 6} Slides
                </span>
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-medium text-[#1A1A1A] truncate max-w-md sm:max-w-xl">
                {paperSummary.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* GEMINI VISION IMAGE GENERATION ALL BUTTON */}
            <button
              onClick={handleGenerateAllGeminiImages}
              disabled={isBatchGeneratingGemini}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-105 disabled:opacity-50"
              title="Generate topic-relatable visual diagrams using Gemini API for all slides"
              id="btn-gemini-generate-all-images"
            >
              <Sparkles className={`w-3.5 h-3.5 text-amber-100 ${isBatchGeneratingGemini ? 'animate-spin' : ''}`} />
              <span>
                {isBatchGeneratingGemini ? 'Generating All...' : `Gemini Vision AI (${geminiGeneratedCount}/${deck?.slides.length || 6})`}
              </span>
            </button>

            {/* POWERPOINT PRESENT BUTTON */}
            <button
              onClick={() => setIsPresenterMode(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md hover:scale-105"
              title="Launch PowerPoint Keynote Presentation Mode (Press P)"
              id="btn-present-slideshow"
            >
              <Tv className="w-4 h-4 fill-slate-950" />
              <span>Present Deck</span>
            </button>

            {/* VISUAL THEME SELECTION BUTTON */}
            <button
              onClick={() => setShowThemeSelector(!showThemeSelector)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                showThemeSelector ? 'bg-[#1A1A1A] text-white' : 'bg-white hover:bg-[#1A1A1A]/5 text-[#1A1A1A] border border-[#1A1A1A]/20'
              }`}
              id="btn-open-theme-selector"
              title="Open Theme Selection Page with Visual Thumbnail Buttons"
            >
              <Palette className="w-4 h-4 text-[#A67C52]" />
              <span>Theme: {currentThemeConfig.name}</span>
            </button>

            {/* Auto Play Slideshow */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                isPlaying ? 'bg-amber-600 text-white animate-pulse' : 'bg-white hover:bg-[#1A1A1A]/5 text-[#1A1A1A] border border-[#1A1A1A]/20'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-[#A67C52]" />}
              <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
            </button>

            <button
              onClick={() => setShowPromptEditor(!showPromptEditor)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                showPromptEditor ? 'bg-[#1A1A1A] text-white' : 'bg-white hover:bg-[#1A1A1A]/5 text-[#1A1A1A] border border-[#1A1A1A]/20'
              }`}
              id="btn-toggle-slide-prompt"
            >
              <Terminal className="w-3.5 h-3.5 text-[#A67C52]" />
              <span>AI Deck Settings</span>
            </button>

            <button
              onClick={handleExportPptx}
              disabled={isExportingPptx}
              className="px-3 py-1.5 rounded-xl bg-[#A67C52] hover:bg-[#8F6640] text-white text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-xs btn-tactile disabled:opacity-50"
              title="Download real Microsoft PowerPoint (.pptx) file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExportingPptx ? 'Exporting...' : 'Export .PPTX'}</span>
            </button>

            <button
              onClick={handleCopyMarpMarkdown}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#1A1A1A]/5 border border-[#1A1A1A]/20 text-[#1A1A1A] text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy Marp / Slidev Markdown format"
            >
              {copiedMarp ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#A67C52]" />}
              <span>{copiedMarp ? 'Copied' : 'Marp .MD'}</span>
            </button>

            <button
              onClick={handleCopyMarkdownDeck}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#1A1A1A]/5 border border-[#1A1A1A]/20 text-[#1A1A1A] text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedMarkdown ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#A67C52]" />}
              <span>{copiedMarkdown ? 'Copied' : 'Copy MD'}</span>
            </button>

            <button
              onClick={handleDownloadHtmlSlides}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#1A1A1A]/5 border border-[#1A1A1A]/20 text-[#1A1A1A] text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#A67C52]" />
              <span>Export HTML</span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-white hover:bg-[#1A1A1A]/5 border border-[#1A1A1A]/20 text-[#1A1A1A] transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Presentation' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-[#1A1A1A]/50 hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Gemini Batch Generation Progress Banner */}
        {batchProgress && (
          <div className="bg-[#1A1A1A] border-b border-amber-500/30 text-white px-6 py-3 flex items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-400">Gemini 3.1 Flash Image Generation Active</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/90 font-mono">
                    Slide {batchProgress.current} of {batchProgress.total}
                  </span>
                </div>
                <p className="text-xs text-white/70 italic truncate max-w-md mt-0.5">
                  Synthesizing visual for: "{batchProgress.currentTopic}"
                </p>
              </div>
            </div>
            <div className="w-48 sm:w-64 bg-white/10 rounded-full h-2.5 overflow-hidden border border-white/10">
              <div 
                className="bg-gradient-to-r from-amber-500 to-amber-300 h-full transition-all duration-300 rounded-full"
                style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Gemini Success Notice */}
        {geminiSuccessNotice && (
          <div className="bg-emerald-950/90 border-b border-emerald-500/40 text-emerald-100 px-6 py-2.5 flex items-center justify-between text-xs animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="font-medium">{geminiSuccessNotice}</span>
            </div>
            <button 
              onClick={() => setGeminiSuccessNotice(null)} 
              className="text-emerald-400 hover:text-white cursor-pointer p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Gemini Error / Quota Notice Banner */}
        {geminiImageError && (
          <div className="bg-amber-950/90 border-b border-amber-500/40 text-amber-100 px-6 py-3 flex items-center justify-between gap-4 text-xs animate-fadeIn">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-300">Gemini Image Generation Notice</p>
                <p className="text-amber-100/90 text-[11px] leading-relaxed mt-0.5">
                  {geminiImageError}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setGeminiImageError(null)} 
              className="text-amber-400 hover:text-white cursor-pointer p-1 self-start"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* DEDICATED VISUAL THEME SELECTION PAGE / DRAWER */}
        {showThemeSelector && (
          <div className="p-6 bg-[#1A1A1A] text-white border-b border-white/10 animate-fadeIn space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#A67C52] flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-[#A67C52]" />
                  Presentation Design & Theme Selection Gallery
                </span>
                <h4 className="text-base font-serif font-medium text-white">
                  Choose a visual theme for your research presentation deck
                </h4>
              </div>

              <button
                onClick={() => setShowThemeSelector(false)}
                className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white/80 transition-colors cursor-pointer"
              >
                Done / Close
              </button>
            </div>

            {/* Grid of Theme Thumbnail Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {THEME_OPTIONS.map((themeOpt) => {
                const isSelected = theme === themeOpt.id;

                return (
                  <button
                    key={themeOpt.id}
                    onClick={() => {
                      setTheme(themeOpt.id);
                      setShowThemeSelector(false);
                    }}
                    className={`relative group rounded-2xl overflow-hidden border-2 transition-all cursor-pointer text-left shadow-md hover:shadow-2xl hover:scale-105 ${
                      isSelected
                        ? 'border-[#A67C52] ring-4 ring-[#A67C52]/40 scale-105'
                        : 'border-white/15 hover:border-white/40'
                    }`}
                    id={`btn-select-theme-${themeOpt.id}`}
                  >
                    {/* Small Image of the Theme Design Thumbnail */}
                    <div className="relative h-36 w-full overflow-hidden bg-slate-900">
                      <img
                        src={themeOpt.thumbnailUrl}
                        alt={themeOpt.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />

                      {/* Mockup Overlay Preview Box inside Thumbnail */}
                      <div className="absolute inset-0 p-2.5 bg-black/40 backdrop-blur-[1px] flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider text-white bg-black/60">
                            {themeOpt.description}
                          </span>
                          {isSelected && (
                            <span className="flex items-center gap-1 text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[#A67C52] text-white shadow-xs">
                              <Check className="w-2.5 h-2.5" /> Selected
                            </span>
                          )}
                        </div>

                        {/* Theme Card Mini Visual Structure */}
                        <div className={`p-2 rounded-lg ${themeOpt.previewColors.card} border border-white/20 shadow-md space-y-1`}>
                          <div className={`h-1.5 w-1/2 rounded ${themeOpt.previewColors.accent}`} />
                          <div className={`h-1 w-full rounded bg-current opacity-40`} />
                          <div className={`h-1 w-3/4 rounded bg-current opacity-20`} />
                        </div>
                      </div>

                      {/* Name of the theme written inside the thumbnail on the bottom side */}
                      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex items-end p-2.5">
                        <span className="text-xs font-bold text-white uppercase tracking-wider font-sans drop-shadow-md truncate w-full flex items-center justify-between">
                          <span>{themeOpt.name}</span>
                          {isSelected && <CheckSquare className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Prompt & Custom Instructions Drawer */}
        {showPromptEditor && (
          <div className="p-4 bg-[#1A1A1A] text-white border-b border-[#1A1A1A]/20 animate-fadeIn space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#A67C52] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#A67C52]" />
                Presentation AI Custom Instructions & Audience Tuning
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-white/70 block mb-1">Target Audience</label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#A67C52]"
                >
                  <option value="Academic Conference & Keynote Seminar">Academic Conference & Keynote Seminar</option>
                  <option value="Executive Briefing & C-Suite Overview">Executive Briefing & C-Suite Overview</option>
                  <option value="Engineering & Developer Workshop">Engineering & Developer Workshop</option>
                  <option value="University Classroom Lecture">University Classroom Lecture</option>
                  <option value="General Public & Non-technical Audience">General Public & Non-technical Audience</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-white/70 block mb-1">Slide Deck Length</label>
                <select
                  value={slideCount}
                  onChange={(e) => setSlideCount(Number(e.target.value))}
                  className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#A67C52]"
                >
                  <option value={5}>5 Key Slides (Fast Overview)</option>
                  <option value={6}>6 Slides (Standard Presentation)</option>
                  <option value={8}>8 Slides (Deep Academic Seminar)</option>
                  <option value={10}>10 Slides (Comprehensive Workshop)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-white/70 block mb-1">Custom Slide Prompts / Specific Focus</label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={2}
                className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl p-3 text-xs text-white/90 font-mono focus:outline-none focus:border-[#A67C52] resize-y"
                placeholder="e.g. Include detailed image prompts for architecture diagrams, stress empirical baseline metrics, and add speaker Q&A notes."
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowPromptEditor(false)}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] uppercase font-bold tracking-wider cursor-pointer"
              >
                Close Panel
              </button>
              <button
                onClick={handleGenerateAiDeck}
                disabled={loading}
                className="px-4 py-1.5 rounded-lg bg-[#A67C52] hover:bg-[#8C643E] text-white text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                id="btn-rebuild-slides-ai"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Generating Presentation...' : 'Regenerate Deck'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Stage Canvas & Speaker Notes - STRICT SINGLE SLIDE FRAME */}
        <div className={`flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 ${currentThemeConfig.bgCanvas} items-start`}>
          
          {/* Individual Slide Canvas Frame */}
          <div className={`${showSpeakerNotes ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all`}>
            {loading ? (
              <div className={`${currentThemeConfig.bgCard} border rounded-2xl p-12 min-h-[460px] flex flex-col items-center justify-center text-center space-y-4 shadow-xl`}>
                <div className="w-14 h-14 rounded-full bg-[#A67C52] flex items-center justify-center text-white animate-bounce">
                  <Presentation className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-serif text-2xl">Generating AI Keynote Deck...</p>
                  <p className="text-xs opacity-70 font-serif italic max-w-sm mt-1">
                    Synthesizing topic-relatable visual illustrations, structured bullet points, metrics, and talking scripts.
                  </p>
                </div>
              </div>
            ) : currentSlide ? (
              <div className={`${currentThemeConfig.bgCard} border-2 rounded-2xl p-6 sm:p-8 shadow-2xl min-h-[460px] max-h-[620px] flex flex-col justify-between relative overflow-hidden group transition-all`}>
                
                {/* Slide Card Header */}
                <div>
                  <div className="flex items-center justify-between border-b border-current/10 pb-3 mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-widest font-bold ${currentThemeConfig.badgeBg}`}>
                        Slide 0{currentSlide.slideNumber}
                      </span>
                      <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-widest font-bold ${currentThemeConfig.accentBg}`}>
                        {currentSlide.layoutType}
                      </span>
                      {currentSlide.keyHighlights?.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[9px] font-bold uppercase border border-emerald-500/20">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] font-serif italic opacity-60">
                      {deck?.paperTitle}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h2 className={`font-serif text-2xl sm:text-3xl font-medium mb-1 leading-tight ${currentThemeConfig.textTitle}`}>
                    {currentSlide.title}
                  </h2>
                  {currentSlide.subtitle && (
                    <p className={`text-xs sm:text-sm mb-4 ${currentThemeConfig.textSubtitle}`}>
                      {currentSlide.subtitle}
                    </p>
                  )}

                  {/* VISUAL IMAGE & CONTENT GRID FOR SINGLE SLIDE */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 my-4 items-center">
                    
                    {/* Left or Main Column Bullet Points */}
                    <div className={`${activeSlideImgUrl ? 'md:col-span-7' : 'md:col-span-12'} space-y-2.5`}>
                      {currentSlide.bulletPoints.map((bullet, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-black/5 transition-colors">
                          <CheckCircle2 className="w-4 h-4 text-[#A67C52] mt-0.5 flex-shrink-0" />
                          <p className="text-xs sm:text-sm leading-relaxed font-normal opacity-90">
                            {bullet}
                          </p>
                        </div>
                      ))}

                      {/* Key Metric Callout */}
                      {currentSlide.accentMetric && (
                        <div className={`mt-3 p-3.5 rounded-xl ${currentThemeConfig.accentBg} flex items-center justify-between shadow-xs`}>
                          <span className="text-xs uppercase font-bold tracking-wider">
                            {currentSlide.accentMetric.label}
                          </span>
                          <span className="font-serif text-xl sm:text-2xl font-bold">
                            {currentSlide.accentMetric.value}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right Column: AI Visual Illustration Image with Gemini API Integration */}
                    {activeSlideImgUrl && (
                      <div className="md:col-span-5 space-y-2.5">
                        <div className="relative rounded-2xl overflow-hidden border border-current/15 shadow-md group/img bg-slate-950">
                          <img
                            src={activeSlideImgUrl}
                            alt={currentSlide.imageCaption || currentSlide.title}
                            className="w-full h-44 sm:h-52 object-cover transform group-hover/img:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-85" />
                          
                          {/* Top-Left Gemini Badge */}
                          <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
                            {currentSlide.isGeminiGenerated ? (
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-950/85 border border-emerald-500/50 text-emerald-300 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 backdrop-blur-md shadow-md">
                                <Sparkles className="w-3 h-3 text-emerald-400" />
                                <span>Gemini Vision</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/20 text-white/80 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 backdrop-blur-md">
                                <ImageIcon className="w-3 h-3 text-amber-400" />
                                <span>Slide Visual</span>
                              </span>
                            )}
                          </div>

                          {/* Top-Right Quick Action Buttons */}
                          <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 opacity-0 group-hover/img:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleRefreshSlideImage(currentSlideIndex)}
                              className="p-1.5 rounded-lg bg-black/60 hover:bg-[#A67C52] hover:text-white text-white/80 transition-all cursor-pointer backdrop-blur-md"
                              title="Cycle alternative seed visual"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Caption at bottom of image */}
                          <div className="absolute bottom-2.5 left-3 right-3 text-white text-[10px] font-sans">
                            <p className="font-bold truncate text-amber-300">{currentSlide.imageCaption || currentSlide.title}</p>
                            <p className="text-white/70 text-[9px] truncate">{currentSlide.imagePrompt || currentSlide.title}</p>
                          </div>

                          {/* Loading Overlay when generating image with Gemini */}
                          {generatingSlideImages[currentSlideIndex] && (
                            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center text-center p-4 z-20 animate-fadeIn">
                              <RefreshCw className="w-7 h-7 text-amber-400 animate-spin mb-2" />
                              <p className="text-white text-xs font-bold font-serif">Generating with Gemini API...</p>
                              <p className="text-amber-300/80 text-[10px] italic mt-1 max-w-xs">
                                Synthesizing topic-specific visual for "{currentSlide.title}"
                              </p>
                              <span className="mt-2 text-[9px] text-white/50 font-mono">model: gemini-3.1-flash-lite-image</span>
                            </div>
                          )}
                        </div>

                        {/* Interactive Gemini Generation Control Bar */}
                        <div className="bg-black/5 dark:bg-white/5 border border-current/10 rounded-xl p-2.5 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Wand2 className="w-3.5 h-3.5 text-[#A67C52] flex-shrink-0" />
                              <span className="text-[10px] font-bold uppercase tracking-wider text-current/80 truncate">
                                Gemini Image Generator
                              </span>
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => {
                                  if (editingPromptSlideIdx === currentSlideIndex) {
                                    setEditingPromptSlideIdx(null);
                                  } else {
                                    setEditingPromptSlideIdx(currentSlideIndex);
                                    setCustomSlidePromptInput(currentSlide.imagePrompt || `Detailed scientific visual diagram of ${currentSlide.title}`);
                                  }
                                }}
                                className="px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider bg-current/5 hover:bg-current/10 text-current/80 transition-colors cursor-pointer"
                                title="Edit prompt sent to Gemini"
                              >
                                {editingPromptSlideIdx === currentSlideIndex ? 'Cancel' : 'Edit Prompt'}
                              </button>

                              <button
                                onClick={() => handleGenerateGeminiImage(currentSlideIndex)}
                                disabled={generatingSlideImages[currentSlideIndex]}
                                className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                                id={`btn-generate-gemini-slide-${currentSlideIndex}`}
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>{currentSlide.isGeminiGenerated ? 'Regenerate' : 'Generate'}</span>
                              </button>
                            </div>
                          </div>

                          {/* Inline Custom Prompt Editor for this slide */}
                          {editingPromptSlideIdx === currentSlideIndex && (
                            <div className="pt-2 border-t border-current/10 space-y-2 animate-fadeIn">
                              <label className="text-[9px] font-bold uppercase tracking-wider text-current/60 block">
                                Visual Prompt for Slide {currentSlide.slideNumber}
                              </label>
                              <textarea
                                value={customSlidePromptInput}
                                onChange={(e) => setCustomSlidePromptInput(e.target.value)}
                                rows={2}
                                className="w-full text-xs p-2 rounded-lg bg-white dark:bg-black/40 border border-current/15 font-mono focus:outline-none focus:border-[#A67C52] resize-y"
                                placeholder="Describe what Gemini should visualize for this slide..."
                              />
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => handleGenerateGeminiImage(currentSlideIndex, customSlidePromptInput)}
                                  disabled={generatingSlideImages[currentSlideIndex]}
                                  className="px-3 py-1 rounded-lg bg-[#A67C52] hover:bg-[#8F6640] text-white text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                >
                                  <Sparkles className="w-3 h-3" />
                                  <span>Generate with Custom Prompt</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Takeaway Box Callout */}
                  {currentSlide.keyTakeawayBox && (
                    <div className="mt-3 p-3 rounded-xl bg-black/5 border border-current/10 text-xs font-serif italic flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#A67C52] flex-shrink-0" />
                      <span className="truncate">{currentSlide.keyTakeawayBox}</span>
                    </div>
                  )}
                </div>

                {/* Slide Footer */}
                <div className="mt-4 pt-3 border-t border-current/10 flex items-center justify-between text-[10px] uppercase tracking-widest opacity-50">
                  <span>Audience: {deck?.audience}</span>
                  <span>Slide {currentSlideIndex + 1} of {deck?.slides.length}</span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Speaker Talking Points Sidebar */}
          {showSpeakerNotes && (
            <div className={`lg:col-span-4 ${currentThemeConfig.sidebarBg} rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between h-full border`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-current/10 pb-3">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#A67C52] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#A67C52]" />
                    Presenter Speaker Script
                  </span>
                  <span className="text-[9px] uppercase tracking-wider font-bold opacity-50">
                    Talking Points
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-black/5 border border-current/10 text-xs sm:text-sm leading-relaxed whitespace-pre-line min-h-[200px] font-sans">
                  {currentSlide?.speakerNotes || 'No speaker script generated for this slide.'}
                </div>
              </div>

              {/* Speaker Controls & Keyboard Shortcuts */}
              <div className="p-3.5 rounded-xl bg-[#A67C52]/5 border border-[#A67C52]/20 text-[10px] text-[#A67C52] space-y-1">
                <p className="font-bold uppercase tracking-wider">Presenter Shortcuts:</p>
                <p>• Press <kbd className="px-1 bg-white border rounded">P</kbd> to launch full PowerPoint mode.</p>
                <p>• Press <kbd className="px-1 bg-white border rounded">←</kbd> or <kbd className="px-1 bg-white border rounded">→</kbd> to navigate.</p>
              </div>
            </div>
          )}
        </div>

        {/* Thumbnail Navigation Strip & Slide Controls */}
        <div className={`p-4 ${currentThemeConfig.footerBg} border-t flex flex-col sm:flex-row items-center justify-between gap-4`}>
          
          {/* Slide Thumbnails */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
            {deck?.slides.map((slide, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer flex-shrink-0 ${
                  currentSlideIndex === idx
                    ? 'bg-[#1A1A1A] text-white shadow-md ring-2 ring-[#A67C52]'
                    : 'bg-white hover:bg-[#1A1A1A]/5 text-[#1A1A1A] border border-[#1A1A1A]/15'
                }`}
              >
                <span className="text-[10px] opacity-60">#{slide.slideNumber}</span>
                <span className="truncate max-w-[100px]">{slide.title}</span>
              </button>
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentSlideIndex(prev => Math.max(prev - 1, 0))}
              disabled={currentSlideIndex === 0}
              className="px-4 py-2 rounded-xl bg-white hover:bg-[#1A1A1A]/5 border border-[#1A1A1A]/20 text-[#1A1A1A] text-xs uppercase font-bold tracking-wider flex items-center gap-1 cursor-pointer disabled:opacity-40"
              id="btn-prev-slide"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-xs font-mono font-bold px-2">
              {currentSlideIndex + 1} / {deck?.slides.length || 6}
            </span>

            <button
              onClick={() => setCurrentSlideIndex(prev => Math.min(prev + 1, (deck?.slides.length || 1) - 1))}
              disabled={!deck || currentSlideIndex === deck.slides.length - 1}
              className="px-4 py-2 rounded-xl bg-[#1A1A1A] hover:bg-[#A67C52] text-white text-xs uppercase font-bold tracking-wider flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-40"
              id="btn-next-slide"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
