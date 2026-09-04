import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { useToast } from '../../context/ToastContext';
import { HackathonItem } from '../../types';
import { initialHackathon } from '../../data/initialData';
import { Save } from 'lucide-react';

export const AdminHackathons: React.FC = () => {
  const { showToast } = useToast();
  const [hackathon, setHackathon] = useState<HackathonItem>(initialHackathon);

  useEffect(() => {
    dataService.getHackathon().then(setHackathon);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await dataService.saveHackathon(hackathon);
    showToast('Hackathon event details updated.', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <form onSubmit={handleSave} className="space-y-6 max-w-5xl">
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-400">Configure current event, dates, strategic tracks, and problem statements.</p>
          <button
            type="submit"
            className="px-6 py-2 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors flex items-center gap-1.5 shadow"
          >
            <Save className="w-4 h-4" />
            <span>SAVE HACKATHON</span>
          </button>
        </div>

        <div className="p-6 bg-[#0a192f] border border-slate-800 rounded-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Event Title</label>
              <input
                type="text"
                value={hackathon.title}
                onChange={e => setHackathon({ ...hackathon, title: e.target.value })}
                className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Event Date</label>
              <input
                type="text"
                value={hackathon.event_date}
                onChange={e => setHackathon({ ...hackathon, event_date: e.target.value })}
                className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Solutions Deployed Metric</label>
              <input
                type="text"
                value={hackathon.solutions_deployed_count}
                onChange={e => setHackathon({ ...hackathon, solutions_deployed_count: e.target.value })}
                className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Focus Statement</label>
            <input
              type="text"
              value={hackathon.focus_statement}
              onChange={e => setHackathon({ ...hackathon, focus_statement: e.target.value })}
              className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Description</label>
            <textarea
              rows={3}
              value={hackathon.description}
              onChange={e => setHackathon({ ...hackathon, description: e.target.value })}
              className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed"
            />
          </div>
        </div>
      </form>
    </div>
  );
};
