import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { useToast } from '../../context/ToastContext';
import { EcosystemItem } from '../../types';
import { initialEcosystem } from '../../data/initialData';
import { Save } from 'lucide-react';

export const AdminEcosystem: React.FC = () => {
  const { showToast } = useToast();
  const [ecosystem, setEcosystem] = useState<EcosystemItem[]>(initialEcosystem);

  useEffect(() => {
    dataService.getEcosystem().then(setEcosystem);
  }, []);

  const handleSave = async () => {
    await dataService.saveEcosystem(ecosystem);
    showToast('Ecosystem entities updated.', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-6 max-w-5xl">
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-400">Configure Ravan Tech Park & Ravan Film Studio details.</p>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors flex items-center gap-1.5 shadow"
          >
            <Save className="w-4 h-4" />
            <span>SAVE ECOSYSTEM</span>
          </button>
        </div>

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
      </div>
    </div>
  );
};
