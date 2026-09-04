import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { useToast } from '../../context/ToastContext';
import { PartnerItem } from '../../types';
import { initialPartners } from '../../data/initialData';
import { Save } from 'lucide-react';

export const AdminPartners: React.FC = () => {
  const { showToast } = useToast();
  const [partners, setPartners] = useState<PartnerItem[]>(initialPartners);

  useEffect(() => {
    dataService.getPartners().then(setPartners);
  }, []);

  const handleSave = async () => {
    await dataService.savePartners(partners);
    showToast('Partners directory saved.', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-6 max-w-4xl">
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-400">Manage academic alliances, computing partnerships, and hardware sponsors.</p>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors flex items-center gap-1.5 shadow"
          >
            <Save className="w-4 h-4" />
            <span>SAVE PARTNERS</span>
          </button>
        </div>

        <div className="space-y-3">
          {partners.map((p, idx) => (
            <div key={p.id} className="p-4 bg-[#0a192f] border border-slate-800 rounded-xl flex items-center gap-4">
              <input
                type="text"
                value={p.name}
                onChange={e => {
                  const copy = [...partners];
                  copy[idx].name = e.target.value;
                  setPartners(copy);
                }}
                className="flex-1 px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-bold"
              />
              <input
                type="text"
                value={p.category}
                onChange={e => {
                  const copy = [...partners];
                  copy[idx].category = e.target.value as any;
                  setPartners(copy);
                }}
                className="w-36 px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
