import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { Video, Plus, Trash2, Save } from 'lucide-react';

interface AdminVideoItem {
  id: string;
  title: string;
  url: string;
  format: string;
  status: string;
}

export const AdminVideos: React.FC = () => {
  const { showToast } = useToast();
  const [videos, setVideos] = useState<AdminVideoItem[]>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = localStorage.getItem('ravan_admin_videos');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [
      { id: 'vid-1', title: 'Ravan Film Studio — 2026 Virtual Production Sizzle Reel', url: '', format: '8K HDR LED Volume', status: 'published' },
      { id: 'vid-2', title: 'Sovereign Intelligence Framework Keynote', url: '', format: '4K Full Presentation', status: 'published' }
    ];
  });

  const handleSave = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('ravan_admin_videos', JSON.stringify(videos));
      } catch {}
    }
    showToast('Video catalog updated and persisted.', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-6 max-w-4xl">
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-400">Manage virtual production video links, trailers, and livestream archives.</p>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors flex items-center gap-1.5 shadow"
          >
            <Save className="w-4 h-4" />
            <span>SAVE VIDEOS</span>
          </button>
        </div>

        <div className="space-y-4">
          {videos.map((v, i) => (
            <div key={v.id} className="p-6 bg-[#0a192f] border border-slate-800 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Video className="w-4 h-4 text-secondary" />
                  {v.title}
                </span>
                <span className="text-xs text-slate-400 font-mono">{v.format}</span>
              </div>
              <input
                type="text"
                value={v.url}
                onChange={e => {
                  const copy = [...videos];
                  copy[i].url = e.target.value;
                  setVideos(copy);
                }}
                className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-mono"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
