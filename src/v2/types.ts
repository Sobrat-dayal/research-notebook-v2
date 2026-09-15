export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  tier: string;
  created: string;
  last_login: string;
};
export type Source = {
  id: string;
  title: string;
  text: string;
  url?: string;
  authors?: string;
  coverage: string;
  pages?: { page: number; text: string }[];
};
export type Evidence = { sourceId: string; quote: string; page?: number };
export type Finding = { title: string; text: string; evidence?: Evidence };
export type Summary = {
  title: string;
  overview: string;
  contributions: Finding[];
  methodology: Finding[];
  results: Finding[];
  limitations: Finding[];
  implications: Finding[];
  glossary: { term: string; definition: string }[];
  references: {
    title: string;
    authors?: string;
    year?: string;
    url?: string;
  }[];
  metrics: {
    label: string;
    value: number;
    unit: string;
    quote: string;
    sourceId: string;
  }[];
};
export type Slide = {
  id: string;
  title: string;
  bullets: string[];
  notes: string;
  visual: string;
  image?: string;
};
export type Deck = {
  sourceIds?: string[];
  coverage?: Notebook["summaryCoverage"];
  title: string;
  theme: string;
  audience: string;
  slides: Slide[];
};
export type Notebook = {
  id: string;
  title: string;
  revision: number;
  updated: string;
  tags: string[];
  sources: Source[];
  selected: string[];
  summary?: Summary;
  summarySourceIds?: string[];
  summaryCoverage?: {title:string;truncated:boolean;charactersRead:number;totalCharacters:number;coverage:string}[];
  prompts?: Record<string,string>;
  toolEvidence?: Record<string,Evidence[]>;
  messages: { role: "user" | "assistant"; text: string; evidence?:Evidence[]; sourceIds?:string[] }[];
  notes: { id: string; text: string; created: string }[];
  deck?: Deck;
  previousDeck?: Deck;
  tools: Record<string, string>;
  job?: { kind: string; status: string; started: string };
};
export type Paper = {
  id: string;
  title: string;
  authors: string;
  abstract: string;
  url: string;
  date?: string;
  score?: number;
};
