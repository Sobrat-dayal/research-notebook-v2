export interface KeyTakeaway {
  category: 'Methodology' | 'Finding' | 'Innovation' | 'Limitation' | 'Impact';
  title: string;
  description: string;
}

export interface ActionableInsight {
  targetAudience: 'Researchers' | 'Engineers & Developers' | 'Product & Business' | 'Policy & Strategy';
  recommendation: string;
  impactLevel: 'Critical' | 'High' | 'Medium';
}

export interface KeyMetric {
  label: string;
  value: string;
  baseline?: string;
  improvement?: string;
  description: string;
}

export interface PipelineStep {
  stepNumber: number;
  name: string;
  description: string;
  keyTechnique?: string;
}

export interface ChartDataItem {
  name: string;
  [key: string]: string | number;
}

export interface ChartData {
  id: string;
  chartTitle: string;
  chartType: 'bar' | 'line' | 'radar' | 'pie' | 'area';
  xAxisLabel?: string;
  yAxisLabel?: string;
  description: string;
  dataKeys: string[];
  data: ChartDataItem[];
}

export interface GlossaryItem {
  term: string;
  definition: string;
}

export interface ReferenceItem {
  id: string;
  authors: string;
  title: string;
  venue?: string;
  year?: string;
  url?: string;
  doi?: string;
}

export interface PaperTopic {
  id: string;
  topicName: string;
  category: string; // e.g. 'Core Innovation' | 'Methodology' | 'Empirical Result' | 'Domain Application'
  shortSummary: string;
}

export interface TopicExplanation {
  topicName: string;
  simpleExplanation: string;
  technicalDeepDive: string;
  importanceInPaper: string;
  relatedConcepts: string[];
}

export interface FormulaVariable {
  symbol: string;
  meaning: string;
  intuition: string;
  dimensions?: string;
}

export interface FormulaItem {
  id: string;
  name: string;
  latex: string;
  description: string;
  variables: FormulaVariable[];
  intuitionKey?: string;
}

export interface CitationNetworkNode {
  id: string;
  title: string;
  authors: string;
  year: string;
  citationsCount: number;
  type: 'foundation' | 'target' | 'descendant' | 'competitor';
  relevanceScore: number; // 0 - 100
  keyContribution: string;
}

export interface TradeoffRow {
  dimension: string;
  paperAValue: string;
  paperBValue: string;
  advantage?: 'A' | 'B' | 'Balanced';
  notes: string;
}

export interface ComparativeSynthesis {
  paperA: { id: string; title: string; authors: string; year: string; field: string };
  paperB: { id: string; title: string; authors: string; year: string; field: string };
  overview: string;
  tradeoffMatrix: TradeoffRow[];
  architecturalDifferences: string[];
  recommendedUseCases: { paperA: string[]; paperB: string[] };
  empiricalVerdict: string;
}

export interface AudioBriefingSegment {
  id: string;
  speaker: 'Sarah' | 'Alex';
  role: string;
  text: string;
  timestamp: string;
}

export interface AudioBriefingChapter {
  id: string;
  chapterTitle: string;
  durationSeconds: number;
  segments: AudioBriefingSegment[];
}

export interface ResearchNote {
  id: string;
  paperTitle: string;
  highlightText?: string;
  userNote: string;
  tags: string[];
  createdAt: string;
}

export interface PaperSummary {
  title: string;
  authors: string[];
  institution: string;
  publicationYear: string;
  field: string;
  tldr: string;
  executiveSummary: string;
  topics?: PaperTopic[];
  keyTakeaways: KeyTakeaway[];
  actionableInsights: ActionableInsight[];
  keyMetrics: KeyMetric[];
  pipelineSteps: PipelineStep[];
  charts: ChartData[];
  glossary: GlossaryItem[];
  references?: ReferenceItem[];
  citation: string;
  formulas?: FormulaItem[];
  citationNodes?: CitationNetworkNode[];
}

export interface PresetPaper {
  id: string;
  title: string;
  authors: string;
  year: string;
  field: string;
  badge: string;
  abstractSnippet: string;
  fullText: string;
  preCalculatedSummary?: PaperSummary;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export type ApiProvider = 'google' | 'openai' | 'anthropic' | 'deepseek' | 'groq' | 'custom';

export interface ApiConfig {
  provider: ApiProvider;
  apiKey: string;
  modelName: string;
  baseUrl?: string;
}

export interface SlideItem {
  slideNumber: number;
  title: string;
  subtitle?: string;
  layoutType: 'title' | 'split-image' | 'split-points' | 'metric-highlight' | 'comparison' | 'timeline' | 'summary';
  bulletPoints: string[];
  speakerNotes: string;
  imageUrl?: string;
  imagePrompt?: string;
  imageCaption?: string;
  isGeminiGenerated?: boolean;
  imageModelUsed?: string;
  imageError?: string;
  keyHighlights?: string[];
  accentMetric?: {
    value: string;
    label: string;
  };
  keyTakeawayBox?: string;
}

export interface PresentationDeck {
  deckTitle: string;
  paperTitle: string;
  audience: string;
  totalSlides: number;
  slides: SlideItem[];
}

