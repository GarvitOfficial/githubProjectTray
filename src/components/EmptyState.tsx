import React, { useState } from "react";
import { FolderGit, ArrowRight } from "lucide-react";

interface EmptyStateProps {
  connectedUsername: string | null;
  onConnect: (username: string) => void;
  onDisconnect: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  connectedUsername,
  onConnect,
  onDisconnect,
}) => {
  const [usernameInput, setUsernameInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    onConnect(usernameInput.trim());
  };

  // If already connected, but the repository list is simply empty
  if (connectedUsername) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="relative flex items-center justify-center w-20 h-20 mb-6">
          <div className="absolute inset-0 bg-[#0070f3]/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute w-16 h-16 rounded-full border border-surface-border/40 animate-[spin_15s_linear_infinite]"></div>
          <div className="relative bg-surface-panel w-12 h-12 rounded-xl border border-surface-border flex items-center justify-center z-10">
            <FolderGit className="w-6 h-6 text-text-secondary opacity-80" />
          </div>
        </div>

        <h2 className="font-geist text-base font-semibold text-text-primary tracking-tight">No projects found</h2>
        <p className="font-sans text-xs text-text-secondary max-w-[240px] mt-2 mb-6 leading-relaxed">
          No repositories found for <span className="font-mono text-[#0070f3] font-semibold">{connectedUsername}</span>.
        </p>

        <button
          onClick={onDisconnect}
          className="flex items-center justify-center space-x-1.5 bg-transparent border border-surface-border hover:border-red-500/50 hover:text-red-400 py-1.5 px-4 rounded font-mono text-[10px] text-text-secondary transition-all cursor-pointer"
        >
          <span>Disconnect Profile</span>
        </button>
      </div>
    );
  }

  // Onboarding Login View
  return (
    <div className="flex-grow flex flex-col items-center justify-center py-10 px-4">
      <div className="max-w-[280px] w-full space-y-6">
        {/* Branding header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative flex items-center justify-center w-16 h-16">
            <div className="absolute inset-0 bg-[#0070f3]/10 rounded-full blur-lg"></div>
            <div className="absolute w-14 h-14 rounded-full border border-[#0070f3]/20 animate-pulse"></div>
            <div className="relative bg-surface-panel w-11 h-11 rounded-lg border border-surface-border flex items-center justify-center z-10">
              <FolderGit className="w-5.5 h-5.5 text-text-primary" />
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="font-geist text-base font-bold text-text-primary tracking-tight">Connect GitHub Profile</h2>
            <p className="font-sans text-[11px] text-text-secondary/70">
              Enter a username to load their repositories and projects into your local dashboard.
            </p>
          </div>
        </div>

        {/* Connection Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3 text-xs">
            {/* Username Input */}
            <div className="space-y-1">
              <label className="text-[9px] text-[#8b90a0] font-bold uppercase tracking-wider">
                GitHub Username
              </label>
              <input
                type="text"
                placeholder="e.g. torvalds"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full bg-bg-input border border-surface-border focus:border-[#0070f3] focus:ring-1 focus:ring-[#0070f3]/20 rounded px-2.5 py-2 text-text-primary placeholder-text-secondary/30 transition-all font-sans outline-none"
                required
              />
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={!usernameInput.trim()}
            className="w-full flex items-center justify-center space-x-2 bg-[#EDEDED] text-black py-2.5 px-4 rounded font-mono text-xs font-semibold hover:bg-white hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 disabled:hover:bg-[#EDEDED] transition-all cursor-pointer shadow-sm"
          >
            <span>Connect Profile</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
