import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { storageService } from '../../lib/storageService';
import { useToast } from '../../context/ToastContext';
import { GalleryAlbum } from '../../types';
import { DeleteConfirmationModal } from '../../components/admin/DeleteConfirmationModal';
import { Plus, Trash2, Upload, Images, Save, Loader2 } from 'lucide-react';

export const AdminGallery: React.FC = () => {
  const { showToast } = useToast();
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GalleryAlbum | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = () => {
    setLoading(true);
    dataService.getGalleryAlbums().then(items => {
      setAlbums(items || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
    window.addEventListener('ravan_data_updated', loadData);
    return () => window.removeEventListener('ravan_data_updated', loadData);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await dataService.saveGalleryAlbums(albums);
      showToast('Gallery albums synchronized to Supabase.', 'success');
    } catch {
      showToast('Error saving albums.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const remaining = albums.filter(a => a.id !== deleteTarget.id);
      setAlbums(remaining);
      await dataService.saveGalleryAlbums(remaining);
      showToast(`Deleted album "${deleteTarget.title}".`, 'success');
      setDeleteTarget(null);
    } catch {
      showToast('Failed to delete album.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const addAlbum = () => {
    const newAlb: GalleryAlbum = {
      id: 'alb-' + Date.now(),
      title: 'New Campus & Innovation Album',
      slug: 'album-' + Date.now(),
      description: 'Album description and visual details.',
      cover_image_url: '',
      category: 'campus',
      items_count: 0,
      status: 'published',
      display_order: albums.length + 1
    };
    setAlbums([...albums, newAlb]);
  };

  const handleCoverUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await storageService.uploadImage(file, 'gallery', 'albums');
      const copy = [...albums];
      copy[index].cover_image_url = res.url;
      setAlbums(copy);
      showToast('Cover photo uploaded.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Upload failed.', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-6 max-w-5xl">
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-400">Manage albums, upload high-resolution campus photos, and organize film stills.</p>
          <div className="flex gap-3">
            <button
              onClick={addAlbum}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-bold uppercase flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Album</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || loading}
              className="px-6 py-2 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors flex items-center gap-1.5 shadow disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? 'SAVING...' : 'SAVE ALBUMS'}</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400 bg-[#0a192f] border border-slate-800 rounded-2xl max-w-5xl">
          <Loader2 className="w-8 h-8 text-secondary animate-spin mx-auto mb-3" />
          <p className="text-xs">Loading albums from database...</p>
        </div>
      ) : albums.length === 0 ? (
        <div className="p-16 rounded-2xl bg-[#0a192f] border border-slate-800 text-center max-w-5xl">
          <Images className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">No Albums Found</h3>
          <p className="text-xs text-slate-400 mb-4">Click "Create Album" to organize campus photography and film stills.</p>
          <button
            onClick={addAlbum}
            className="px-4 py-2 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase"
          >
            Create First Album
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
          {albums.map((alb, idx) => (
            <div key={alb.id} className="p-6 bg-[#0a192f] border border-slate-800 rounded-xl space-y-4">
              <div className="aspect-video relative rounded-lg overflow-hidden border border-slate-700 bg-slate-900 group">
                <img
                  src={alb.cover_image_url || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80'}
                  alt={alb.title}
                  className="w-full h-full object-cover"
                />
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-secondary font-bold cursor-pointer transition-opacity">
                  <span>Change Cover Image</span>
                  <input
                    type="file"
                    onChange={e => handleCoverUpload(idx, e)}
                    accept="image/*"
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Album Title</label>
                <input
                  type="text"
                  value={alb.title}
                  onChange={e => {
                    const copy = [...albums];
                    copy[idx].title = e.target.value;
                    setAlbums(copy);
                  }}
                  className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Category</label>
                <select
                  value={alb.category}
                  onChange={e => {
                    const copy = [...albums];
                    copy[idx].category = e.target.value as any;
                    setAlbums(copy);
                  }}
                  className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs"
                >
                  <option value="campus">Campus & Labs</option>
                  <option value="production">Virtual Production</option>
                  <option value="hackathon">Hackathon Arena</option>
                  <option value="events">Summits & Keynotes</option>
                </select>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                <button
                  onClick={() => setDeleteTarget(alb)}
                  className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                  title="Delete Album"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={Boolean(deleteTarget)}
        itemTitle={deleteTarget?.title}
        itemType="album"
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
