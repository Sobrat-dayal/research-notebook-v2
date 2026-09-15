import React, {
  createContext,
  useContext,
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
const Charts = lazy(() => import("./Charts"));
const UiContext = createContext({ error: "", busy: "", toast: "" });
function Markdown({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noreferrer">
            {children}
          </a>
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  );
}
import {
  BookOpen,
  Plus,
  Search,
  ArrowUpRight,
  ArrowLeft,
  Settings,
  Sun,
  Moon,
  X,
  FileText,
  Upload,
  Link,
  Send,
  Sparkles,
  Presentation,
  Download,
  ChevronLeft,
  ChevronRight,
  Play,
  Check,
  LogOut,
  Shield,
  Headphones,
  GitBranch,
  Layers,
  Table2,
  MessageSquare,
  RefreshCw,
  Copy,
  Globe,
  LayoutGrid,
  List,
  MoreHorizontal,
  Quote,
  Trash2,
  LoaderCircle,
  Bookmark,
  StopCircle,
} from "lucide-react";
import { api, download } from "./api";
import {readDocument} from './importing';
import {validateSourceAddition} from '../../shared/sources';
import { exportWord, exportPowerPoint, exportBib } from "./exports";
import type { User, Notebook, Source, Paper, Finding, Deck, Evidence } from "./types";
import "./style.css";
const landmarks = [
  {
    id: "1706.03762",
    title: "Attention Is All You Need",
    authors: "Vaswani et al.",
    year: "2017",
    category: "LANGUAGE & TRANSFORMERS",
    color: "violet",
  },
  {
    id: "1512.03385",
    title: "Deep Residual Learning for Image Recognition",
    authors: "He et al.",
    year: "2015",
    category: "COMPUTER VISION",
    color: "blue",
  },
  {
    id: "2005.14165",
    title: "Language Models are Few-Shot Learners",
    authors: "Brown et al.",
    year: "2020",
    category: "LARGE LANGUAGE MODELS",
    color: "green",
  },
  {
    id: "1810.04805",
    title: "BERT: Pre-training of Deep Bidirectional Transformers",
    authors: "Devlin et al.",
    year: "2018",
    category: "REPRESENTATION LEARNING",
    color: "orange",
  },
];
const toolPrompts: Record<string, string> = {
  "Audio briefing":
    "Write a concise two-speaker audio briefing about the selected research. Separate speaker turns. Include limitations and cite source IDs.",
  "Mind map":
    "Create a concise indented text mind map of the selected sources. Organize research question, methods, findings, and limitations. Cite source IDs.",
  Flashcards:
    "Create 8 question-and-answer flashcards grounded in the selected research. Number each card and cite sources.",
  Quiz: "Create 5 multiple-choice questions grounded in the selected research. Put the answer key after the questions with short explanations.",
  "Math breakdown":
    "Explain the key equations actually present in the sources. Define symbols, intuition, assumptions, and limitations. If no equations are provided, say so.",
  "Compare papers":
    "Compare the selected papers by question, method, datasets, reported findings and limitations. Explain incompatible comparisons and cite source IDs.",
  "Research report":
    "Write a structured research report with an overview, methodology, findings, limitations, and next research questions. Distinguish findings from interpretation and cite sources.",
};
function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ui = useContext(UiContext);
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      className={wide ? "modal wide" : "modal"}
      aria-label={title}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-head">
        <h2>{title}</h2>
        <button className="icon" aria-label="Close" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      {ui.error && (
        <p className="modal-error" role="alert">
          {ui.error}
        </p>
      )}
      {ui.busy && (
        <p className="modal-progress" role="status">
          {ui.busy}…
        </p>
      )}
      {ui.toast && (
        <p className="modal-progress" role="status">
          {ui.toast}
        </p>
      )}
      {children}
    </dialog>
  );
}
function SafeLink({
  href,
  children,
}: {
  href?: string;
  children: React.ReactNode;
}) {
  if (!href || !/^https?:\/\//i.test(href)) return <span>{children}</span>;
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}
export default function App() {
  const [user, setUser] = useState<User | null>(null),
    [ready, setReady] = useState(false),
    [items, setItems] = useState<any[]>([]),
    [n, setN] = useState<Notebook | null>(null),
    [view, setView] = useState("home");
  const [modal, setModal] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(""),
    [toast, setToast] = useState(""),
    [dark, setDark] = useState(
      () => localStorage.getItem("research-theme") === "dark",
    );
  const [query, setQuery] = useState(""),
    [grid, setGrid] = useState(true),
    [sort, setSort] = useState("recent"),
    [tab, setTab] = useState("overview"),
    [mobile, setMobile] = useState("research"),
    [chat, setChat] = useState("");
  const [apiKey, setApiKey] = useState(""),
    [model, setModel] = useState("gemini-3.5-flash-lite"),
    [input, setInput] = useState(""),
    [importType, setImportType] = useState("arxiv"),
    [sourceTitle, setSourceTitle] = useState(""),
    [recovery, setRecovery] = useState("");
  const [authMode, setAuthMode] = useState("login"),
    [selectedSource, setSelectedSource] = useState<Source | null>(null),
    [tool, setTool] = useState(""),
    [toolText, setToolText] = useState(""),
    [prompt, setPrompt] = useState("");
  const [sourceExcerpt,setSourceExcerpt]=useState<Evidence|null>(null);
  const [papers, setPapers] = useState<Paper[]>([]),
    [discoveryMode, setDiscoveryMode] = useState("daily"),
    [discoveryLabel, setDiscoveryLabel] = useState(""),
    [discoveryQuery, setDiscoveryQuery] = useState("");
  const [theme, setTheme] = useState("editorial"),
    [audience, setAudience] = useState("Students"),
    [count, setCount] = useState(7),
    [present, setPresent] = useState(false),
    [slideIndex, setSlideIndex] = useState(0);
  const [adminUsers, setAdminUsers] = useState<User[]>([]),
    [adminQ, setAdminQ] = useState(""),
    [adminSort, setAdminSort] = useState("created"),
    [adminPage, setAdminPage] = useState(0),
    [adminTotal, setAdminTotal] = useState(0),
    [checked, setChecked] = useState<string[]>([]),
    [detail, setDetail] = useState<any>(null);
  const current = useRef<Notebook | null>(null);
  const requestGeneration = useRef(0);
  useEffect(() => {
    current.current = n;
  }, [n]);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("research-theme", dark ? "dark" : "light");
  }, [dark]);
  useEffect(() => {
    api("/auth/me")
      .then((d) => {
        setUser(d.user);
        if (d.user) refreshItems();
      })
      .catch((e) => setError(e.message))
      .finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    if (!present) return;
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPresent(false);
      if (e.key === "ArrowRight")
        setSlideIndex((i) =>
          Math.min((n?.deck?.slides.length || 1) - 1, i + 1),
        );
      if (e.key === "ArrowLeft") setSlideIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [present, n?.deck]);
  async function act(label: string, fn: () => Promise<void>) {
    setBusy(label);
    setError("");
    try {
      await fn();
      return true;
    } catch (e: any) {
      setError(e.message || "Something went wrong. Try again.");
      return false;
    } finally {
      setBusy("");
    }
  }
  async function refreshItems() {
    setItems((await api("/notebooks")).notebooks);
  }
  async function save(next: Notebook) {
    const saved = await api<Notebook>("/notebooks/" + next.id, next, "PUT");
    current.current = saved;
    setN(saved);
    return saved;
  }
  async function openNotebook(id: string) {
    await act("Opening notebook", async () => {
      const notebook = await api<Notebook>("/notebooks/" + id);
      setN(notebook);
      current.current = notebook;
      setView("workspace");
      setTab("overview");
      setMobile("research");
    });
  }
  function requireUser() {
    if (user) return true;
    setModal("auth");
    return false;
  }
  function newImport(type = "arxiv", value = "") {
    if (!requireUser()) return;
    setImportType(type);
    setInput(value);
    setSourceTitle("");
    setModal("import");
  }
  async function importSource(source:Source){
    const existing=view==='workspace'?current.current:null;
    validateSourceAddition(existing?.sources||[],source);
    const saved=await api<Notebook>('/sources',{notebookId:existing?.id,source});
    current.current=saved;setN(saved);setView('workspace');setModal('');setTab('overview');setMobile('research');
    await refreshItems();setToast('Source saved. Generate a summary when you are ready.');return saved;
  }
  async function importArxiv(value: string) {
    await act("Fetching paper from arXiv", async () => {
      const paper = await api<Paper>("/resolve", { input: value });
      await importSource({
        id: crypto.randomUUID(),
        title: paper.title,
        authors: paper.authors,
        text: `${paper.title}\n${paper.authors}\n${paper.abstract}\n${paper.url}`,
        url: paper.url,
        coverage:
          "Abstract only — upload the full PDF for methods, results and equations.",
      });
    });
  }
  async function importFile(file?:File){if(!file)return;await act('Reading your document',async()=>{const source=await readDocument(file,setBusy);setBusy('Saving your source');await importSource(source);});}
  async function generate(kind: string, customPrompt?: string) {
    const notebook = current.current;
    if (!notebook) return;
    const token = ++requestGeneration.current;
    await act(
      kind === "summary"
        ? "Reading your selected sources"
        : kind === "deck"
          ? "Building your slides"
          : "Working with your sources",
      async () => {
        const result = await api("/ai", {
          notebookId: notebook.id,
          kind,
          prompt: customPrompt,
          toolName:tool,
          apiKey,
          model,
          theme,
          audience,
          count,
        });
        if (token !== requestGeneration.current) return;
        const latest=current.current;
        if(!latest||latest.id!==notebook.id)return;
        if(result.notebook){current.current=result.notebook;setN(result.notebook);}
        if(kind==='summary')setTab('overview');
        else if(kind==='deck'){setModal('deck');setSlideIndex(0);}
        else if(kind!=='chat')setToolText(result.result);
      },
    );
  }
  async function sendChat(e: React.FormEvent) {
    e.preventDefault();
    if (!chat.trim() || !n) return;
    const text = chat.trim();
    setChat("");
    const saved=await act("Saving question", async () => {
      await save({
        ...current.current!,
        messages: [...current.current!.messages, { role: "user", text }],
      });
    });
    if(saved)await generate("chat", text);else setChat(text);
  }
  async function toggleSource(id: string) {
    if (!n) return;
    await act("Saving source selection", async () => {
      await save({
        ...n,
        selected: n.selected.includes(id)
          ? n.selected.filter((x) => x !== id)
          : [...n.selected, id],
      });
    });
  }
  async function authSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    await act("Signing in securely", async () => {
      const res = await api("/auth/" + authMode, data);
      if (authMode === "recover") {
        setRecovery(res.recoveryCode);
        setAuthMode("login");
        setToast("Password reset. Save your replacement recovery code.");
        return;
      }
      setUser(res.user);
      if (res.recoveryCode) setRecovery(res.recoveryCode);
      else setModal("");
      await refreshItems();
    });
  }
  async function discover(mode = discoveryMode, q = discoveryQuery) {
    if (!requireUser()) return;
    setView("discover");
    setDiscoveryMode(mode);
    await act("Loading research papers", async () => {
      const d = await api(
        "/discover?mode=" + mode + "&q=" + encodeURIComponent(q),
      );
      setPapers(d.papers);
      setDiscoveryLabel(d.source);
    });
  }
  function openTool(name: string) {
    setTool(name);
    setPrompt(
      n?.prompts?.[name] || toolPrompts[name] ||
        `Explain the topic "${name}" in simple language, then provide a technical explanation. Cite selected sources and include a supporting quote.`,
    );
    setToolText(n?.tools[name] || "");
    setModal("tool");
  }
  async function adminLoad(page = adminPage) {
    await act("Loading users", async () => {
      const d = await api(
        `/admin/users?q=${encodeURIComponent(adminQ)}&sort=${adminSort}&page=${page}`,
      );
      setAdminUsers(d.users);
      setAdminTotal(d.total);
      setView("admin");
    });
  }
  async function adminUpdate(status?: string, role?: string, ids = checked) {
    await act("Updating users", async () => {
      await api("/admin/users", { ids, status, role });
      setChecked([]);
    });
    await adminLoad();
  }
  function evidenceList(evidence:Evidence[]=[]){return <div className="evidence-list">{evidence.map((e,i)=><button key={i} className="citation" onClick={()=>{setSelectedSource(n?.sources.find(s=>s.id===e.sourceId)||null);setSourceExcerpt(e);setModal('source');}}><Quote size={13}/>Supporting excerpt{e.page?' · page '+e.page:''}<span>{e.quote}</span></button>)}</div>;}
  function renderFinding(f: Finding, i: number) {
    return (
      <article className="finding" key={i}>
        <h3>{f.title}</h3>
        <p>{f.text}</p>
        {f.evidence ? (
          <button
            className="citation"
            onClick={() => {
              setSelectedSource(
                n!.sources.find((s) => s.id === f.evidence!.sourceId) || null,
              );
              setSourceExcerpt(f.evidence!);
              setModal("source");
            }}
          >
            <Quote size={12} /> Verified excerpt
            {f.evidence.page ? " · page " + f.evidence.page : ""}
            <span>{f.evidence.quote}</span>
          </button>
        ) : (
          <span className="muted small">
            AI synthesis · check against the source
          </span>
        )}
      </article>
    );
  }
  const filtered = items
    .filter((x) =>
      (x.title + " " + x.tags).toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "title"
        ? a.title.localeCompare(b.title)
        : b.updated.localeCompare(a.updated),
    );
  return (
    <UiContext.Provider value={{ error, busy, toast }}>
      <header className="topbar">
        <button
          className="brand"
          onClick={() => {
            setView("home");
            refreshItems().catch(() => {});
          }}
        >
          <span className="brand-mark">
            <BookOpen size={21} />
          </span>
          <span>
            Research<span className="brand-light">Notebook</span>
            <small>VERSION 2</small>
          </span>
        </button>
        <nav>
          <button
            className={view === "home" ? "active" : ""}
            onClick={() => setView("home")}
          >
            My library
          </button>
          <button
            className={view === "discover" ? "active" : ""}
            onClick={() => discover()}
          >
            Discover <ArrowUpRight size={13} />
          </button>
        </nav>
        <div className="top-actions">
          <button
            className="icon"
            aria-label="API settings"
            onClick={() => setModal("settings")}
          >
            <Settings size={19} />
          </button>
          {user ? (
            <>
              <button
                className="avatar"
                title={`${user.name} · ${user.email}`}
                onClick={() => setModal("account")}
              >
                {user.name.slice(0, 1).toUpperCase()}
              </button>
            </>
          ) : (
            <button className="btn small-btn" onClick={() => setModal("auth")}>
              Sign in
            </button>
          )}
        </div>
      </header>
      {error && (
        <div role="alert" className="error-banner">
          <span>{error}</span>
          <button
            className="icon"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={17} />
          </button>
        </div>
      )}
      {toast && (
        <div role="status" className="toast">
          <Check size={17} />
          {toast}
        </div>
      )}
      {busy && (
        <div className="busy" role="status">
          <LoaderCircle size={17} className="spin" />
          {busy}
          {busy.includes("sources") && (
            <button
              onClick={() => {
                requestGeneration.current++;
                setBusy("");
                setToast(
                  "Result will be ignored. The provider request may still finish.",
                );
              }}
            >
              Dismiss
            </button>
          )}
        </div>
      )}
      {!ready ? (
        <main className="library">
          <p>Opening your library…</p>
        </main>
      ) : view === "home" ? (
        <main className="library">
          <div className="page-title">
            <div>
              <span className="eyebrow">YOUR RESEARCH, CONNECTED</span>
              <h1>
                A little more understanding.
                <br />
                <em>A lot less noise.</em>
              </h1>
              <p>Bring a paper. Find the ideas that matter.</p>
            </div>
            <button className="btn primary" onClick={() => newImport()}>
              <Plus size={18} />
              Create notebook
            </button>
          </div>
          <form
            className="quick-import"
            onSubmit={(e) => {
              e.preventDefault();
              if (requireUser()) importArxiv(input);
            }}
          >
            <Link size={20} />
            <input
              aria-label="arXiv URL or identifier"
              placeholder="Paste an arXiv link or paper ID…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button disabled={!!busy || !input.trim()} className="btn primary">
              Import paper <ArrowUpRight size={16} />
            </button>
            <button
              type="button"
              className="btn subtle"
              onClick={() => newImport("file")}
            >
              <Upload size={16} />
              Upload PDF
            </button>
          </form>
          <section>
            <div className="section-title">
              <h2>
                Ideas that changed the field{" "}
                <span className="tag">CURATED</span>
              </h2>
              <button className="text-btn" onClick={() => discover()}>
                Explore papers <ArrowUpRight size={15} />
              </button>
            </div>
            <div className="landmarks">
              {landmarks.map((p, i) => (
                <button
                  className={"landmark " + p.color}
                  key={p.id}
                  onClick={() => {
                    if (requireUser()) importArxiv(p.id);
                  }}
                >
                  <span className="paper-number">
                    0{i + 1}
                    <ArrowUpRight size={17} />
                  </span>
                  <span className="paper-category">{p.category}</span>
                  <h3>{p.title}</h3>
                  <span className="paper-author">
                    {p.authors} · {p.year}
                  </span>
                </button>
              ))}
            </div>
          </section>
          <section className="notebook-section">
            <div className="section-title">
              <h2>
                Your notebooks <span className="count">{items.length}</span>
              </h2>
              <div className="library-controls">
                <div className="search-field">
                  <Search size={16} />
                  <input
                    aria-label="Search notebooks"
                    placeholder="Search notebooks or tags"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <select
                  aria-label="Sort notebooks"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="recent">Recently updated</option>
                  <option value="title">Title A–Z</option>
                </select>
                <button
                  className="icon"
                  aria-label={grid ? "Switch to list" : "Switch to grid"}
                  onClick={() => setGrid(!grid)}
                >
                  {grid ? <List size={19} /> : <LayoutGrid size={19} />}
                </button>
              </div>
            </div>
            <div className={grid ? "notebooks" : "notebooks list-view"}>
              <button className="new-notebook" onClick={() => newImport()}>
                <span>
                  <Plus size={24} />
                </span>
                <strong>Create a new notebook</strong>
                <small>PDF, arXiv or your own notes</small>
              </button>
              {filtered.map((item) => (
                <button
                  className="notebook-card"
                  key={item.id}
                  onClick={() => openNotebook(item.id)}
                >
                  <span className="notebook-icon">
                    <FileText size={23} />
                  </span>
                  <h3>{item.title}</h3>
                  <p>
                    {JSON.parse(item.tags || "[]").join(" · ") ||
                      "Research notebook"}
                  </p>
                  <div>
                    <span>
                      {new Date(item.updated).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <ArrowUpRight size={17} />
                  </div>
                </button>
              ))}
            </div>
            {!items.length && (
              <p className="empty-caption">
                {user
                  ? "Your library starts with your first paper."
                  : "Sign in to keep your sources, conversations and presentations together."}
              </p>
            )}
          </section>
          <footer>
            Built for curiosity. Grounded in your sources.
            <span>Gemini-powered · Free-quota conscious</span>
          </footer>
        </main>
      ) : null}
      {view === "discover" && (
        <main className="library">
          <button className="text-btn" onClick={() => setView("home")}>
            <ArrowLeft size={16} />
            Your library
          </button>
          <div className="page-title compact">
            <div>
              <span className="eyebrow">FOLLOW THE RESEARCH</span>
              <h1>Discover your next idea.</h1>
              <p>Live papers from Hugging Face and arXiv.</p>
            </div>
          </div>
          <div className="discovery-controls">
            <div className="pills">
              {[
                ["daily", "Daily selection"],
                ["recent", "Recent"],
                ["popular", "Popular today"],
              ].map(([v, l]) => (
                <button
                  className={discoveryMode === v ? "active" : ""}
                  key={v}
                  onClick={() => discover(v)}
                >
                  {l}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                discover("search");
              }}
              className="search-field"
            >
              <Search size={17} />
              <input
                placeholder="Search arXiv by topic"
                aria-label="Search arXiv"
                value={discoveryQuery}
                onChange={(e) => setDiscoveryQuery(e.target.value)}
              />
              <button className="text-btn">Search</button>
            </form>
          </div>
          <p className="muted small">
            {discoveryLabel} · Popularity means upvotes within today’s
            selection, not all-time citation impact.
          </p>
          <div className="discovery-list">
            {papers.map((p) => (
              <article key={p.id}>
                <div>
                  <span className="eyebrow">
                    {p.date?.slice(0, 10)}
                    {p.score !== undefined ? " · " + p.score + " upvotes" : ""}
                  </span>
                  <h2>
                    <SafeLink href={p.url}>{p.title}</SafeLink>
                  </h2>
                  <p className="muted small">{p.authors}</p>
                  <p>{p.abstract}</p>
                </div>
                <button
                  className="btn"
                  onClick={() => {
                    setN(null);
                    current.current = null;
                    importArxiv(p.id);
                  }}
                >
                  <Plus size={16} />
                  Import
                </button>
              </article>
            ))}
          </div>
          {!papers.length && !busy && (
            <p>
              No papers loaded. Try a topic search or retry the daily selection.
            </p>
          )}
        </main>
      )}
      {view === "workspace" && n && (
        <>
          <div className="workspace-bar">
            <button
              className="icon"
              aria-label="Back to library"
              onClick={() => {
                setView("home");
                refreshItems();
              }}
            >
              <ArrowLeft size={19} />
            </button>
            <div>
              <h1>{n.title}</h1>
              <span className="small muted">
                <Check size={12} /> Saved · {n.sources.length} sources ·{" "}
                {n.selected.length} selected
              </span>
            </div>
            <button
              className="btn small-btn"
              onClick={() => setModal("export")}
            >
              <Download size={15} />
              Export
            </button>
            <button
              className="icon"
              aria-label="Notebook options"
              onClick={() => setModal("notebook")}
            >
              <MoreHorizontal size={20} />
            </button>
          </div>
          <div className="mobile-tabs">
            {["sources", "research", "studio"].map((t) => (
              <button
                key={t}
                className={mobile === t ? "active" : ""}
                onClick={() => setMobile(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <main className="workspace">
            <aside
              className={
                "sources-column " +
                (mobile === "sources" ? "mobile-active" : "")
              }
            >
              <div className="column-title">
                <h2>Sources</h2>
                <span>{n.sources.length}</span>
              </div>
              <button className="btn add-source" onClick={() => newImport()}>
                <Plus size={16} />
                Add sources
              </button>
              <p className="small muted">Select what your assistant reads.</p>
              <div className="source-list">
                {n.sources.map((s, i) => (
                  <div className="source-row" key={s.id}>
                    <input
                      type="checkbox"
                      aria-label={"Include " + s.title}
                      checked={n.selected.includes(s.id)}
                      disabled={!!busy}
                      onChange={() => toggleSource(s.id)}
                    />
                    <button
                      onClick={() => {
                        setSelectedSource(s);
                        setModal("source");
                      }}
                    >
                      <FileText size={17} />
                      <span>
                        {s.title}
                        <small>
                          Source {i + 1} ·{" "}
                          {s.pages?.length ? `${s.pages.length} pages` : "Text"}
                        </small>
                      </span>
                    </button>
                  </div>
                ))}
              </div>
              <div className="source-note">
                <Shield size={18} />
                <p>
                  Answers use selected sources. Check cited excerpts before
                  relying on a finding.
                </p>
              </div>
            </aside>
            <section
              className={
                "research-column " +
                (mobile === "research" ? "mobile-active" : "")
              }
            >
              <div className="research-tabs">
                <button
                  className={tab === "overview" ? "active" : ""}
                  onClick={() => setTab("overview")}
                >
                  <BookOpen size={16} />
                  Overview
                </button>
                <button
                  className={tab === "chat" ? "active" : ""}
                  onClick={() => setTab("chat")}
                >
                  <MessageSquare size={16} />
                  Discussion <span>{n.messages.length}</span>
                </button>
                <button
                  className={tab === "references" ? "active" : ""}
                  onClick={() => setTab("references")}
                >
                  References
                </button>
              </div>
              <div className="research-content">
                {tab === "overview" ? (
                  <>
                    {!n.summary ? (
                      <div className="summary-empty">
                        <span className="large-icon">
                          <Sparkles size={28} />
                        </span>
                        <h2>Your sources, made clearer.</h2>
                        <p>
                          Generate a summary of the selected papers, then
                          explore the ideas, evidence and limitations.
                        </p>
                        <button
                          disabled={!!busy || !n.selected.length}
                          className="btn primary"
                          onClick={() => generate("summary")}
                        >
                          <Sparkles size={17} />
                          Generate summary
                        </button>
                        <p className="small muted">
                          {n.sources.some((s) =>
                            s.coverage.startsWith("Abstract"),
                          )
                            ? "An arXiv import contains the abstract. Add the full PDF for a deeper analysis."
                            : "Your original extracted text remains available in Sources."}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="summary-top">
                          <span className="eyebrow">RESEARCH OVERVIEW</span>
                          <button
                            className="text-btn"
                            disabled={!!busy}
                            onClick={() => generate("summary")}
                          >
                            <RefreshCw size={14} />
                            Regenerate
                          </button>
                        </div>
                        {n.summarySourceIds&&JSON.stringify([...n.summarySourceIds].sort())!==JSON.stringify([...n.selected].sort())&&<p className="coverage">Source selection has changed since this summary. Regenerate to use the current selection.</p>}
                        {n.summaryCoverage?.some(c=>c.truncated)&&<p className="coverage">This analysis used excerpts because the sources exceed the request limit. {n.summaryCoverage.filter(c=>c.truncated).map(c=>c.title+': '+c.charactersRead.toLocaleString()+' of '+c.totalCharacters.toLocaleString()+' characters').join('; ')}.</p>}
                        <h2 className="summary-title">{n.summary.title}</h2>
                        <p className="overview-text">{n.summary.overview}</p>
                        {(
                          [
                            "contributions",
                            "methodology",
                            "results",
                            "limitations",
                            "implications",
                          ] as const
                        ).map((key) => (
                          <section className="finding-section" key={key}>
                            <h2>
                              {key === "implications"
                                ? "Interpretation & implications"
                                : key[0].toUpperCase() + key.slice(1)}
                            </h2>
                            {n.summary![key].length ? (
                              n.summary![key].map(renderFinding)
                            ) : (
                              <p className="muted">
                                Not established in the supplied sources.
                              </p>
                            )}
                          </section>
                        ))}
                        {!!n.summary.metrics.length && (
                          <section className="finding-section">
                            <h2>Reported numbers</h2>
                            <div className="metrics">
                              {n.summary.metrics.map((m, i) => (
                                <div key={i}>
                                  <strong>
                                    {m.value} <small>{m.unit}</small>
                                  </strong>
                                  <span>{m.label}</span>
                                  <details>
                                    <summary>Source evidence</summary>
                                    {m.quote}
                                  </details>
                                </div>
                              ))}
                            </div>
                          </section>
                        )}
                        {!!n.summary.metrics.length && (
                          <Suspense fallback={<p>Loading chart…</p>}>
                            <Charts metrics={n.summary.metrics} />
                          </Suspense>
                        )}
                        <section className="finding-section">
                          <h2>Explore the concepts</h2>
                          <div className="concepts">
                            {n.summary.glossary.map((g) => (
                              <button
                                key={g.term}
                                title={g.definition}
                                onClick={() => openTool(g.term)}
                              >
                                {g.term}
                                <ArrowUpRight size={13} />
                              </button>
                            ))}
                          </div>
                        </section>
                      </>
                    )}
                  </>
                ) : tab === "references" ? (
                  <>
                    <h2>References & external links</h2>
                    <p className="muted">
                      Only source-extracted links are shown. Unresolved
                      references have no external link.
                    </p>
                    {n.summary?.references.map((r, i) => (
                      <article className="reference" key={i}>
                        <span>{i + 1}</span>
                        <div>
                          <strong>{r.title}</strong>
                          <p>
                            {r.authors} {r.year}
                          </p>
                          {r.url ? (
                            <SafeLink href={r.url}>Open reference ↗</SafeLink>
                          ) : (
                            <small className="muted">Link not verified</small>
                          )}
                        </div>
                      </article>
                    ))}
                    {!n.summary?.references.length && (
                      <p>
                        Generate a summary from full paper text to extract
                        references.
                      </p>
                    )}
                  </>
                ) : (
                  <div className="chat-messages">
                    {!n.messages.length && (
                      <div className="chat-welcome">
                        <MessageSquare size={32} />
                        <h2>Ask the next question.</h2>
                        <p>
                          Discuss methods, unpack an equation, or question a
                          result.
                        </p>
                        {[
                          "What is the main contribution?",
                          "What are the limitations?",
                          "Explain the methodology simply.",
                        ].map((q) => (
                          <button key={q} onClick={() => setChat(q)}>
                            {q}
                            <ArrowUpRight size={14} />
                          </button>
                        ))}
                      </div>
                    )}
                    {n.messages.map((m, i) => (
                      <article className={"message " + m.role} key={i}>
                        <span>
                          {m.role === "user" ? "YOU" : "RESEARCH ASSISTANT"}
                        </span>
                        <div className="markdown">
                          <Markdown text={m.text} />
                              {evidenceList(m.evidence)}
                        </div>
                        {m.role === "assistant" && (
                          <button
                            className="text-btn"
                            onClick={() =>
                              act("Saving note", async () => {
                                await save({
                                  ...n,
                                  notes: [
                                    ...n.notes,
                                    {
                                      id: crypto.randomUUID(),
                                      text: m.text,
                                      created: new Date().toISOString(),
                                    },
                                  ],
                                });
                                setToast("Saved to notes.");
                              })
                            }
                          >
                            <Bookmark size={13} />
                            Save to note
                          </button>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </div>
              {tab === "chat" && (
                <form className="chat-compose" onSubmit={sendChat}>
                  <textarea
                    aria-label="Ask about your sources"
                    placeholder="Ask a question about your sources…"
                    value={chat}
                    onChange={(e) => setChat(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        e.currentTarget.form?.requestSubmit();
                      }
                    }}
                  />
                  <div>
                    <span>{n.selected.length} sources selected</span>
                    <button
                      className="send"
                      disabled={!!busy || !chat.trim() || !n.selected.length}
                      aria-label="Send question"
                    >
                      <Send size={17} />
                    </button>
                  </div>
                </form>
              )}
            </section>
            <aside
              className={
                "studio-column " + (mobile === "studio" ? "mobile-active" : "")
              }
            >
              <div className="column-title">
                <h2>Studio</h2>
                <Sparkles size={17} />
              </div>
              <p className="small muted">Make something from what you learn.</p>
              <div className="studio-grid">
                {[
                  { name: "Slide deck", icon: Presentation, color: "amber" },
                  { name: "Audio briefing", icon: Headphones, color: "purple" },
                  { name: "Mind map", icon: GitBranch, color: "rose" },
                  { name: "Math breakdown", icon: Layers, color: "blue" },
                  { name: "Flashcards", icon: Copy, color: "orange" },
                  { name: "Quiz", icon: MessageSquare, color: "cyan" },
                  { name: "Research report", icon: FileText, color: "green" },
                  { name: "Compare papers", icon: Table2, color: "teal" },
                ].map((t) => (
                  <button
                    key={t.name}
                    className={"studio-tool " + t.color}
                    onClick={() =>
                      t.name === "Slide deck"
                        ? setModal(n.deck ? "deck" : "deck-setup")
                        : openTool(t.name)
                    }
                  >
                    <t.icon size={20} />
                    <strong>{t.name}</strong>
                    {(t.name === "Slide deck" ? n.deck : n.tools[t.name]) && (
                      <Check className="tool-check" size={13} />
                    )}
                  </button>
                ))}
              </div>
              <div className="notes-heading">
                <h3>Saved notes</h3>
                <button
                  className="icon"
                  aria-label="Add a note"
                  onClick={() => {
                    setToolText("");
                    setModal("note");
                  }}
                >
                  <Plus size={17} />
                </button>
              </div>
              {n.notes.length ? (
                n.notes.map((note) => (
                  <button
                    className="saved-note"
                    key={note.id}
                    onClick={() => {
                      setTool("Saved note");
                      setToolText(note.text);
                      setModal("read-note");
                    }}
                  >
                    <FileText size={17} />
                    <span>{note.text.slice(0, 110)}</span>
                  </button>
                ))
              ) : (
                <div className="empty-notes">
                  <Bookmark size={22} />
                  <p>
                    Your useful thoughts
                    <br />
                    belong here.
                  </p>
                </div>
              )}
              <button
                className="btn add-source"
                onClick={() => {
                  setToolText("");
                  setModal("note");
                }}
              >
                <Plus size={16} />
                Add note
              </button>
            </aside>
          </main>
        </>
      )}
      {view === "admin" && (
        <main className="library">
          <div className="section-title">
            <h1>User management</h1>
            <span className="tag">
              {user?.role === "viewer" ? "READ ONLY" : "ADMINISTRATOR"}
            </span>
          </div>
          <form
            className="admin-controls"
            onSubmit={(e) => {
              e.preventDefault();
              setAdminPage(0);
              adminLoad(0);
            }}
          >
            <input
              placeholder="Search name or email"
              aria-label="Search users"
              value={adminQ}
              onChange={(e) => setAdminQ(e.target.value)}
            />
            <select
              aria-label="Sort users"
              value={adminSort}
              onChange={(e) => setAdminSort(e.target.value)}
            >
              {["created", "name", "email", "role", "status", "last_login"].map(
                (x) => (
                  <option key={x}>{x}</option>
                ),
              )}
            </select>
            <button className="btn">Search</button>
          </form>
          {user?.role === "admin" && (
            <div className="admin-controls">
              <span>{checked.length} selected</span>
              <button
                className="btn"
                disabled={!checked.length}
                onClick={() => adminUpdate("suspended")}
              >
                Suspend selected
              </button>
              <button
                className="btn"
                disabled={!checked.length}
                onClick={() => adminUpdate("active")}
              >
                Activate selected
              </button>
            </div>
          )}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {[
                    "",
                    "Name",
                    "Email",
                    "Role",
                    "Status",
                    "Created",
                    "Last login",
                  ].map((h, i) => (
                    <th key={i}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {adminUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <input
                        type="checkbox"
                        aria-label={"Select " + u.name}
                        disabled={user?.role !== "admin" || u.id === user.id}
                        checked={checked.includes(u.id)}
                        onChange={() =>
                          setChecked(
                            checked.includes(u.id)
                              ? checked.filter((id) => id !== u.id)
                              : [...checked, u.id],
                          )
                        }
                      />
                    </td>
                    <td>
                      <button
                        className="text-btn"
                        onClick={() =>
                          act("Loading profile", async () => {
                            setDetail(await api("/admin/users/" + u.id));
                            setModal("user-detail");
                          })
                        }
                      >
                        {u.name}
                      </button>
                    </td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>{u.status}</td>
                    <td>{u.created.slice(0, 10)}</td>
                    <td>{u.last_login.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="admin-controls">
            <button
              className="btn"
              disabled={!adminPage}
              onClick={() => {
                setAdminPage(adminPage - 1);
                adminLoad(adminPage - 1);
              }}
            >
              Previous
            </button>
            <span>
              {adminPage + 1} · {adminTotal} users
            </span>
            <button
              className="btn"
              disabled={(adminPage + 1) * 20 >= adminTotal}
              onClick={() => {
                setAdminPage(adminPage + 1);
                adminLoad(adminPage + 1);
              }}
            >
              Next
            </button>
          </div>
        </main>
      )}
      <button
        className="theme-toggle"
        aria-label="Toggle light and dark mode"
        title="Change appearance"
        onClick={() => setDark(!dark)}
      >
        {dark ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      {modal === "auth" && (
        <Modal
          title={
            recovery
              ? "Save your recovery code"
              : authMode === "signup"
                ? "Create your research account"
                : authMode === "recover"
                  ? "Recover your account"
                  : "Welcome back"
          }
          onClose={() => {
            setModal("");
            setRecovery("");
          }}
        >
          {recovery ? (
            <div className="form-stack">
              <p>
                Store this code somewhere safe. It can reset your password
                without an email service. It is shown only now.
              </p>
              <code className="recovery">{recovery}</code>
              <button
                className="btn primary"
                onClick={() =>
                  download(
                    new Blob([recovery], { type: "text/plain" }),
                    "research-notebook-recovery.txt",
                  )
                }
              >
                Download recovery code
              </button>
              <button
                className="btn"
                onClick={() => {
                  setRecovery("");
                  if (user) setModal("");
                }}
              >
                I saved my code
              </button>
            </div>
          ) : (
            <form onSubmit={authSubmit} className="form-stack">
              {authMode === "signup" && (
                <label>
                  Name
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    maxLength={80}
                  />
                </label>
              )}
              <label>
                Email
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                />
              </label>
              <label>
                {authMode === "recover" ? "New password" : "Password"}
                <input
                  type="password"
                  name="password"
                  autoComplete={
                    authMode === "login" ? "current-password" : "new-password"
                  }
                  required
                  minLength={10}
                />
                <small>At least 10 characters</small>
              </label>
              {authMode === "recover" && (
                <label>
                  Recovery code
                  <input name="recoveryCode" required autoComplete="off" />
                </label>
              )}
              <button className="btn primary" disabled={!!busy}>
                {authMode === "login"
                  ? "Sign in"
                  : authMode === "signup"
                    ? "Create account"
                    : "Reset password"}
              </button>
              <div className="auth-links">
                <button
                  type="button"
                  onClick={() =>
                    setAuthMode(authMode === "signup" ? "login" : "signup")
                  }
                >
                  {authMode === "signup"
                    ? "Already have an account?"
                    : "Create an account"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setAuthMode(authMode === "recover" ? "login" : "recover")
                  }
                >
                  {authMode === "recover"
                    ? "Back to sign in"
                    : "Forgot password?"}
                </button>
              </div>
              <p className="small muted">
                Research content is private to your account. Selected source
                text is sent to Google when you request AI assistance.
              </p>
            </form>
          )}
        </Modal>
      )}
      {modal === "settings" && (
        <Modal title="Gemini settings" onClose={() => setModal("")}>
          <div className="form-stack">
            <p>
              The shared connection has a daily limit. You can use your own
              Google key instead. Your entered key stays in memory and is sent
              only with AI requests.
            </p>
            <label>
              Your Gemini API key
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                autoComplete="off"
                placeholder="Optional — use your own quota"
              />
            </label>
            <label>
              Text model
              <select value={model} onChange={(e) => setModel(e.target.value)}>
                <option value="gemini-3.5-flash-lite">
                  Gemini 3.5 Flash Lite · economical
                </option>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                <option value="gemini-3.1-flash-lite">
                  Gemini 3.1 Flash Lite
                </option>
              </select>
            </label>
            <button
              disabled={!user || !!busy}
              className="btn"
              onClick={() =>
                act("Checking Gemini key", async () => {
                  const d = await api("/settings/test", { apiKey });
                  setToast(d.message);
                })
              }
            >
              Test connection
            </button>
            <button
              className="text-btn"
              onClick={() => {
                setApiKey("");
                setToast("Personal key removed from memory.");
              }}
            >
              Remove personal key
            </button>
            <p className="small muted">
              No automatic provider switching. Free quota is controlled by
              Google. Paid image generation is not enabled; presentations use
              editable text and conceptual diagrams.
            </p>
          </div>
        </Modal>
      )}
      {modal === "import" && (
        <Modal title="Add a source" onClose={() => setModal("")}>
          <div className="pills">
            {[
              ["arxiv", "arXiv link"],
              ["file", "Upload PDF"],
              ["text", "Paste text"],
            ].map(([v, l]) => (
              <button
                key={v}
                onClick={() => setImportType(v)}
                className={importType === v ? "active" : ""}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="form-stack">
            {importType === "arxiv" ? (
              <>
                <label>
                  arXiv URL or paper ID
                  <input
                    placeholder="https://arxiv.org/abs/1706.03762"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </label>
                <p className="small muted">
                  Imports the title, authors and abstract. Add the full PDF for
                  complete analysis. For other publishers, upload a downloaded
                  PDF.
                </p>
                <button
                  disabled={!!busy || !input.trim()}
                  className="btn primary"
                  onClick={() => importArxiv(input)}
                >
                  Import paper
                </button>
              </>
            ) : importType === "file" ? (
              <>
                <label className="upload-zone">
                  <Upload size={28} />
                  <strong>Choose a PDF or text file</strong>
                  <span>Up to 12 MB · 120 pages</span>
                  <input
                    type="file"
                    accept=".pdf,.txt,.md"
                    disabled={!!busy}
                    onChange={(e) => importFile(e.target.files?.[0])}
                  />
                </label>
                <p className="small muted">
                  PDF text is extracted on your device. Scanned PDFs need OCR
                  first. Extracted text is saved to your private notebook.
                </p>
              </>
            ) : (
              <>
                <label>
                  Source title
                  <input
                    value={sourceTitle}
                    onChange={(e) => setSourceTitle(e.target.value)}
                    placeholder="Give this source a name"
                  />
                </label>
                <label>
                  Source text
                  <textarea
                    rows={9}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Paste research text or your own notes…"
                  />
                </label>
                <button
                  disabled={!!busy || !input.trim() || !sourceTitle.trim()}
                  className="btn primary"
                  onClick={() =>
                    act("Saving source", async () => {
                      await importSource({
                        id: crypto.randomUUID(),
                        title: sourceTitle,
                        text: input,
                        coverage: "User-provided text",
                      });
                    })
                  }
                >
                  Save source
                </button>
              </>
            )}
          </div>
        </Modal>
      )}
      {modal === "source" && selectedSource && (
        <Modal wide title={selectedSource.title} onClose={() => setModal("")}>
          <p className="coverage">{selectedSource.coverage}</p>
          <p className="small muted">Source ID: {selectedSource.id}</p>
          {selectedSource.url && (
            <SafeLink href={selectedSource.url}>Open original paper ↗</SafeLink>
          )}
          {sourceExcerpt?.sourceId===selectedSource.id&&<section className="selected-excerpt"><h3>Supporting passage{sourceExcerpt.page?' · page '+sourceExcerpt.page:''}</h3><blockquote>{sourceExcerpt.quote}</blockquote></section>}
          <div className="source-text">{selectedSource.pages?.length?selectedSource.pages.map(p=><section key={p.page}><h3>Page {p.page}</h3><p>{p.text||'No readable text on this page.'}</p></section>):selectedSource.text}</div>
        </Modal>
      )}
      {modal === "tool" && (
        <Modal wide title={tool} onClose={() => setModal("")}>
          <details className="prompt-editor">
            <summary>Prompt · view and edit</summary>
            <textarea
              aria-label="Generation prompt"
              rows={5}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              className="text-btn"
              onClick={() =>
                setPrompt(
                  toolPrompts[tool] ||
                    `Explain ${tool} from the selected sources with supporting quotes.`,
                )
              }
            >
              Reset prompt
            </button>
          </details>
          <button
            className="btn primary"
            disabled={!!busy}
            onClick={() => generate("tool", prompt)}
          >
            <Sparkles size={16} />
            {toolText ? "Regenerate" : "Generate"}
          </button>
          {toolText && (
            <>
              <div className="tool-result markdown">
                <Markdown text={toolText} />
                {evidenceList(n?.toolEvidence?.[tool])}
              </div>
              <div className="modal-actions">
                <button
                  className="btn"
                  onClick={() =>
                    act("Saving note", async () => {
                      await save({
                        ...n!,
                        notes: [
                          ...n!.notes,
                          {
                            id: crypto.randomUUID(),
                            text: toolText,
                            created: new Date().toISOString(),
                          },
                        ],
                      });
                      setToast("Saved to notebook.");
                    })
                  }
                >
                  <Bookmark size={15} />
                  Save to note
                </button>
                {tool === "Audio briefing" && (
                  <>
                    <button
                      className="btn"
                      onClick={() => {
                        if (!("speechSynthesis" in window)) {
                          setError(
                            "This browser does not support text-to-speech.",
                          );
                          return;
                        }
                        speechSynthesis.cancel();
                        speechSynthesis.speak(
                          new SpeechSynthesisUtterance(toolText),
                        );
                      }}
                    >
                      <Play size={15} />
                      Read aloud
                    </button>
                    <button
                      className="btn"
                      onClick={() => speechSynthesis.cancel()}
                    >
                      <StopCircle size={15} />
                      Stop
                    </button>
                    <span className="small muted">
                      Uses your device’s voice.
                    </span>
                  </>
                )}
              </div>
            </>
          )}
        </Modal>
      )}
      {modal === "note" && (
        <Modal title="Save a thought" onClose={() => setModal("")}>
          <div className="form-stack">
            <textarea
              rows={8}
              aria-label="Your note"
              value={toolText}
              onChange={(e) => setToolText(e.target.value)}
              placeholder="What would you like to remember?"
            />
            <button
              disabled={!toolText.trim() || !!busy}
              className="btn primary"
              onClick={() =>
                act("Saving note", async () => {
                  await save({
                    ...n!,
                    notes: [
                      ...n!.notes,
                      {
                        id: crypto.randomUUID(),
                        text: toolText,
                        created: new Date().toISOString(),
                      },
                    ],
                  });
                  setModal("");
                })
              }
            >
              Save note
            </button>
          </div>
        </Modal>
      )}
      {modal === "read-note" && (
        <Modal title="Saved note" onClose={() => setModal("")}>
          <div className="tool-result">{toolText}</div>
        </Modal>
      )}
      {modal === "deck-setup" && (
        <Modal
          wide
          title="Shape your presentation"
          onClose={() => setModal("")}
        >
          <p>
            Choose a visual direction. Your slides stay saved with this
            notebook.
          </p>
          <div className="theme-options">
            {["editorial", "midnight", "botanical"].map((t) => (
              <button
                className={
                  "theme-preview " + t + (theme === t ? " selected" : "")
                }
                key={t}
                onClick={() => setTheme(t)}
              >
                <span className="sample-heading">
                  The ideas
                  <br />
                  that matter.
                </span>
                <span className="sample-lines">
                  ━━━
                  <br />
                  ━━━━━
                  <br />
                  ━━━
                </span>
                <strong>
                  {t[0].toUpperCase() + t.slice(1)}{" "}
                  {theme === t && <Check size={15} />}
                </strong>
              </button>
            ))}
          </div>
          <div className="form-stack">
            <label>
              Audience
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              >
                <option>Students</option>
                <option>Researchers</option>
                <option>General audience</option>
                <option>Technical team</option>
              </select>
            </label>
            <label>
              Number of slides
              <input
                type="number"
                min={3}
                max={15}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
              />
            </label>
            <button
              className="btn primary"
              disabled={!!busy}
              onClick={() => generate("deck")}
            >
              <Sparkles size={17} />
              Generate presentation
            </button>
            <p className="small muted">
              Editable slides and diagrams. AI-generated images are disabled to
              avoid paid API requirements.
            </p>
          </div>
        </Modal>
      )}
      {modal === "deck" && n?.deck && (
        <Modal wide title="Your slide deck" onClose={() => setModal("")}>
          <div className="modal-actions">
            <button
              className="btn primary"
              onClick={() => {
                setModal("");
                setPresent(true);
                setSlideIndex(0);
              }}
            >
              <Play size={16} />
              Present
            </button>
            <button
              className="btn"
              onClick={() =>
                act("Exporting PowerPoint", () => exportPowerPoint(n))
              }
            >
              <Download size={15} />
              PowerPoint
            </button>
            <button className="btn" onClick={() => window.print()}>
              Print / PDF
            </button>
            <button className="text-btn" onClick={() => setModal("deck-setup")}>
              New version
            </button>
            {n.previousDeck && (
              <button
                className="text-btn"
                onClick={() =>
                  act("Restoring previous deck", async () => {
                    setSlideIndex(0);
                    await save({
                      ...n,
                      deck: n.previousDeck,
                      previousDeck: n.deck,
                    });
                  })
                }
              >
                Restore previous
              </button>
            )}
          </div>
          {n.deck.sourceIds && JSON.stringify([...n.deck.sourceIds].sort())!==JSON.stringify([...n.selected].sort()) && <p className="small muted">This deck uses an earlier source selection. Generate a new version to use your current selection.</p>}
          {n.deck.coverage?.some(source=>source.truncated) && <p className="small muted">Some sources exceeded the reading limit. Review the source material before presenting.</p>}
          <div className="deck-preview">
            <SlideView deck={n.deck} index={slideIndex} />
          </div>
          <div className="slide-navigation">
            <button
              className="icon"
              aria-label="Previous slide"
              disabled={!slideIndex}
              onClick={() => setSlideIndex(slideIndex - 1)}
            >
              <ChevronLeft />
            </button>
            <span>
              {slideIndex + 1} / {n.deck.slides.length}
            </span>
            <button
              className="icon"
              aria-label="Next slide"
              disabled={slideIndex >= n.deck.slides.length - 1}
              onClick={() => setSlideIndex(slideIndex + 1)}
            >
              <ChevronRight />
            </button>
            <button className="text-btn" onClick={() => setModal("edit-slide")}>
              Edit this slide
            </button>
          </div>
          <details>
            <summary>Speaker notes</summary>
            <p>{n.deck.slides[slideIndex]?.notes}</p>
          </details>
          <details className="slide-transcript">
            <summary>Read slide text</summary>
            <h3>{n.deck.slides[slideIndex]?.title}</h3>
            <ul>{n.deck.slides[slideIndex]?.bullets.map((text,i)=><li key={i}>{text}</li>)}</ul>
            <p>{n.deck.slides[slideIndex]?.visual}</p>
          </details>
          <div className="print-deck">
            {n.deck.slides.map((_, i) => (
              <SlideView key={i} deck={n.deck!} index={i} />
            ))}
          </div>
        </Modal>
      )}
      {modal === "edit-slide" && n?.deck && (
        <Modal title="Edit slide" onClose={() => setModal("deck")}>
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              act("Saving slide", async () => {
                const slides = n.deck!.slides.map((s, i) =>
                  i === slideIndex
                    ? {
                        ...s,
                        title: String(f.get("title")),
                        bullets: String(f.get("bullets"))
                          .split("\n")
                          .filter(Boolean),
                        visual: String(f.get("visual")),
                        notes: String(f.get("notes")),
                      }
                    : s,
                );
                if(slides[slideIndex].bullets.length>4 || slides[slideIndex].bullets.some(b=>b.length>180))throw new Error("Use up to 4 points, each no longer than 180 characters.");
                await save({ ...n, deck: { ...n.deck!, slides } });
                setModal("deck");
              });
            }}
          >
            <label>
              Title
              <input
                name="title" required maxLength={100}
                defaultValue={n.deck.slides[slideIndex].title}
              />
            </label>
            <label>
              Points · up to 4, one per line (180 characters each)
              <textarea
                name="bullets"
                rows={5}
                defaultValue={n.deck.slides[slideIndex].bullets.join("\n")}
              />
            </label>
            <label>
              Concept diagram
              <textarea
                name="visual" maxLength={160}
                defaultValue={n.deck.slides[slideIndex].visual}
              />
            </label>
            <label>
              Speaker notes
              <textarea
                name="notes"
                defaultValue={n.deck.slides[slideIndex].notes}
              />
            </label>
            <button className="btn primary" disabled={!!busy}>
              Save changes
            </button>
          </form>
        </Modal>
      )}
      {present && n?.deck && (
        <div className="present-mode" role="dialog" aria-label="Presentation">
          <SlideView deck={n.deck} index={slideIndex} />
          <div className="present-controls">
            <button
              className="icon"
              aria-label="Previous slide"
              disabled={!slideIndex}
              onClick={() => setSlideIndex(slideIndex - 1)}
            >
              <ChevronLeft />
            </button>
            <span>
              {slideIndex + 1} / {n.deck.slides.length}
            </span>
            <button
              className="icon"
              aria-label="Next slide"
              disabled={slideIndex === n.deck.slides.length - 1}
              onClick={() => setSlideIndex(slideIndex + 1)}
            >
              <ChevronRight />
            </button>
            <button className="btn" onClick={() => setPresent(false)}>
              Exit presentation
            </button>
          </div>
        </div>
      )}
      {modal === "export" && n && (
        <Modal title="Take your research with you" onClose={() => setModal("")}>
          <div className="form-stack">
            <button
              className="btn"
              onClick={() =>
                act("Creating Word document", () => exportWord(n, false))
              }
            >
              <FileText size={17} />
              Summary and notes · Word
            </button>
            <button
              className="btn"
              onClick={() =>
                act("Creating Word document", () => exportWord(n, true))
              }
            >
              <MessageSquare size={17} />
              Include discussion · Word
            </button>
            <button className="btn" onClick={() => exportBib(n)}>
              References · BibTeX
            </button>
            <button
              className="btn"
              onClick={() =>
                download(
                  new Blob([JSON.stringify(n, null, 2)], {
                    type: "application/json",
                  }),
                  "research-notebook.json",
                )
              }
            >
              Complete notebook · JSON backup
            </button>
            {n.deck && (
              <button
                className="btn"
                onClick={() =>
                  act("Exporting PowerPoint", () => exportPowerPoint(n))
                }
              >
                Presentation · PowerPoint
              </button>
            )}
          </div>
        </Modal>
      )}
      {modal === "notebook" && n && (
        <Modal title="Notebook settings" onClose={() => setModal("")}>
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              act("Saving settings", async () => {
                await save({
                  ...n,
                  title: String(data.get("title")),
                  tags: String(data.get("tags"))
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                });
                setModal("");
                refreshItems();
              });
            }}
          >
            <label>
              Title
              <input name="title" defaultValue={n.title} required />
            </label>
            <label>
              Tags · comma separated
              <input name="tags" defaultValue={n.tags.join(", ")} />
            </label>
            <button className="btn primary">Save</button>
            <button
              type="button"
              className="text-btn danger"
              onClick={() => setModal("delete-notebook")}
            >
              Delete notebook
            </button>
          </form>
        </Modal>
      )}
      {modal === "delete-notebook" && n && (
        <Modal title="Delete this notebook" onClose={() => setModal("")}>
          <p>
            This permanently removes the notebook and its saved versions. Export
            a backup first if you want to keep a copy.
          </p>
          <button
            className="btn danger"
            onClick={() =>
              act("Deleting notebook", async () => {
                await api("/notebooks/" + n.id, undefined, "DELETE");
                setN(null);
                current.current = null;
                setModal("");
                setView("home");
                await refreshItems();
              })
            }
          >
            Delete permanently
          </button>
        </Modal>
      )}
      {modal === "account" && user && (
        <Modal title={user.name} onClose={() => setModal("")}>
          <div className="form-stack">
            <p>{user.email}</p>
            <p className="small muted">Account ID: {user.id}</p>
            <span className="tag">
              {user.role} · {user.tier}
            </span>
            {["admin", "viewer"].includes(user.role) && (
              <button
                className="btn"
                onClick={() => {
                  setModal("");
                  adminLoad();
                }}
              >
                <Shield size={16} />
                User management
              </button>
            )}
            <button
              className="btn"
              onClick={() =>
                act("Signing out", async () => {
                  await api("/auth/logout", {});
                  setUser(null);
                  setN(null);
                  current.current = null;
                  setItems([]);
                  setApiKey("");
                  setModal("");
                  setView("home");
                })
              }
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </Modal>
      )}
      {modal === "user-detail" && detail && (
        <Modal title={detail.user.name} onClose={() => setModal("")}>
          <div className="form-stack">
            <p>{detail.user.email}</p>
            <p>
              Role: {detail.user.role} · Status: {detail.user.status} · Tier:{" "}
              {detail.user.tier}
            </p>
            <p>
              Created {detail.user.created} · Last login{" "}
              {detail.user.last_login}
            </p>
            {user?.role === "admin" && detail.user.id !== user.id && (
              <label>
                Change role
                <select
                  defaultValue={detail.user.role}
                  onChange={(e) =>
                    adminUpdate(undefined, e.target.value, [detail.user.id])
                  }
                >
                  <option>member</option>
                  <option>viewer</option>
                  <option>admin</option>
                </select>
              </label>
            )}
            <h3>Activity log</h3>
            {detail.activity.length ? (
              detail.activity.map((a: any) => (
                <p key={a.id}>
                  {a.created} · {a.action}
                </p>
              ))
            ) : (
              <p>No administrative changes recorded.</p>
            )}
          </div>
        </Modal>
      )}
    </UiContext.Provider>
  );
}
function SlideView({ deck, index }: { deck: Deck; index: number }) {
  const s = deck.slides[index];
  if (!s) return null;
  return (
    <article className={"slide " + deck.theme}>
      <span className="slide-eyebrow">
        RESEARCH NOTEBOOK / {String(index + 1).padStart(2, "0")}
      </span>
      <h2>{s.title}</h2>
      <div className="slide-body">
        <ul>
          {s.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
        <div className="slide-visual">
          <GitBranch size={28} />
          <p>{s.visual}</p>
          <small>CONCEPTUAL OVERVIEW</small>
        </div>
      </div>
      <div className="slide-footer">
        <span>{deck.title}</span>
        <span>
          {index + 1} / {deck.slides.length}
        </span>
      </div>
    </article>
  );
}
