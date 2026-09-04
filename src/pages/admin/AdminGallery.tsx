import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { storageService } from '../../lib/storageService';
import { useToast } from '../../context/ToastContext';
import { GalleryAlbum } from '../../types';
import { initialGalleryAlbums } from '../../data/initialData';
import { Plus, Trash2, Upload, Images, Save } from 'lucide-react';

export const AdminGallery: React.FC = () => {
  const { showToast } = useToast();
  const [albums, setAlbums] = useState<GalleryAlbum[]>(initialGalleryAlbums);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    dataService.getGalleryAlbums().then(setAlbums);
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
              disabled={isSaving}
              className="px-6 py-2 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors flex items-center gap-1.5 shadow"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'SAVING...' : 'SAVE ALBUMS'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {albums.map((alb, idx) => (
            <div key={alb.id} className="p-6 bg-[#0a192f] border border-slate-800 rounded-xl space-y-4">
              <div className="aspect-video relative rounded-lg overflow-hidden border border-slate-700 bg-slate-900 group">
                <img
                  src={alb.cover_image_url}
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
                <span className="text-[10px] text-slate-400">{alb.items_count || 0} Photos in Album</span>
                <button
                  onClick={() => setAlbums(albums.filter(a => a.id !== alb.id))}
                  className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
