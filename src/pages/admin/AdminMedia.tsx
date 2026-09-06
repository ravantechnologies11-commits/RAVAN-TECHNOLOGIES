import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { useToast } from '../../context/ToastContext';
import { MediaItem } from '../../types';
import { initialMedia } from '../../data/initialData';
import { DeleteConfirmationModal } from '../../components/admin/DeleteConfirmationModal';
import { ImageCropModal, CropResult } from '../../components/admin/ImageCropModal';
import {
  Upload,
  Trash2,
  Copy,
  Search,
  Check,
  Edit2,
  Save,
  X,
  ExternalLink,
  Video,
  FileText,
  Image as ImageIcon,
  Plus
} from 'lucide-react';

export const AdminMedia: React.FC = () => {
  const { showToast } = useToast();
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Crop & Upload Modal
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  // Edit Metadata Modal
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // External Video Asset Modal
  const [isExternalModalOpen, setIsExternalModalOpen] = useState(false);
  const [externalAsset, setExternalAsset] = useState({
    name: '',
    url: '',
    category: 'general' as MediaItem['category'],
    file_type: 'video' as MediaItem['file_type'],
    alt_text: '',
    tags: 'video, showreel'
  });

  // Delete Modal
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await dataService.getMedia();
      setMediaList(data && data.length > 0 ? data : initialMedia);
    } catch (e) {
      console.error(e);
      showToast('Failed to load media assets from database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('ravan_data_updated', loadData);
    return () => window.removeEventListener('ravan_data_updated', loadData);
  }, []);

  const handleCropConfirm = async (result: CropResult) => {
    const newItem: MediaItem = {
      id: 'med-' + Date.now(),
      name: result.alt_text || 'Media Asset',
      category: 'general',
      file_type: 'image',
      file_size: result.file_size || 'Dynamic',
      url: result.url,
      storage_path: result.storage_path,
      alt_text: result.alt_text,
      dimensions: '1920x1080',
      tags: ['upload', 'media'],
      created_at: new Date().toISOString()
    };
    const updated = [newItem, ...mediaList];
    setMediaList(updated);
    await dataService.saveMedia(updated);
    showToast('Media asset indexed and saved to database.', 'success');
  };

  const handleCreateExternalAsset = async () => {
    if (!externalAsset.name.trim() || !externalAsset.url.trim()) {
      showToast('Asset name and URL are required.', 'info');
      return;
    }

    const newItem: MediaItem = {
      id: 'med-' + Date.now(),
      name: externalAsset.name.trim(),
      category: externalAsset.category,
      file_type: externalAsset.file_type,
      file_size: 'External Stream',
      url: externalAsset.url.trim(),
      alt_text: externalAsset.alt_text.trim() || externalAsset.name.trim(),
      dimensions: 'Stream / 4K',
      tags: externalAsset.tags.split(',').map(s => s.trim()).filter(Boolean),
      created_at: new Date().toISOString()
    };

    const updated = [newItem, ...mediaList];
    setMediaList(updated);
    await dataService.saveMedia(updated);
    showToast('External asset added to media library.', 'success');
    setIsExternalModalOpen(false);
    setExternalAsset({
      name: '',
      url: '',
      category: 'general',
      file_type: 'video',
      alt_text: '',
      tags: 'video, showreel'
    });
  };

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast('Asset URL copied to clipboard.', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenEditMetadata = (item: MediaItem) => {
    setEditingItem(JSON.parse(JSON.stringify(item)));
    setIsEditModalOpen(true);
  };

  const handleSaveMetadata = async () => {
    if (!editingItem) return;
    const updated = mediaList.map(m => (m.id === editingItem.id ? editingItem : m));
    setMediaList(updated);
    await dataService.saveMedia(updated);
    showToast('Asset metadata saved successfully.', 'success');
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const updated = mediaList.filter(m => m.id !== deleteTarget.id);
      setMediaList(updated);
      await dataService.deleteMedia(deleteTarget.id);
      showToast(`Deleted media asset "${deleteTarget.name}".`, 'success');
      setDeleteTarget(null);
    } catch (e) {
      console.error(e);
      showToast('Failed to delete media asset.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredMedia = mediaList.filter(m => {
    const matchesSearch = (m.name || '').toLowerCase().includes(search.toLowerCase()) ||
                          (m.alt_text || '').toLowerCase().includes(search.toLowerCase()) ||
                          (m.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = categoryFilter === 'all' || m.category === categoryFilter;
    const matchesType = typeFilter === 'all' || m.file_type === typeFilter;
    return matchesSearch && matchesCat && matchesType;
  });

  return (
    <div className="space-y-6 animate-fade-in font-body">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-[#0a192f] p-5 border border-slate-800 rounded-xl">
        <div>
          <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-secondary" />
            Centralized Media & Assets Library
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Organize high-resolution imagery, virtual production video reels, and brand vectors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExternalModalOpen(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Video className="w-4 h-4 text-secondary" />
            <span>Add Video / URL</span>
          </button>
          <button
            onClick={() => setIsCropModalOpen(true)}
            className="px-4 py-2 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors flex items-center gap-1.5 shadow"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Image</span>
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search assets by name, tag, or alt text..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-secondary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
          >
            <option value="all">All Categories</option>
            <option value="brand">Brand & Identity</option>
            <option value="founder">Founder & Leadership</option>
            <option value="services">Services & Solutions</option>
            <option value="ecosystem">Campus & Film Studio</option>
            <option value="hackathons">Hackathons</option>
            <option value="general">General Media</option>
          </select>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="document">Documents</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 font-mono">Loading assets from Supabase storage...</div>
      ) : filteredMedia.length === 0 ? (
        <div className="p-12 bg-[#0a192f] border border-slate-800 rounded-xl text-center space-y-3">
          <ImageIcon className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm text-slate-400 font-semibold">No media assets found.</p>
          <button
            onClick={() => setIsCropModalOpen(true)}
            className="px-3 py-1.5 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase"
          >
            Upload First Asset
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredMedia.map(item => (
            <div
              key={item.id}
              className="bg-[#0a192f] border border-slate-800 rounded-xl overflow-hidden group flex flex-col justify-between hover:border-slate-700 transition-all shadow-md"
            >
              <div className="aspect-video relative overflow-hidden bg-slate-900 flex items-center justify-center">
                {item.file_type === 'video' ? (
                  <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-2 p-4">
                    <Video className="w-8 h-8 text-secondary" />
                    <span className="text-[10px] text-center line-clamp-1 font-mono">{item.name}</span>
                  </div>
                ) : (
                  <img
                    src={item.url}
                    alt={item.alt_text || item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <span className="absolute top-2 left-2 bg-[#0a192f]/90 border border-slate-700 px-2 py-0.5 rounded text-[9px] font-bold text-secondary uppercase font-mono">
                  {item.category}
                </span>
                <span className="absolute top-2 right-2 bg-slate-900/90 border border-slate-700 px-1.5 py-0.5 rounded text-[8px] font-bold text-slate-300 uppercase font-mono">
                  {item.file_type}
                </span>
              </div>

              <div className="p-3.5 space-y-2">
                <div className="text-xs font-bold text-white truncate" title={item.name}>
                  {item.name}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{item.file_size}</span>
                  <span>{item.dimensions || 'Responsive'}</span>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1.5">
                  <button
                    onClick={() => handleCopyUrl(item.id, item.url)}
                    className="flex-1 py-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleOpenEditMetadata(item)}
                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                    title="Edit Metadata"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                    title="Delete Asset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Metadata Modal */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg bg-[#0a192f] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#07111e]">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-secondary" />
                Edit Asset Metadata
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Asset Name</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-secondary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Category</label>
                <select
                  value={editingItem.category}
                  onChange={e => setEditingItem({ ...editingItem, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                >
                  <option value="brand">Brand & Identity</option>
                  <option value="founder">Founder & Leadership</option>
                  <option value="services">Services & Solutions</option>
                  <option value="ecosystem">Campus & Film Studio</option>
                  <option value="hackathons">Hackathons</option>
                  <option value="general">General Media</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Alt Text (Accessibility & SEO)</label>
                <input
                  type="text"
                  value={editingItem.alt_text || ''}
                  onChange={e => setEditingItem({ ...editingItem, alt_text: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={(editingItem.tags || []).join(', ')}
                  onChange={e => setEditingItem({
                    ...editingItem,
                    tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                />
              </div>
            </div>

            <div className="p-4 bg-[#07111e] border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMetadata}
                className="px-5 py-2 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors flex items-center gap-1.5 shadow"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* External Video Asset Modal */}
      {isExternalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg bg-[#0a192f] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#07111e]">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Video className="w-4 h-4 text-secondary" />
                Register Video Reel / External URL
              </h3>
              <button
                onClick={() => setIsExternalModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Asset Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Virtual Production LED Showreel 2026"
                  value={externalAsset.name}
                  onChange={e => setExternalAsset({ ...externalAsset, name: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-secondary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Stream / Video URL *</label>
                <input
                  type="text"
                  placeholder="https://commondatastorage.googleapis.com/... or https://..."
                  value={externalAsset.url}
                  onChange={e => setExternalAsset({ ...externalAsset, url: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-secondary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Category</label>
                  <select
                    value={externalAsset.category}
                    onChange={e => setExternalAsset({ ...externalAsset, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                  >
                    <option value="ecosystem">Campus & Film Studio</option>
                    <option value="services">Services & Solutions</option>
                    <option value="hackathons">Hackathons</option>
                    <option value="brand">Brand & Identity</option>
                    <option value="general">General Media</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Type</label>
                  <select
                    value={externalAsset.file_type}
                    onChange={e => setExternalAsset({ ...externalAsset, file_type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                  >
                    <option value="video">Video Reel / Stream</option>
                    <option value="image">External Image</option>
                    <option value="document">Technical Document</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={externalAsset.tags}
                  onChange={e => setExternalAsset({ ...externalAsset, tags: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                />
              </div>
            </div>

            <div className="p-4 bg-[#07111e] border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsExternalModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateExternalAsset}
                className="px-5 py-2 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Add Asset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        onConfirm={handleCropConfirm}
        aspectRatioLabel="16:9 (Landscape)"
        targetBucket="media"
        targetFolder="uploads"
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deleteTarget}
        itemTitle={deleteTarget?.name}
        itemType="Media Asset"
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
