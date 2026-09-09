import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { useToast } from '../../context/ToastContext';
import { TestimonialItem } from '../../types';
import { DeleteConfirmationModal } from '../../components/admin/DeleteConfirmationModal';
import { Plus, Trash2, Save, Quote, Eye, EyeOff, Loader2 } from 'lucide-react';

export const AdminTestimonials: React.FC = () => {
  const { showToast } = useToast();
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TestimonialItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await dataService.getTestimonials();
      setTestimonials(data || []);
    } catch (e) {
      console.error(e);
      showToast('Failed to load testimonials from database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('ravan_data_updated', loadData);
    return () => window.removeEventListener('ravan_data_updated', loadData);
  }, []);

  const handleAdd = () => {
    const newItem: TestimonialItem = {
      id: `testi-${Date.now()}`,
      quote: '',
      author_name: '',
      author_designation: '',
      author_company: '',
      display_order: testimonials.length + 1,
      status: 'published'
    };
    setTestimonials([...testimonials, newItem]);
    showToast('New testimonial draft added. Fill details and click SAVE.', 'info');
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const remaining = testimonials.filter(t => t.id !== deleteTarget.id);
      setTestimonials(remaining);
      await dataService.saveTestimonials(remaining);
      showToast('Testimonial removed successfully.', 'success');
      setDeleteTarget(null);
    } catch (e) {
      console.error(e);
      showToast('Failed to delete testimonial.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await dataService.saveTestimonials(testimonials);
      showToast('Client testimonials saved to database.', 'success');
    } catch (e) {
      console.error(e);
      showToast('Failed to save testimonials.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-6 max-w-4xl">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold font-display text-white tracking-wider uppercase">Client Testimonials</h2>
            <p className="text-xs text-slate-400 mt-1">Manage executive endorsements from institutional enterprise clients.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold uppercase transition-colors flex items-center gap-1.5 border border-slate-700"
            >
              <Plus className="w-4 h-4 text-secondary" />
              <span>ADD TESTIMONIAL</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || loading}
              className="px-6 py-2 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors flex items-center gap-1.5 shadow disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? 'SAVING...' : 'SAVE TESTIMONIALS'}</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-[#0a192f] border border-slate-800 rounded-xl">
            <Loader2 className="w-8 h-8 text-secondary animate-spin mx-auto mb-3" />
            <p className="text-xs">Loading testimonials from database...</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="p-12 text-center bg-[#0a192f] border border-slate-800 rounded-xl space-y-4">
            <Quote className="w-12 h-12 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-white">No Testimonials Found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No client testimonials are currently stored in the database. Add your first executive endorsement below.
              </p>
            </div>
            <button
              onClick={handleAdd}
              className="px-5 py-2.5 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>CREATE FIRST TESTIMONIAL</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {testimonials.map((t, idx) => (
              <div key={t.id} className="p-6 bg-[#0a192f] border border-slate-800 rounded-xl space-y-4 relative">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-secondary text-xs flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const copy = [...testimonials];
                        copy[idx].status = copy[idx].status === 'published' ? 'draft' : 'published';
                        setTestimonials(copy);
                      }}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1.5 transition-colors ${
                        t.status === 'published'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {t.status === 'published' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{t.status || 'published'}</span>
                    </button>
                  </div>
                  <button
                    onClick={() => setDeleteTarget(t)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                    title="Delete Testimonial"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Quote</label>
                  <textarea
                    rows={3}
                    placeholder="Enter endorsement quote..."
                    value={t.quote}
                    onChange={e => {
                      const copy = [...testimonials];
                      copy[idx].quote = e.target.value;
                      setTestimonials(copy);
                    }}
                    className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Author Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Rajesh Kumar"
                      value={t.author_name}
                      onChange={e => {
                        const copy = [...testimonials];
                        copy[idx].author_name = e.target.value;
                        setTestimonials(copy);
                      }}
                      className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Designation</label>
                    <input
                      type="text"
                      placeholder="e.g. Chief Technology Officer"
                      value={t.author_designation}
                      onChange={e => {
                        const copy = [...testimonials];
                        copy[idx].author_designation = e.target.value;
                        setTestimonials(copy);
                      }}
                      className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Company</label>
                    <input
                      type="text"
                      placeholder="e.g. Vertex Systems"
                      value={t.author_company}
                      onChange={e => {
                        const copy = [...testimonials];
                        copy[idx].author_company = e.target.value;
                        setTestimonials(copy);
                      }}
                      className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={Boolean(deleteTarget)}
        itemTitle={deleteTarget?.author_name || 'this client'}
        itemType="testimonial"
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
