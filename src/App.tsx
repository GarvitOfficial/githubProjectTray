import { useState, useEffect, useRef } from "react";
import {
  Search,
  Moon,
  Sun,
  X,
  ChevronDown,
  Code,
  Copy,
  Check,
  LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RepositoryTab } from "./components/RepositoryTab";
import type { Repository } from "./components/RepositoryTab";
import { EmptyState } from "./components/EmptyState";
import { RepositorySkeleton } from "./components/SkeletonLoader";

export default function App() {
  // CONFIGURATION STATES
  const [connectedUsername, setConnectedUsername] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [sortBy, setSortBy] = useState("stars");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [repos, setRepos] = useState<Repository[]>([]);

  // EMBED CONFIGURATOR STATES
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [embedTheme, setEmbedTheme] = useState<"dark" | "light" | "auto">("dark");
  const [embedLayout, setEmbedLayout] = useState<"list" | "grid">("list");
  const [embedLimit, setEmbedLimit] = useState<number>(100);
  const [embedSort, setEmbedSort] = useState<"stars" | "issues" | "name">("stars");
  const [copiedCode, setCopiedCode] = useState(false);

  // WIDGET MODE STATES
  const [isWidgetMode, setIsWidgetMode] = useState(false);

  // DOM REFS
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Parse URL parameters on initialization
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userParam = params.get("user") || params.get("username");
    const themeParam = params.get("theme");
    const layoutParam = params.get("layout");
    const limitParam = params.get("limit");
    const sortParam = params.get("sort");

    // Force theme aligned with URL params
    if (themeParam === "light") {
      setIsDarkMode(false);
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else if (themeParam === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      // Default browser preferences or dark
      document.documentElement.classList.add("dark");
    }

    if (layoutParam === "grid") {
      setEmbedLayout("grid");
    }

    if (limitParam) {
      setEmbedLimit(limitParam === "max" ? 100 : parseInt(limitParam, 10));
    }

    if (sortParam) {
      setSortBy(sortParam);
    }

    if (userParam) {
      setIsWidgetMode(true);
      setConnectedUsername(userParam);
      fetchGitHubRepos(userParam, sortParam || "stars");
    } else {
      // Configurator Mode: check localStorage for saved sessions
      const savedUser = localStorage.getItem("config_connected_username");
      if (savedUser) {
        setConnectedUsername(savedUser);
        fetchGitHubRepos(savedUser);
      }
    }
  }, []);

  // Keyboard Hotkey (Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch Public Repositories (no auth / 100% free)
  const fetchGitHubRepos = async (username: string, initialSort?: string) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const sanitized = encodeURIComponent(username.trim());
      const res = await fetch(`https://api.github.com/users/${sanitized}/repos?sort=updated&per_page=100`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("GitHub profile not found. Check spelling.");
        } else if (res.status === 403) {
          throw new Error("GitHub API Rate Limit exceeded (60 requests/hour limit for unauthenticated IPs). Please try again later.");
        } else {
          throw new Error("Failed to load repositories from GitHub.");
        }
      }
      const rawRepos = await res.json();

      const langColors: Record<string, string> = {
        TypeScript: "#3178c6",
        JavaScript: "#f1e05a",
        Rust: "#dea584",
        Go: "#00add8",
        Python: "#3572A5",
        CSS: "#563d7c",
        HTML: "#e34c26",
        Ruby: "#701516",
        C: "#555555",
        "C++": "#f34b7d",
        "C#": "#178600",
        Java: "#b07219",
        Swift: "#F05138"
      };

      const mapped: Repository[] = rawRepos.map((repo: any) => ({
        id: repo.id.toString(),
        name: repo.name,
        description: repo.description || "No description provided.",
        language: repo.language || "Markdown",
        languageColor: langColors[repo.language] || "#8b90a0",
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        openIssues: repo.open_issues_count,
        comments: 0,
        buildStatus: Math.random() > 0.15 ? "success" : "failed", // CI check simulation
        isPinned: false,
        cloneUrl: repo.clone_url,
        githubUrl: repo.html_url
      }));

      setRepos(mapped);
      if (initialSort) {
        setSortBy(initialSort);
      }
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = (username: string) => {
    setConnectedUsername(username);
    localStorage.setItem("config_connected_username", username);
    fetchGitHubRepos(username);
  };

  const handleDisconnect = () => {
    localStorage.removeItem("config_connected_username");
    setConnectedUsername(null);
    setRepos([]);
    setApiError(null);
  };

  const toggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  };

  // Generate Embed Snippet
  const getEmbedSnippet = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const themeQuery = embedTheme === "auto" ? "" : `&theme=${embedTheme}`;
    const layoutQuery = embedLayout === "grid" ? "&layout=grid" : "";
    const limitQuery = embedLimit === 100 ? "&limit=max" : `&limit=${embedLimit}`;
    const sortQuery = embedSort !== "stars" ? `&sort=${embedSort}` : "";
    const embedUrl = `${baseUrl}?user=${connectedUsername}${themeQuery}${layoutQuery}${limitQuery}${sortQuery}`;

    return `<iframe 
  src="${embedUrl}" 
  width="100%" 
  height="500" 
  style="border: none; border-radius: 8px; background: transparent;" 
  loading="lazy"
></iframe>`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getEmbedSnippet());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Slice repos according to configuration settings
  const displayedRepos = embedLimit === 100 ? repos : repos.slice(0, embedLimit);
  const uniqueLanguages = ["All", ...Array.from(new Set(displayedRepos.map(r => r.language)))];

  // Shell Layout Variables based on widget mode
  const shellClass = isWidgetMode
    ? "w-full h-full min-h-screen flex flex-col relative overflow-y-auto bg-surface-panel"
    : "w-[360px] h-[600px] flex flex-col relative overflow-hidden bg-surface-panel rounded-lg border border-surface-border shadow-2xl";

  return (
    <div className={isWidgetMode ? "w-full h-full" : "min-h-screen flex flex-col items-center justify-center bg-transparent py-4"}>

      {/* Dynamic shell container */}
      <div className={shellClass}>

        {/* Header toolbar */}
        <header className="absolute top-0 left-0 right-0 h-14 bg-surface-panel/85 backdrop-blur-xl border-b border-surface-border flex justify-between items-center px-3 z-30">
          <div className="relative flex items-center bg-bg-input rounded px-2.5 py-1.5 border border-surface-border group focus-within:border-[#0070f3] focus-within:ring-1 focus-within:ring-[#0070f3]/20 transition-all flex-1 mr-3.5">
            <Search className="w-3.5 h-3.5 text-text-secondary opacity-60 mr-1.5 group-focus-within:text-[#0070f3] transition-colors" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={connectedUsername ? "Find repo..." : "Search repositories..."}
              disabled={!connectedUsername}
              className="bg-transparent border-none text-[11px] text-text-primary placeholder-text-secondary/40 focus:ring-0 p-0 w-full font-mono outline-none disabled:opacity-50"
            />
            {connectedUsername && searchQuery === "" && (
              <span className="font-mono text-[9px] text-text-secondary opacity-40 bg-surface-border px-1.5 py-0.5 rounded ml-1 group-focus-within:hidden select-none">
                ⌘K
              </span>
            )}
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-text-secondary/50 hover:text-text-primary p-0.5">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={toggleTheme}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface-border/40 text-text-secondary hover:text-text-primary transition-all cursor-pointer"
              title={isDarkMode ? "Light Mode Preview" : "Dark Mode Preview"}
            >
              {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {connectedUsername && !isWidgetMode && (
              <button
                onClick={() => setShowEmbedModal(true)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface-border/40 text-[#0070f3] hover:text-blue-400 transition-all cursor-pointer"
                title="Get Embed Code"
              >
                <Code className="w-4 h-4" />
              </button>
            )}

            {connectedUsername && !isWidgetMode && (
              <button
                onClick={handleDisconnect}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface-border/40 text-red-400 hover:text-red-300 transition-all cursor-pointer"
                title="Disconnect Profile"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        {/* Sync Progress Line */}
        {isLoading && (
          <div className="absolute top-14 left-0 right-0 h-0.5 bg-surface-panel z-40 overflow-hidden">
            <div className="h-full bg-[#0070f3] animate-[loading_1.5s_ease-in-out_infinite] origin-left w-1/3"></div>
          </div>
        )}

        {/* Scrollable Repo showcase */}
        <main className="flex-grow overflow-y-auto mt-14 px-3 py-3 space-y-3 relative z-10 pb-16">

          {connectedUsername && displayedRepos.length > 0 && !isLoading && (
            <div className="flex justify-between items-center gap-2 pt-1 font-mono text-[10px] text-text-secondary">
              {/* Language filter */}
              <div className="relative flex items-center bg-bg-input border border-surface-border rounded px-2 py-1 flex-1 cursor-pointer">
                <span className="truncate">Lang: {selectedLanguage}</span>
                <ChevronDown className="w-3 h-3 ml-auto opacity-70" />
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                >
                  {uniqueLanguages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              {/* Sort filter */}
              <div className="relative flex items-center bg-bg-input border border-surface-border rounded px-2 py-1 flex-1 cursor-pointer">
                <span className="truncate">Sort: {sortBy}</span>
                <ChevronDown className="w-3 h-3 ml-auto opacity-70" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                >
                  <option value="stars">Stars</option>
                  <option value="issues">Issues</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>
          )}

          {/* Core display */}
          <div className="w-full">
            {isLoading ? (
              <div className="space-y-2 mt-4">
                <RepositorySkeleton />
                <RepositorySkeleton />
                <RepositorySkeleton />
              </div>
            ) : apiError ? (
              <div className="bg-status-error/10 border border-status-error/30 rounded-lg p-4 text-center text-xs text-status-error">
                {apiError}
                {!isWidgetMode && (
                  <button
                    onClick={handleDisconnect}
                    className="mt-3 block mx-auto underline font-mono text-[10px] text-text-primary hover:text-[#0070f3]"
                  >
                    Return to Onboarding
                  </button>
                )}
              </div>
            ) : !connectedUsername ? (
              <EmptyState
                connectedUsername={connectedUsername}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
              />
            ) : (
              <RepositoryTab
                repositories={displayedRepos}
                searchQuery={searchQuery}
                selectedLanguage={selectedLanguage}
                sortBy={sortBy}
              />
            )}
          </div>
        </main>

        {/* Footer/Configurator branding bar (only in configurator mode) */}
        {!isWidgetMode && (
          <div className="h-10 bg-surface-panel/90 border-t border-surface-border flex justify-between items-center px-4.5 text-[10px] font-mono text-text-secondary/50 select-none z-30 mt-auto">
            <span>Configurator Mode</span>
            {connectedUsername && (
              <button
                onClick={() => setShowEmbedModal(true)}
                className="text-[#0070f3] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                Get Embed Link <Code className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* EMBED CODE MODAL GENERATOR */}
      <AnimatePresence>
        {showEmbedModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0A0A0A]/90 backdrop-blur-xs flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 12 }}
              className="bg-surface-panel border border-surface-border rounded-lg shadow-2xl w-full max-w-[310px] p-4 flex flex-col gap-4 text-xs"
            >
              <div className="flex justify-between items-center border-b border-surface-border pb-2">
                <h3 className="font-geist text-sm font-bold text-text-primary tracking-tight">Portfolio Embed Code</h3>
                <button onClick={() => setShowEmbedModal(false)} className="text-text-secondary/60 hover:text-text-primary">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Embedding Configurations options */}
              <div className="space-y-3.5">
                {/* Theme options */}
                <div className="space-y-1">
                  <label className="text-[9px] text-[#8b90a0] font-bold uppercase tracking-wider">Embed Theme</label>
                  <div className="grid grid-cols-3 gap-1 font-mono text-[9px]">
                    {["dark", "light", "auto"].map(t => (
                      <button
                        key={t}
                        onClick={() => setEmbedTheme(t as any)}
                        className={`py-1 border rounded text-center capitalize cursor-pointer ${embedTheme === t
                            ? "bg-[#0070f3]/10 border-[#0070f3] text-[#0070f3] font-semibold"
                            : "border-surface-border text-text-secondary/60 hover:bg-[#1C1B1B]"
                          }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Layout Options */}
                <div className="space-y-1">
                  <label className="text-[9px] text-[#8b90a0] font-bold uppercase tracking-wider">Card Layout</label>
                  <div className="grid grid-cols-2 gap-1 font-mono text-[9px]">
                    {["list", "grid"].map(l => (
                      <button
                        key={l}
                        onClick={() => setEmbedLayout(l as any)}
                        className={`py-1 border rounded text-center capitalize cursor-pointer ${embedLayout === l
                            ? "bg-[#0070f3]/10 border-[#0070f3] text-[#0070f3] font-semibold"
                            : "border-surface-border text-text-secondary/60 hover:bg-[#1C1B1B]"
                          }`}
                      >
                        {l} Layout
                      </button>
                    ))}
                  </div>
                </div>

                {/* Default Sort */}
                <div className="space-y-1">
                  <label className="text-[9px] text-[#8b90a0] font-bold uppercase tracking-wider">Default Sort</label>
                  <div className="grid grid-cols-3 gap-1 font-mono text-[9px]">
                    {["stars", "issues", "name"].map(s => (
                      <button
                        key={s}
                        onClick={() => setEmbedSort(s as any)}
                        className={`py-1 border rounded text-center capitalize cursor-pointer ${embedSort === s
                            ? "bg-[#0070f3]/10 border-[#0070f3] text-[#0070f3] font-semibold"
                            : "border-surface-border text-text-secondary/60 hover:bg-[#1C1B1B]"
                          }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Limit selection */}
                <div className="space-y-1">
                  <label className="text-[9px] text-[#8b90a0] font-bold uppercase tracking-wider flex justify-between">
                    <span>Show Repos count</span>
                    <span className="font-mono text-[#0070f3]">
                      {embedLimit === 100 ? "All Repositories" : `${embedLimit} items`}
                    </span>
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="100"
                    step="1"
                    value={embedLimit}
                    onChange={(e) => setEmbedLimit(parseInt(e.target.value, 10))}
                    className="w-full accent-[#0070f3]"
                  />
                </div>

                {/* Snippet Code block */}
                <div className="space-y-1">
                  <label className="text-[9px] text-[#8b90a0] font-bold uppercase tracking-wider">HTML Snippet</label>
                  <div className="relative bg-bg-input border border-surface-border rounded p-2 text-[10px] font-mono text-text-primary select-all break-all h-24 overflow-y-auto">
                    {getEmbedSnippet()}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 font-mono text-[10px] pt-1">
                <button
                  onClick={() => setShowEmbedModal(false)}
                  className="flex-1 border border-surface-border text-text-secondary py-2 rounded hover:bg-[#1C1B1B] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCopyCode}
                  className="flex-1 bg-[#EDEDED] text-black py-2 rounded font-semibold hover:bg-white flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-status-success" />
                      <span className="text-status-success">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Snippet</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
