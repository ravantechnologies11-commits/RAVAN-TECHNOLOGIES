import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { useToast } from '../../context/ToastContext';
import { LearningProgram } from '../../types';
import { initialLearningPrograms } from '../../data/initialData';
import { Save } from 'lucide-react';

export const AdminLearning: React.FC = () => {
  const { showToast } = useToast();
  const [programs, setPrograms] = useState<LearningProgram[]>(initialLearningPrograms);

  useEffect(() => {
    dataService.getLearningPrograms().then(setPrograms);
  }, []);

  const handleSave = async () => {
    await dataService.saveLearningPrograms(programs);
    showToast('Learning programs updated.', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-6 max-w-5xl">
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-400">Configure learning curriculum tracks and enrolled student metrics.</p>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors flex items-center gap-1.5 shadow"
          >
            <Save className="w-4 h-4" />
            <span>SAVE ACADEMY</span>
          </button>
        </div>

        <div className="space-y-6">
          {programs.map((prog, idx) => (
            <div key={prog.id} className="p-6 bg-[#0a192f] border border-slate-800 rounded-xl space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Track Title</label>
                  <input
                    type="text"
                    value={prog.title}
                    onChange={e => {
                      const copy = [...programs];
                      copy[idx].title = e.target.value;
                      setPrograms(copy);
                    }}
                    className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Badge</label>
                  <input
                    type="text"
                    value={prog.badge}
                    onChange={e => {
                      const copy = [...programs];
                      copy[idx].badge = e.target.value;
                      setPrograms(copy);
                    }}
                    className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Enrolled Count</label>
                  <input
                    type="text"
                    value={prog.enrolled_count}
                    onChange={e => {
                      const copy = [...programs];
                      copy[idx].enrolled_count = e.target.value;
                      setPrograms(copy);
                    }}
                    className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={prog.description}
                  onChange={e => {
                    const copy = [...programs];
                    copy[idx].description = e.target.value;
                    setPrograms(copy);
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
