import React from 'react';

export const RouteLoadingSkeleton: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 bg-surface">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <div className="w-12 h-12 rounded-xl bg-surface-container border border-outline-variant/60 flex items-center justify-center shadow-sm">
          <div className="w-6 h-6 rounded-full border-2 border-secondary border-t-transparent animate-spin" />
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className="h-4 w-36 bg-surface-container-highest rounded" />
          <div className="h-2.5 w-24 bg-surface-container rounded" />
        </div>
      </div>
    </div>
  );
};
