import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { useToast } from '../../context/ToastContext';
import { EcosystemItem } from '../../types';
import { Save, Loader2, Layers } from 'lucide-react';

export const AdminEcosystem: React.FC = () => {
  const { showToast } = useToast();
  const [ecosystem, setEcosystem] = useState<EcosystemItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = () => {
    setLoading(true);
    dataService.getEcosystem().then(items => {
      setEcosystem(items || []);
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
      await dataService.saveEcosystem(ecosystem);
      showToast('Ecosystem entities updated.', 'success');
    } catch (e) {
      console.error(e);
      showToast('Failed to update ecosystem.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-6 max-w-5xl">
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-400">Configure Ravan Tech Park & Ravan Film Studio details.</p>
          <button
            onClick={handleSave}
            disabled={isSaving || loading}
            className="px-6 py-2 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors flex items-center gap-1.5 shadow disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'SAVING...' : 'SAVE ECOSYSTEM'}</span>
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-[#0a192f] border border-slate-800 rounded-xl">
            <Loader2 className="w-8 h-8 text-secondary animate-spin mx-auto mb-3" />
            <p className="text-xs">Loading ecosystem configuration from database...</p>
          </div>
        ) : ecosystem.length === 0 ? (
          <div className="p-12 text-center bg-[#0a192f] border border-slate-800 rounded-xl space-y-3">
            <Layers className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-semibold text-white">No Ecosystem Entities Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No ecosystem entities are configured in the database.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
          {ecosystem.map((eco, idx) => (
            <div key={eco.id} className="p-6 bg-[#0a192f] border border-slate-800 rounded-xl space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Entity Name</label>
                  <input
                    type="text"
                    value={eco.name}
                    onChange={e => {
                      const copy = [...ecosystem];
                      copy[idx].name = e.target.value;
                      setEcosystem(copy);
                    }}
                    className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={eco.tagline}
                    onChange={e => {
                      const copy = [...ecosystem];
                      copy[idx].tagline = e.target.value;
                      setEcosystem(copy);
                    }}
                    className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={eco.description}
                  onChange={e => {
                    const copy = [...ecosystem];
                    copy[idx].description = e.target.value;
                    setEcosystem(copy);
                  }}
                  className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed"
                />
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};
