import React from 'react';

export const AdminContentSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 opacity-75">
      <div className="flex justify-between items-center pb-4 border-b border-slate-800/60">
        <div className="space-y-2">
          <div className="h-5 w-48 bg-slate-800/80 rounded" />
          <div className="h-3 w-72 bg-slate-800/40 rounded" />
        </div>
        <div className="h-8 w-28 bg-slate-800/80 rounded" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="h-24 bg-[#0a192f] border border-slate-800/80 rounded-xl" />
        <div className="h-24 bg-[#0a192f] border border-slate-800/80 rounded-xl" />
        <div className="h-24 bg-[#0a192f] border border-slate-800/80 rounded-xl" />
        <div className="h-24 bg-[#0a192f] border border-slate-800/80 rounded-xl" />
      </div>
      <div className="h-72 bg-[#0a192f] border border-slate-800/80 rounded-xl" />
    </div>
  );
};
