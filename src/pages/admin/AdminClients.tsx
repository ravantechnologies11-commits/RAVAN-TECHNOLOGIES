import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { useToast } from '../../context/ToastContext';
import { ClientItem } from '../../types';
import { initialClients } from '../../data/initialData';
import { Save } from 'lucide-react';

export const AdminClients: React.FC = () => {
  const { showToast } = useToast();
  const [clients, setClients] = useState<ClientItem[]>(initialClients);

  useEffect(() => {
    dataService.getClients().then(setClients);
  }, []);

  const handleSave = async () => {
    await dataService.saveClients(clients);
    showToast('Clients directory saved.', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-6 max-w-4xl">
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-400">Manage client logos and industry sectors.</p>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors flex items-center gap-1.5 shadow"
          >
            <Save className="w-4 h-4" />
            <span>SAVE CLIENTS</span>
          </button>
        </div>

        <div className="space-y-3">
          {clients.map((c, idx) => (
            <div key={c.id} className="p-4 bg-[#0a192f] border border-slate-800 rounded-xl flex items-center gap-4">
              <input
                type="text"
                value={c.name}
                onChange={e => {
                  const copy = [...clients];
                  copy[idx].name = e.target.value;
                  setClients(copy);
                }}
                className="flex-1 px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-bold"
              />
              <input
                type="text"
                value={c.industry}
                onChange={e => {
                  const copy = [...clients];
                  copy[idx].industry = e.target.value;
                  setClients(copy);
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
