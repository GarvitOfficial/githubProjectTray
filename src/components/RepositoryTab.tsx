import React, { useState } from "react";
import { 
  Book, 
  CheckCircle2, 
  XCircle, 
  Star, 
  GitFork, 
  AlertCircle, 
  Copy, 
  ExternalLink, 
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface Repository {
  id: string;
  name: string;
  description: string;
  language: string;
  languageColor: string;
  stars: number;
  forks: number;
  openIssues: number;
  comments: number;
  buildStatus: "success" | "failed" | "running";
  isPinned: boolean;
  cloneUrl: string;
  githubUrl: string;
}

interface RepositoryTabProps {
  repositories: Repository[];
  searchQuery: string;
  selectedLanguage: string;
  sortBy: string;
  onTogglePin?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const RepositoryTab: React.FC<RepositoryTabProps> = ({
  repositories,
  searchQuery,
  selectedLanguage,
  sortBy,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter & Sort logic
  const filteredRepos = repositories
    .filter((repo) => {
      const matchesSearch = repo.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            repo.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLanguage = selectedLanguage === "All" || repo.language === selectedLanguage;
      return matchesSearch && matchesLanguage;
    })
    .sort((a, b) => {
      if (sortBy === "stars") return b.stars - a.stars;
      if (sortBy === "issues") return b.openIssues - a.openIssues;
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="space-y-4">
      {/* List Header */}
      <div className="flex justify-between items-end mb-1 px-1">
        <h1 className="font-geist text-base font-bold tracking-tight text-text-primary">Repositories</h1>
        <span className="font-mono text-[10px] text-text-secondary opacity-80">
          {filteredRepos.length} Active
        </span>
      </div>

      {/* Cards List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredRepos.map((repo) => (
            <motion.div
              layoutId={`repo-card-${repo.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              key={repo.id}
              className="glass-card rounded-lg p-3 flex flex-col gap-2 relative group transition-all duration-300 glow-border"
            >
              {/* Top Row */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 max-w-[70%]">
                  <Book className="w-4.5 h-4.5 text-text-secondary" />
                  <h2 className="font-mono text-xs font-semibold text-text-primary truncate">
                    {repo.name}
                  </h2>
                </div>

                {/* Build Status Badges */}
                <div className="flex items-center gap-1.5">
                  {repo.buildStatus === "success" && (
                    <span className="bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 px-1.5 py-0.5 rounded-full font-geist text-[9px] font-medium tracking-tight flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Success
                    </span>
                  )}
                  {repo.buildStatus === "failed" && (
                    <span className="bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20 px-1.5 py-0.5 rounded-full font-geist text-[9px] font-medium tracking-tight flex items-center gap-1">
                      <XCircle className="w-2.5 h-2.5" />
                      Failed
                    </span>
                  )}
                  {repo.buildStatus === "running" && (
                    <span className="bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20 px-1.5 py-0.5 rounded-full font-geist text-[9px] font-medium tracking-tight flex items-center gap-1 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></span>
                      Running
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="font-sans text-[11px] text-text-secondary leading-relaxed pr-1 line-clamp-2">
                {repo.description}
              </p>

              {/* Repository Metadata */}
              <div className="flex justify-between items-center mt-1 border-t border-surface-border/40 pt-2 text-[10px] font-mono text-text-secondary/80">
                <div className="flex items-center gap-3">
                  {/* Language Badge */}
                  <span className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full border border-[#000000]/10"
                      style={{ backgroundColor: repo.languageColor }}
                    ></span>
                    {repo.language}
                  </span>

                  {/* Stars Count */}
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5" />
                    {repo.stars}
                  </span>

                  {/* Forks Count */}
                  <span className="flex items-center gap-0.5">
                    <GitFork className="w-3.5 h-3.5" />
                    {repo.forks}
                  </span>

                  {/* Issues Count */}
                  {repo.openIssues > 0 && (
                    <span className="flex items-center gap-1 text-status-error font-semibold bg-status-error/5 px-1 rounded">
                      <AlertCircle className="w-3 h-3" />
                      {repo.openIssues}
                    </span>
                  )}
                </div>
              </div>

              {/* Hover Actions Overlay */}
              <div className="absolute inset-0 bg-[#0A0A0A]/95 dark:bg-[#0A0A0A]/95 light:bg-[#FFFFFF]/95 backdrop-blur-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-3">
                <button
                  onClick={() => handleCopy(repo.id, repo.cloneUrl)}
                  className="bg-[#EDEDED] text-black px-3 py-1.5 rounded font-mono text-xs font-semibold flex items-center gap-1.5 hover:bg-white hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer border border-transparent shadow-sm"
                >
                  {copiedId === repo.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-status-success" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Clone URL</span>
                    </>
                  )}
                </button>
                <a
                  href={repo.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-transparent border border-surface-border text-text-primary px-2.5 py-1.5 rounded font-mono text-xs font-semibold flex items-center gap-1 hover:border-text-primary hover:bg-bg-input hover:scale-[1.03] active:scale-[0.97] transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open URL</span>
                </a>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredRepos.length === 0 && (
          <div className="text-center py-8 text-text-secondary font-sans text-xs">
            No matching repositories found.
          </div>
        )}
      </div>
    </div>
  );
};
