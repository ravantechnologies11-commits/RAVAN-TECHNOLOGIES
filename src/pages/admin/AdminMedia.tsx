import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { useToast } from '../../context/ToastContext';
import { MediaItem } from '../../types';
import { initialMedia } from '../../data/initialData';
import { ImageCropModal, CropResult } from '../../components/admin/ImageCropModal';
import { Upload, Trash2, Copy, Search, Filter, Image as ImageIcon, Check, CheckCircle2 } from 'lucide-react';

export const AdminMedia: React.FC = () => {
  const { showToast } = useToast();
  const [mediaList, setMediaList] = useState<MediaItem[]>(initialMedia);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    dataService.getMedia().then(setMediaList);
  }, []);

  const handleCropConfirm = (result: CropResult) => {
    const newItem: MediaItem = {
      id: 'med-' + Date.now(),
      name: result.alt_text || 'Media Asset',
      category: 'general',
      file_type: 'image',
      file_size: result.file_size || 'Unknown',
      url: result.url,
      storage_path: result.storage_path,
      alt_text: result.alt_text,
      dimensions: '1200x900',
      tags: ['upload', 'media'],
      created_at: new Date().toISOString()
    };
    const updated = [newItem, ...mediaList];
    setMediaList(updated);
    dataService.saveMedia(updated);
    showToast('Media asset uploaded and indexed.', 'success');
  };

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast('Storage URL copied to clipboard.', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    const updated = mediaList.filter(m => m.id !== id);
    setMediaList(updated);
    dataService.saveMedia(updated);
    showToast('Media item deleted.', 'success');
  };

  const filteredMedia = mediaList.filter(m => {
    const matchesSearch = (m.name || '').toLowerCase().includes(search.toLowerCase()) ||
                          (m.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = categoryFilter === 'all' || m.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-6 max-w-6xl">
        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-[#0a192f] p-5 border border-slate-800 rounded-xl">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search assets by name or tag..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-secondary"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
            >
              <option value="all">All Categories</option>
              <option value="brand">Brand & Identity</option>
              <option value="founder">Founder & Leadership</option>
              <option value="ecosystem">Campus & Film Studio</option>
              <option value="hackathons">Hackathons</option>
              <option value="general">General Media</option>
            </select>
          </div>

          <button
            onClick={() => setIsCropModalOpen(true)}
            className="px-5 py-2.5 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors flex items-center justify-center gap-1.5 shadow"
          >
            <Upload className="w-4 h-4" />
            <span>Upload & Crop Image</span>
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMedia.map(item => (
            <div
              key={item.id}
              className="bg-[#0a192f] border border-slate-800 rounded-xl overflow-hidden group flex flex-col justify-between"
            >
              <div className="aspect-video relative overflow-hidden bg-slate-900">
                <img
                  src={item.url}
                  alt={item.alt_text || item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 bg-[#0a192f]/90 border border-slate-700 px-2 py-0.5 rounded text-[9px] font-bold text-secondary uppercase">
                  {item.category}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <div className="text-xs font-bold text-white truncate" title={item.name}>
                  {item.name}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{item.file_size}</span>
                  <span>{item.dimensions || 'Dynamic'}</span>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleCopyUrl(item.id, item.url)}
                    className="flex-1 py-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                    title="Delete Media"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ImageCropModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        onConfirm={handleCropConfirm}
        aspectRatioLabel="16:9 (Landscape)"
        targetBucket="media"
        targetFolder="uploads"
      />
    </div>
  );
};
