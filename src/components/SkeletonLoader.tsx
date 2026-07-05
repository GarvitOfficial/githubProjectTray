import React from "react";

export const RepositorySkeleton: React.FC = () => {
  return (
    <div className="glass-card rounded-lg p-3 flex flex-col gap-3 animate-skeleton opacity-60">
      <div className="flex justify-between items-start">
        <div className="h-4 bg-surface-border rounded w-1/2"></div>
        <div className="h-3.5 bg-surface-border rounded w-12"></div>
      </div>
      <div className="space-y-1.5 mt-1">
        <div className="h-2.5 bg-surface-border rounded w-full"></div>
        <div className="h-2.5 bg-surface-border rounded w-4/5"></div>
      </div>
      <div className="flex gap-4 mt-2 items-center">
        <div className="h-2 bg-surface-border rounded w-16"></div>
        <div className="h-2 bg-surface-border rounded w-8"></div>
        <div className="h-2 bg-surface-border rounded w-8"></div>
        <div className="h-4 bg-surface-border rounded-sm w-6 ml-auto"></div>
      </div>
    </div>
  );
};

export const PRSkeleton: React.FC = () => {
  return (
    <div className="border-b border-surface-border p-3 flex flex-col gap-2 animate-skeleton opacity-60">
      <div className="flex justify-between items-start w-full">
        <div className="flex items-center gap-2 w-2/3">
          <div className="h-3 bg-surface-border rounded w-10"></div>
          <div className="h-3.5 bg-surface-border rounded w-full"></div>
        </div>
        <div className="h-4 bg-surface-border rounded w-12"></div>
      </div>
      <div className="flex justify-between items-center w-full mt-1">
        <div className="flex items-center gap-2 w-1/3">
          <div className="h-3 bg-surface-border rounded w-full"></div>
          <div className="h-3 bg-surface-border rounded w-10"></div>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full bg-surface-border"></div>
          <div className="w-3.5 h-3.5 rounded-full bg-surface-border"></div>
        </div>
      </div>
    </div>
  );
};

export const IssueSkeleton: React.FC = () => {
  return (
    <div className="border-b border-surface-border p-3 flex flex-col gap-2 animate-skeleton opacity-60">
      <div className="flex justify-between items-start w-full">
        <div className="flex items-center gap-2 w-2/3">
          <div className="h-3.5 bg-surface-border rounded w-10"></div>
          <div className="h-3.5 bg-surface-border rounded w-full"></div>
        </div>
        <div className="h-4 bg-surface-border rounded w-14"></div>
      </div>
      <div className="flex items-center gap-3 mt-1.5">
        <div className="h-2 bg-surface-border rounded w-20"></div>
        <div className="h-2 bg-surface-border rounded w-12"></div>
        <div className="h-4 bg-surface-border rounded w-8 ml-auto"></div>
      </div>
    </div>
  );
};
