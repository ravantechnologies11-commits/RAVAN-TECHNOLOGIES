import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { useToast } from '../../context/ToastContext';
import { TestimonialItem } from '../../types';
import { initialTestimonials } from '../../data/initialData';
import { Plus, Trash2, Save, Quote } from 'lucide-react';

export const AdminTestimonials: React.FC = () => {
  const { showToast } = useToast();
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(initialTestimonials);

  useEffect(() => {
    dataService.getTestimonials().then(setTestimonials);
  }, []);

  const handleSave = async () => {
    await dataService.saveTestimonials(testimonials);
    showToast('Client testimonials updated.', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-6 max-w-4xl">
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-400">Manage executive endorsements from institutional enterprise clients.</p>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors flex items-center gap-1.5 shadow"
          >
            <Save className="w-4 h-4" />
            <span>SAVE TESTIMONIALS</span>
          </button>
        </div>

        <div className="space-y-4">
          {testimonials.map((t, idx) => (
            <div key={t.id} className="p-6 bg-[#0a192f] border border-slate-800 rounded-xl space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Quote</label>
                <textarea
                  rows={2}
                  value={t.quote}
                  onChange={e => {
                    const copy = [...testimonials];
                    copy[idx].quote = e.target.value;
                    setTestimonials(copy);
                  }}
                  className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Author Name"
                  value={t.author_name}
                  onChange={e => {
                    const copy = [...testimonials];
                    copy[idx].author_name = e.target.value;
                    setTestimonials(copy);
                  }}
                  className="px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs"
                />
                <input
                  type="text"
                  placeholder="Designation"
                  value={t.author_designation}
                  onChange={e => {
                    const copy = [...testimonials];
                    copy[idx].author_designation = e.target.value;
                    setTestimonials(copy);
                  }}
                  className="px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs"
                />
                <input
                  type="text"
                  placeholder="Company"
                  value={t.author_company}
                  onChange={e => {
                    const copy = [...testimonials];
                    copy[idx].author_company = e.target.value;
                    setTestimonials(copy);
                  }}
                  className="px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
