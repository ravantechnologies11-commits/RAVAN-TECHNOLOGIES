import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { useToast } from '../../context/ToastContext';
import { EventItem } from '../../types';
import { initialEvents } from '../../data/initialData';
import { Plus, Trash2, Save, Calendar } from 'lucide-react';

export const AdminEvents: React.FC = () => {
  const { showToast } = useToast();
  const [events, setEvents] = useState<EventItem[]>(initialEvents);

  useEffect(() => {
    dataService.getEvents().then(setEvents);
  }, []);

  const handleSave = async () => {
    await dataService.saveEvents(events);
    showToast('Events updated.', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-6 max-w-4xl">
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-400">Schedule technical summits, pitch days, and architecture conferences.</p>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors flex items-center gap-1.5 shadow"
          >
            <Save className="w-4 h-4" />
            <span>SAVE EVENTS</span>
          </button>
        </div>

        <div className="space-y-4">
          {events.map((evt, idx) => (
            <div key={evt.id} className="p-6 bg-[#0a192f] border border-slate-800 rounded-xl space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Event Title</label>
                  <input
                    type="text"
                    value={evt.title}
                    onChange={e => {
                      const copy = [...events];
                      copy[idx].title = e.target.value;
                      setEvents(copy);
                    }}
                    className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Date</label>
                  <input
                    type="text"
                    value={evt.event_date}
                    onChange={e => {
                      const copy = [...events];
                      copy[idx].event_date = e.target.value;
                      setEvents(copy);
                    }}
                    className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Location / Venue</label>
                <input
                  type="text"
                  value={evt.location}
                  onChange={e => {
                    const copy = [...events];
                    copy[idx].location = e.target.value;
                    setEvents(copy);
                  }}
                  className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
