import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { useToast } from '../../context/ToastContext';
import { EcosystemItem } from '../../types';
import { Save } from 'lucide-react';

export const AdminFilmStudio: React.FC = () => {
  const { showToast } = useToast();
  const [studio, setStudio] = useState<EcosystemItem | null>(null);

  useEffect(() => {
    dataService.getEcosystem().then(items => {
      const st = items.find(i => i.type === 'studio') || items[1];
      setStudio(st);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studio) return;
    const all = await dataService.getEcosystem();
    const updated = all.map(item => item.id === studio.id ? studio : item);
    await dataService.saveEcosystem(updated);
    showToast('Ravan Film Studio specs updated.', 'success');
  };

  if (!studio) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-400">Manage virtual LED volume soundstage, 4K/8K pipelines, and cinematic ventures.</p>
          <button
            type="submit"
            className="px-6 py-2 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors flex items-center gap-1.5 shadow"
          >
            <Save className="w-4 h-4" />
            <span>SAVE STUDIO SPECS</span>
          </button>
        </div>

        <div className="p-6 bg-[#0a192f] border border-slate-800 rounded-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Studio Name</label>
              <input
                type="text"
                value={studio.name}
                onChange={e => setStudio({ ...studio, name: e.target.value })}
                className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Tagline</label>
              <input
                type="text"
                value={studio.tagline}
                onChange={e => setStudio({ ...studio, tagline: e.target.value })}
                className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Description</label>
            <textarea
              rows={3}
              value={studio.description}
              onChange={e => setStudio({ ...studio, description: e.target.value })}
              className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed"
            />
          </div>
        </div>
      </form>
    </div>
  );
};
