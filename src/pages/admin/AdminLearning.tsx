import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { useToast } from '../../context/ToastContext';
import { LearningProgram, CurriculumModule } from '../../types';
import { initialLearningPrograms } from '../../data/initialData';
import { DeleteConfirmationModal } from '../../components/admin/DeleteConfirmationModal';
import { ImageCropModal, CropResult } from '../../components/admin/ImageCropModal';
import {
  GraduationCap,
  Plus,
  Trash2,
  Edit2,
  Save,
  Search,
  BookOpen,
  Users,
  Video,
  ExternalLink,
  Upload,
  X,
  Clock,
  Layers
} from 'lucide-react';

export const AdminLearning: React.FC = () => {
  const { showToast } = useToast();
  const [programs, setPrograms] = useState<LearningProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal / Editing State
  const [editingItem, setEditingItem] = useState<LearningProgram | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'curriculum' | 'prereqs'>('details');

  // Image Crop Modal
  const [isCropOpen, setIsCropOpen] = useState(false);

  // Delete Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState<LearningProgram | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Saving state
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await dataService.getLearningPrograms();
      setPrograms(data && data.length > 0 ? data : initialLearningPrograms);
    } catch (e) {
      console.error(e);
      showToast('Failed to load learning tracks from database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('ravan_data_updated', loadData);
    return () => window.removeEventListener('ravan_data_updated', loadData);
  }, []);

  const handleOpenCreate = () => {
    const newItem: LearningProgram = {
      id: 'prog-' + Date.now(),
      slug: 'program-' + Date.now(),
      title: 'Enterprise Distributed Systems & Cloud Architecture',
      track_name: 'Advanced Systems Engineering',
      badge: 'SPECIALIZATION',
      description: 'Master high-throughput event sourcing, distributed transactions, and sovereign infrastructure deployment.',
      enrolled_count: '650+',
      image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
      video_url: '',
      external_url: 'https://ravantechnologies.com/learning/enroll',
      instructor_info: 'Ravan Systems Architecture Council',
      category: 'Cloud Architecture',
      methodology_phase: 'Phase 2: Core Engineering',
      curriculum: [
        {
          id: 'mod-1',
          title: 'Foundations of Distributed Consensus',
          level: 'Intermediate',
          duration: '3 Weeks',
          topics: ['Raft Protocol', 'State Machine Replication', 'Network Partitions']
        },
        {
          id: 'mod-2',
          title: 'High-Concurrency Event Streaming',
          level: 'Advanced',
          duration: '4 Weeks',
          topics: ['Kafka Internals', 'Partitioning Strategies', 'Exactly-Once Semantics']
        }
      ],
      prerequisites: [
        'Proficiency in TypeScript, Go, or Rust',
        'Understanding of relational & non-relational storage engines'
      ],
      display_order: programs.length + 1,
      status: 'published'
    };
    setEditingItem(newItem);
    setActiveTab('details');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: LearningProgram) => {
    setEditingItem(JSON.parse(JSON.stringify(item)));
    setActiveTab('details');
    setIsModalOpen(true);
  };

  const handleSaveModal = async () => {
    if (!editingItem) return;
    if (!editingItem.title.trim()) {
      showToast('Program title is required.', 'info');
      return;
    }

    setIsSaving(true);
    try {
      const exists = programs.some(p => p.id === editingItem.id);
      const updated = exists
        ? programs.map(p => (p.id === editingItem.id ? editingItem : p))
        : [editingItem, ...programs];

      setPrograms(updated);
      await dataService.saveLearningPrograms(updated);
      showToast('Learning track saved successfully.', 'success');
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (e) {
      console.error(e);
      showToast('Error saving learning track.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const updated = programs.filter(p => p.id !== deleteTarget.id);
      setPrograms(updated);
      await dataService.deleteLearningProgram(deleteTarget.id);
      showToast(`Deleted track "${deleteTarget.title}".`, 'success');
      setDeleteTarget(null);
    } catch (e) {
      console.error(e);
      showToast('Failed to delete track.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCropResult = (res: CropResult) => {
    if (!editingItem) return;
    setEditingItem({
      ...editingItem,
      image_url: res.url
    });
    showToast('Track cover image updated.', 'success');
  };

  // Module helpers
  const handleAddModule = () => {
    if (!editingItem) return;
    const newMod: CurriculumModule = {
      id: 'mod-' + Date.now(),
      title: 'New Curriculum Module',
      level: 'Advanced',
      duration: '2 Weeks',
      topics: ['Topic 1', 'Topic 2']
    };
    setEditingItem({
      ...editingItem,
      curriculum: [...(editingItem.curriculum || []), newMod]
    });
  };

  const handleRemoveModule = (id: string) => {
    if (!editingItem) return;
    setEditingItem({
      ...editingItem,
      curriculum: editingItem.curriculum.filter(m => m.id !== id)
    });
  };

  const filteredPrograms = programs.filter(p => {
    const matchesSearch = (p.title || '').toLowerCase().includes(search.toLowerCase()) ||
                          (p.track_name || '').toLowerCase().includes(search.toLowerCase()) ||
                          (p.badge || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in font-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-[#0a192f] p-5 border border-slate-800 rounded-xl">
        <div>
          <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-secondary" />
            Ravan Learning Academy CMS
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure learning tracks, syllabus modules, enterprise credentials, and enrollment statistics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Add Track</span>
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search programs by title, track, or badge..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-secondary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Programs Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 font-mono">Loading programs from Supabase...</div>
      ) : filteredPrograms.length === 0 ? (
        <div className="p-12 bg-[#0a192f] border border-slate-800 rounded-xl text-center space-y-3">
          <GraduationCap className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm text-slate-400 font-semibold">No learning programs found.</p>
          <button
            onClick={handleOpenCreate}
            className="px-3 py-1.5 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase"
          >
            Create First Track
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPrograms.map(p => (
            <div
              key={p.id}
              className="bg-[#0a192f] border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg group"
            >
              <div>
                {/* Header */}
                <div className="h-32 relative overflow-hidden bg-slate-900">
                  <img
                    src={p.image_url || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800'}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f] via-transparent to-black/50" />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-secondary text-[#0a192f] rounded text-[10px] font-extrabold uppercase">
                      {p.badge || 'TRACK'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        p.status === 'published'
                          ? 'bg-emerald-950 border-emerald-500/40 text-emerald-400'
                          : 'bg-amber-950 border-amber-500/40 text-amber-400'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 space-y-3">
                  <div className="text-[11px] text-secondary font-semibold uppercase tracking-wider">
                    {p.track_name || 'ENGINEERING TRACK'}
                  </div>
                  <h3 className="text-base font-bold text-white leading-snug">{p.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{p.description}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-300 pt-3 border-t border-slate-800 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-secondary" />
                      <span>{p.enrolled_count} Enrolled</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-secondary" />
                      <span>{p.curriculum?.length || 0} Modules</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 bg-[#07111e] border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="text-[10px] text-slate-500 font-mono">Order: {p.display_order ?? 1}</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setDeleteTarget(p)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                    title="Delete Track"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-4xl bg-[#0a192f] border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#07111e]">
              <div>
                <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-secondary" />
                  {editingItem.id.startsWith('prog-') ? 'Create Learning Program' : 'Edit Learning Program'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure syllabus modules, phase methodology, and enrolled metrics.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-4 px-6 pt-3 border-b border-slate-800 bg-[#07111e]/50 text-xs font-bold uppercase">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-3 border-b-2 transition-colors ${
                  activeTab === 'details'
                    ? 'border-secondary text-secondary'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Program Details
              </button>
              <button
                onClick={() => setActiveTab('curriculum')}
                className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'curriculum'
                    ? 'border-secondary text-secondary'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Curriculum Modules ({editingItem.curriculum?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('prereqs')}
                className={`pb-3 border-b-2 transition-colors ${
                  activeTab === 'prereqs'
                    ? 'border-secondary text-secondary'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Prerequisites & Directives
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Track Title *
                      </label>
                      <input
                        type="text"
                        value={editingItem.title}
                        onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                        className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-secondary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Badge Label
                      </label>
                      <input
                        type="text"
                        value={editingItem.badge}
                        onChange={e => setEditingItem({ ...editingItem, badge: e.target.value })}
                        placeholder="e.g. SPECIALIZATION"
                        className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Track Category
                      </label>
                      <input
                        type="text"
                        value={editingItem.track_name}
                        onChange={e => setEditingItem({ ...editingItem, track_name: e.target.value })}
                        placeholder="e.g. Advanced Systems Engineering"
                        className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Enrolled Metric
                      </label>
                      <input
                        type="text"
                        value={editingItem.enrolled_count}
                        onChange={e => setEditingItem({ ...editingItem, enrolled_count: e.target.value })}
                        placeholder="e.g. 1,200+ Engineers"
                        className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Methodology Phase
                      </label>
                      <input
                        type="text"
                        value={editingItem.methodology_phase}
                        onChange={e => setEditingItem({ ...editingItem, methodology_phase: e.target.value })}
                        placeholder="e.g. Phase 2: Core Engineering"
                        className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Status</label>
                      <select
                        value={editingItem.status}
                        onChange={e => setEditingItem({ ...editingItem, status: e.target.value as any })}
                        className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Display Order</label>
                      <input
                        type="number"
                        value={editingItem.display_order ?? 1}
                        onChange={e => setEditingItem({ ...editingItem, display_order: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Instructor / Team</label>
                      <input
                        type="text"
                        value={editingItem.instructor_info || ''}
                        onChange={e => setEditingItem({ ...editingItem, instructor_info: e.target.value })}
                        placeholder="Ravan Architecture Council"
                        className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Cover Image URL
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingItem.image_url}
                          onChange={e => setEditingItem({ ...editingItem, image_url: e.target.value })}
                          className="flex-1 px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                        />
                        <button
                          type="button"
                          onClick={() => setIsCropOpen(true)}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded flex items-center gap-1 shrink-0"
                        >
                          <Upload className="w-3.5 h-3.5 text-secondary" />
                          <span>Crop</span>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Enroll / External URL
                      </label>
                      <input
                        type="text"
                        value={editingItem.external_url || ''}
                        onChange={e => setEditingItem({ ...editingItem, external_url: e.target.value })}
                        placeholder="https://ravantechnologies.com/learning/enroll"
                        className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Program Overview
                    </label>
                    <textarea
                      rows={4}
                      value={editingItem.description}
                      onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                      className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed focus:outline-none focus:border-secondary"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'curriculum' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400">
                      Curriculum modules and core engineering learning outcomes.
                    </p>
                    <button
                      type="button"
                      onClick={handleAddModule}
                      className="px-3 py-1.5 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Module</span>
                    </button>
                  </div>

                  {(!editingItem.curriculum || editingItem.curriculum.length === 0) ? (
                    <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                      No modules configured yet. Click "Add Module" to begin.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {editingItem.curriculum.map((mod, mIdx) => (
                        <div key={mod.id || mIdx} className="p-4 bg-[#07111e] border border-slate-800 rounded-xl space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <input
                              type="text"
                              placeholder="Module Title"
                              value={mod.title}
                              onChange={e => {
                                const copy = [...editingItem.curriculum];
                                copy[mIdx].title = e.target.value;
                                setEditingItem({ ...editingItem, curriculum: copy });
                              }}
                              className="flex-1 px-3 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs font-bold"
                            />
                            <input
                              type="text"
                              placeholder="Duration (e.g. 3 Weeks)"
                              value={mod.duration}
                              onChange={e => {
                                const copy = [...editingItem.curriculum];
                                copy[mIdx].duration = e.target.value;
                                setEditingItem({ ...editingItem, curriculum: copy });
                              }}
                              className="w-32 px-3 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs"
                            />
                            <input
                              type="text"
                              placeholder="Level"
                              value={mod.level}
                              onChange={e => {
                                const copy = [...editingItem.curriculum];
                                copy[mIdx].level = e.target.value;
                                setEditingItem({ ...editingItem, curriculum: copy });
                              }}
                              className="w-28 px-3 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveModule(mod.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div>
                            <label className="block text-[9px] font-bold uppercase text-slate-500 mb-1">
                              Topics Covered (Comma-separated)
                            </label>
                            <input
                              type="text"
                              value={(mod.topics || []).join(', ')}
                              onChange={e => {
                                const copy = [...editingItem.curriculum];
                                copy[mIdx].topics = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                setEditingItem({ ...editingItem, curriculum: copy });
                              }}
                              className="w-full px-3 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'prereqs' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Prerequisites (One per line)
                    </label>
                    <textarea
                      rows={4}
                      value={(editingItem.prerequisites || []).join('\n')}
                      onChange={e =>
                        setEditingItem({
                          ...editingItem,
                          prerequisites: e.target.value.split('\n').filter(Boolean)
                        })
                      }
                      className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#07111e] border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                disabled={isSaving}
                className="px-5 py-2 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors flex items-center gap-1.5 shadow"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Track'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={isCropOpen}
        onClose={() => setIsCropOpen(false)}
        onConfirm={handleCropResult}
        aspectRatioLabel="16:9 (Landscape)"
        targetBucket="ecosystem"
        targetFolder="academy"
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deleteTarget}
        itemTitle={deleteTarget?.title}
        itemType="Learning Program"
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
