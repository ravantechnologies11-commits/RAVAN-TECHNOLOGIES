import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { useToast } from '../../context/ToastContext';
import { HackathonItem, ProblemStatement } from '../../types';
import { DeleteConfirmationModal } from '../../components/admin/DeleteConfirmationModal';
import { ImageCropModal, CropResult } from '../../components/admin/ImageCropModal';
import {
  Trophy,
  Plus,
  Trash2,
  Edit2,
  Save,
  Search,
  Calendar,
  MapPin,
  Upload,
  X,
  Code2,
  Focus
} from 'lucide-react';

export const AdminHackathons: React.FC = () => {
  const { showToast } = useToast();
  const [hackathons, setHackathons] = useState<HackathonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal / Editing State
  const [editingItem, setEditingItem] = useState<HackathonItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'problems' | 'rules'>('details');

  // Image Crop Modal
  const [isCropOpen, setIsCropOpen] = useState(false);

  // Delete Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState<HackathonItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Saving state
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await dataService.getHackathons();
      setHackathons(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      showToast('Failed to load hackathons from database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = dataService.subscribeToUpdates((entity) => {
      if (!entity || entity.includes('hackathon')) {
        loadData();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleOpenCreate = () => {
    const newItem: HackathonItem = {
      id: 'hackathon-' + Date.now(),
      title: '',
      edition: 'Edition ' + (hackathons.length + 1) + '.0',
      subtitle: '',
      event_date: '',
      time: '',
      location: 'Ravan Tech Park, Thiruvannamalai & Virtual',
      registration_url: '',
      status: 'upcoming',
      focus_statement: '',
      description: '',
      image_url: '',
      banner_url: '',
      additional_images: [],
      solutions_deployed_count: '0 Systems',
      tracks: [],
      problem_statements: [],
      rules: [],
      prizes: [],
      eligibility: '',
      contact_info: 'contact@ravantechnologies.in',
      display_order: hackathons.length + 1,
      winning_solutions: []
    };
    setEditingItem(newItem);
    setActiveTab('details');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: HackathonItem) => {
    setEditingItem(JSON.parse(JSON.stringify(item)));
    setActiveTab('details');
    setIsModalOpen(true);
  };

  const handleSaveModal = async () => {
    if (!editingItem) return;
    if (!editingItem.title.trim()) {
      showToast('Event title is required.', 'error');
      return;
    }

    if (editingItem.registration_url) {
      const regTrimmed = editingItem.registration_url.trim().toLowerCase();
      if (
        regTrimmed.startsWith('javascript:') ||
        regTrimmed.startsWith('data:') ||
        regTrimmed.startsWith('vbscript:')
      ) {
        showToast('Dangerous URL protocol detected in Registration URL.', 'error');
        return;
      }
    }

    setIsSaving(true);
    try {
      const exists = hackathons.some(h => h.id === editingItem.id);
      const updated = exists
        ? hackathons.map(h => (h.id === editingItem.id ? editingItem : h))
        : [editingItem, ...hackathons];

      setHackathons(updated);
      await dataService.saveHackathons(updated);
      showToast('Hackathon event saved successfully.', 'success');
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (e: any) {
      console.error('Error saving hackathon:', e);
      showToast(e?.message || 'Error saving hackathon.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const updated = hackathons.filter(h => h.id !== deleteTarget.id);
      setHackathons(updated);
      await dataService.deleteHackathon(deleteTarget.id);
      showToast(`Deleted hackathon "${deleteTarget.title}".`, 'success');
      setDeleteTarget(null);
    } catch (e: any) {
      console.error('Failed to delete hackathon:', e);
      showToast(e?.message || 'Failed to delete hackathon.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCropResult = (res: CropResult) => {
    if (!editingItem) return;
    setEditingItem({
      ...editingItem,
      image_url: res.url,
      banner_url: res.url
    });
    showToast('Banner image updated.', 'success');
  };

  const handleAddProblem = () => {
    if (!editingItem) return;
    const newProb: ProblemStatement = {
      id: 'prob-' + Date.now(),
      title: '',
      category: '',
      domain: '',
      description: '',
      complexity: 'Medium'
    };
    setEditingItem({
      ...editingItem,
      problem_statements: [...(editingItem.problem_statements || []), newProb]
    });
  };

  const handleRemoveProblem = (index: number) => {
    if (!editingItem) return;
    setEditingItem({
      ...editingItem,
      problem_statements: editingItem.problem_statements.filter((_, idx) => idx !== index)
    });
  };

  const filteredHackathons = hackathons.filter(h => {
    const matchesSearch = (h.title || '').toLowerCase().includes(search.toLowerCase()) ||
                          (h.edition || '').toLowerCase().includes(search.toLowerCase()) ||
                          (h.location || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || h.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in font-body">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-[#0a192f] p-5 border border-slate-800 rounded-xl">
        <div>
          <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-secondary" />
            Ravan Hackathon Engine
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage competitive engineering sprints, problem statements, judging criteria, and deployed metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search hackathons by title, edition, or venue..."
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
            <option value="upcoming">Upcoming</option>
            <option value="live">Live Now</option>
            <option value="completed">Completed</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Hackathons List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 font-mono">Loading hackathons from Supabase...</div>
      ) : filteredHackathons.length === 0 ? (
        <div className="p-12 bg-[#0a192f] border border-slate-800 rounded-xl text-center space-y-3">
          <Trophy className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm text-slate-400 font-semibold">No hackathons found.</p>
          <button
            onClick={handleOpenCreate}
            className="px-3 py-1.5 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase"
          >
            Create First Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredHackathons.map(h => (
            <div
              key={h.id}
              className="bg-[#0a192f] border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg group"
            >
              <div>
                {/* Banner Header */}
                <div className="h-36 relative overflow-hidden bg-slate-900">
                  <img
                    src={h.banner_url || h.image_url}
                    alt={h.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f] via-transparent to-black/40" />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#0a192f]/90 border border-slate-700 rounded text-[10px] font-bold text-secondary uppercase">
                      {h.edition || 'Official Sprint'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        h.status === 'live'
                          ? 'bg-emerald-950 border-emerald-500/40 text-emerald-400 animate-pulse'
                          : h.status === 'upcoming'
                          ? 'bg-blue-950 border-blue-500/40 text-blue-400'
                          : h.status === 'completed'
                          ? 'bg-slate-800 border-slate-700 text-slate-300'
                          : 'bg-amber-950 border-amber-500/40 text-amber-400'
                      }`}
                    >
                      {h.status}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-3">
                  <h3 className="text-base font-bold text-white leading-snug">{h.title}</h3>
                  {h.subtitle && <p className="text-xs text-secondary font-medium">{h.subtitle}</p>}
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{h.description}</p>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300 font-mono">
                    <div className="flex items-center gap-1.5 truncate">
                      <Calendar className="w-3.5 h-3.5 text-secondary shrink-0" />
                      <span className="truncate">{h.event_date || 'Date TBD'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
                      <span className="truncate">{h.location || 'Hybrid'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                    <span>Problems: <strong className="text-white">{h.problem_statements?.length || 0}</strong></span>
                    <span>Solutions Metric: <strong className="text-secondary">{h.solutions_deployed_count || 'N/A'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 bg-[#07111e] border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="text-[10px] text-slate-500 font-mono">Order: {h.display_order ?? 1}</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(h)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setDeleteTarget(h)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                    title="Delete Event"
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
                  <Trophy className="w-5 h-5 text-secondary" />
                  {editingItem.id.startsWith('hackathon-') ? 'Create Hackathon Event' : 'Edit Hackathon Event'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure strategic tracks, problem statements, and registration directives.
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
                General Details
              </button>
              <button
                onClick={() => setActiveTab('problems')}
                className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'problems'
                    ? 'border-secondary text-secondary'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Problem Statements ({editingItem.problem_statements?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('rules')}
                className={`pb-3 border-b-2 transition-colors ${
                  activeTab === 'rules'
                    ? 'border-secondary text-secondary'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Rules & Prizes
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Event Title *
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
                        Edition Tag
                      </label>
                      <input
                        type="text"
                        value={editingItem.edition}
                        onChange={e => setEditingItem({ ...editingItem, edition: e.target.value })}
                        placeholder="e.g. Edition 4.0"
                        className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Subtitle / Tagline
                    </label>
                    <input
                      type="text"
                      value={editingItem.subtitle || ''}
                      onChange={e => setEditingItem({ ...editingItem, subtitle: e.target.value })}
                      placeholder="e.g. Building Autonomous Systems & Sovereign AI"
                      className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Status</label>
                      <select
                        value={editingItem.status}
                        onChange={e => setEditingItem({ ...editingItem, status: e.target.value as any })}
                        className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="live">Live Now</option>
                        <option value="completed">Completed</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Date</label>
                      <input
                        type="text"
                        value={editingItem.event_date}
                        onChange={e => setEditingItem({ ...editingItem, event_date: e.target.value })}
                        className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Time</label>
                      <input
                        type="text"
                        value={editingItem.time || ''}
                        onChange={e => setEditingItem({ ...editingItem, time: e.target.value })}
                        placeholder="09:00 AM - 06:00 PM"
                        className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Order</label>
                      <input
                        type="number"
                        value={editingItem.display_order ?? 1}
                        onChange={e => setEditingItem({ ...editingItem, display_order: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Location</label>
                      <input
                        type="text"
                        value={editingItem.location || ''}
                        onChange={e => setEditingItem({ ...editingItem, location: e.target.value })}
                        className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Registration URL</label>
                      <input
                        type="text"
                        value={editingItem.registration_url || ''}
                        onChange={e => setEditingItem({ ...editingItem, registration_url: e.target.value })}
                        className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Solutions Deployed Metric
                      </label>
                      <input
                        type="text"
                        value={editingItem.solutions_deployed_count}
                        onChange={e => setEditingItem({ ...editingItem, solutions_deployed_count: e.target.value })}
                        placeholder="e.g. 45+ Production Systems"
                        className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-3 pt-2">
                      {/* Authoritative Frontend Dimensions Notice */}
                      <div className="bg-[#040810] border border-secondary/30 rounded-xl p-4 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                            <Focus className="w-3.5 h-3.5 text-secondary" />
                            Recommended Frontend Size:
                          </span>
                          <span className="text-xs font-mono font-bold text-secondary">1200 × 900 px</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="text-xs font-bold text-slate-300">Authoritative Aspect Ratio:</span>
                          <span className="text-xs font-mono font-bold text-white">4:3 (Standard)</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal pt-1 border-t border-slate-800/80">
                          Rendered in a 4:3 responsive card on the public Hackathon hero (500×375px desktop, up to 720×540px mobile). High-DPI 1200×900px export normalizes any original resolution without stretching, distortion, or unwanted clipping.
                        </p>
                      </div>

                      {/* Live 4:3 Preview Frame & Controls */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                          Banner / Hero Image (4:3 Preview)
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                          <div className="md:col-span-5">
                            {(editingItem.banner_url || editingItem.image_url) ? (
                              <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-md group">
                                <img
                                  src={editingItem.banner_url || editingItem.image_url}
                                  alt="Hackathon Banner Preview"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                                  <button
                                    type="button"
                                    onClick={() => setIsCropOpen(true)}
                                    className="px-2.5 py-1.5 bg-secondary text-[#0a192f] rounded text-[11px] font-bold uppercase flex items-center gap-1 shadow"
                                  >
                                    <Upload className="w-3 h-3" />
                                    <span>Crop</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingItem({ ...editingItem, banner_url: '', image_url: '' })}
                                    className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-bold uppercase flex items-center gap-1 shadow"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Remove</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div
                                onClick={() => setIsCropOpen(true)}
                                className="aspect-[4/3] border-2 border-dashed border-slate-700 hover:border-secondary rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#07111e]/60 text-center p-4 group"
                              >
                                <Upload className="w-8 h-8 text-slate-500 group-hover:text-secondary mb-2 transition-colors" />
                                <span className="text-xs font-bold text-white mb-0.5">Upload & Crop 4:3 Banner</span>
                                <span className="text-[10px] text-slate-400">1200 × 900 px</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="md:col-span-7 space-y-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="https://... image URL"
                                value={editingItem.banner_url || editingItem.image_url}
                                onChange={e => setEditingItem({ ...editingItem, banner_url: e.target.value, image_url: e.target.value })}
                                className="flex-1 px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-secondary"
                              />
                              <button
                                type="button"
                                onClick={() => setIsCropOpen(true)}
                                className="px-3.5 py-2 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors flex items-center gap-1.5 shadow shrink-0"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Crop Tool</span>
                              </button>
                            </div>
                            <p className="text-[11px] text-slate-500">
                              Upload an image of any resolution to crop, zoom, and center on the 4:3 target frame.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Focus Statement</label>
                    <input
                      type="text"
                      value={editingItem.focus_statement}
                      onChange={e => setEditingItem({ ...editingItem, focus_statement: e.target.value })}
                      className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Full Description</label>
                    <textarea
                      rows={4}
                      value={editingItem.description}
                      onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                      className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed focus:outline-none focus:border-secondary"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'problems' && (
                <div className="space-y-5">
                  {/* Active Problem Domains Header & Dynamic Summary */}
                  {(() => {
                    const activeDomains = Array.from(new Set(
                      (editingItem.problem_statements || [])
                        .map(p => (p.category || p.domain || '').trim())
                        .filter(Boolean)
                    ));
                    return (
                      <div className="bg-[#07111e] border border-slate-800 rounded-xl p-4 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                          <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                            <Code2 className="w-4 h-4 text-secondary" />
                            Selected Problem Domains ({activeDomains.length})
                          </span>
                          <span className="text-[10px] text-slate-400">Strictly derived from saved problem statements</span>
                        </div>
                        {activeDomains.length === 0 ? (
                          <p className="text-xs text-slate-500 italic">
                            No problem domains active yet. Each problem statement's domain will appear here and on the public site automatically.
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {activeDomains.map(d => {
                              const count = (editingItem.problem_statements || []).filter(
                                p => (p.category || p.domain || '').trim().toLowerCase() === d.toLowerCase()
                              ).length;
                              return (
                                <span
                                  key={d}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-xs font-bold"
                                >
                                  <span>{d}</span>
                                  <span className="text-[10px] opacity-75 font-mono">({count})</span>
                                </span>
                              );
                            })}
                          </div>
                        )}
                        <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-800/60">
                          Removing the last problem statement in a domain will automatically remove the domain from the public frontend.
                        </p>
                      </div>
                    );
                  })()}

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400">
                      Problem statements presented to hackathon teams for enterprise evaluation.
                    </p>
                    <button
                      type="button"
                      onClick={handleAddProblem}
                      className="px-3.5 py-1.5 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase flex items-center gap-1 hover:bg-secondary-fixed transition-colors shadow"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Problem Statement</span>
                    </button>
                  </div>

                  {(!editingItem.problem_statements || editingItem.problem_statements.length === 0) ? (
                    <div className="p-12 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl space-y-2">
                      <p className="font-semibold text-slate-400">No problem statements registered yet.</p>
                      <p>Click "Add Problem Statement" to configure a challenge for this event.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {editingItem.problem_statements.map((prob, pIdx) => (
                        <div key={prob.id || pIdx} className="p-4 bg-[#07111e] border border-slate-800 rounded-xl space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-bold text-secondary font-mono">
                              #{pIdx + 1} Problem Challenge
                            </span>
                            <div className="flex items-center gap-2">
                              <select
                                value={prob.complexity || 'Medium'}
                                onChange={e => {
                                  const copy = [...editingItem.problem_statements];
                                  copy[pIdx].complexity = e.target.value as any;
                                  setEditingItem({ ...editingItem, problem_statements: copy });
                                }}
                                className="px-2.5 py-1 rounded bg-[#0a192f] border border-slate-700 text-white text-xs"
                              >
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => handleRemoveProblem(pIdx)}
                                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                                title="Delete Problem Statement"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                                Problem Domain / Category *
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Distributed Systems"
                                value={prob.category || prob.domain || ''}
                                onChange={e => {
                                  const copy = [...editingItem.problem_statements];
                                  copy[pIdx].category = e.target.value;
                                  copy[pIdx].domain = e.target.value;
                                  setEditingItem({ ...editingItem, problem_statements: copy });
                                }}
                                className="w-full px-3 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                                Problem Title *
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Sub-millisecond State Synchronization"
                                value={prob.title}
                                onChange={e => {
                                  const copy = [...editingItem.problem_statements];
                                  copy[pIdx].title = e.target.value;
                                  setEditingItem({ ...editingItem, problem_statements: copy });
                                }}
                                className="w-full px-3 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-secondary"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                              Technical Description / Objectives
                            </label>
                            <textarea
                              rows={2}
                              placeholder="Describe technical requirements, expected deliverable architecture, and constraints..."
                              value={prob.description}
                              onChange={e => {
                                const copy = [...editingItem.problem_statements];
                                copy[pIdx].description = e.target.value;
                                setEditingItem({ ...editingItem, problem_statements: copy });
                              }}
                              className="w-full px-3 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs leading-relaxed focus:outline-none focus:border-secondary"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'rules' && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-bold uppercase text-slate-400">
                        Competition Rules ({editingItem.rules?.length || 0} configured)
                      </label>
                      <span className="text-[10px] text-slate-500">One rule per line</span>
                    </div>
                    <textarea
                      rows={5}
                      value={(editingItem.rules || []).join('\n')}
                      onChange={e => {
                        const lines = e.target.value.split('\n').map(l => l.trim()).filter(Boolean);
                        setEditingItem({
                          ...editingItem,
                          rules: lines
                        });
                      }}
                      placeholder="Enter each rule on a new line...&#10;Teams must consist of 2 to 4 eligible developers.&#10;All code submissions must be licensed for architecture review.&#10;Pre-built closed solutions are disqualified."
                      className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed font-mono focus:outline-none focus:border-secondary"
                    />
                    <p className="text-[11px] text-slate-500">
                      Deleting all rules and saving will permanently remove them from the public page. No default rules will regenerate.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-bold uppercase text-slate-400">
                        Prizes & Recognition ({editingItem.prizes?.length || 0} configured)
                      </label>
                      <span className="text-[10px] text-slate-500">One prize tier per line</span>
                    </div>
                    <textarea
                      rows={5}
                      value={(editingItem.prizes || []).join('\n')}
                      onChange={e => {
                        const lines = e.target.value.split('\n').map(l => l.trim()).filter(Boolean);
                        setEditingItem({
                          ...editingItem,
                          prizes: lines
                        });
                      }}
                      placeholder="Enter each prize tier on a new line...&#10;1st Place: INR 5,00,000 + Incubation at Ravan Tech Park&#10;2nd Place: INR 2,50,000 + Cloud Computing Credits&#10;3rd Place: INR 1,00,000"
                      className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed font-mono focus:outline-none focus:border-secondary"
                    />
                    <p className="text-[11px] text-slate-500">
                      Deleting all prizes and saving will permanently remove them from the public page. No default prizes will regenerate.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Eligibility Criteria
                      </label>
                      <input
                        type="text"
                        value={editingItem.eligibility || ''}
                        onChange={e => setEditingItem({ ...editingItem, eligibility: e.target.value })}
                        placeholder="e.g. Open to developers and researchers worldwide."
                        className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Contact Info
                      </label>
                      <input
                        type="text"
                        value={editingItem.contact_info || ''}
                        onChange={e => setEditingItem({ ...editingItem, contact_info: e.target.value })}
                        placeholder="e.g. contact@ravantechnologies.in"
                        className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                      />
                    </div>
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
                className="px-5 py-2 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors flex items-center gap-1.5 shadow disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Event'}</span>
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
        aspectRatioLabel="4:3 (Standard)"
        targetBucket="ecosystem"
        targetFolder="hackathons"
        title="Crop Hackathon Banner / Hero Image"
        recommendedWidth={1200}
        recommendedHeight={900}
        recommendedNote="Authoritative 4:3 crop for Hackathon Hero & Home spotlight. Prevents image distortion and ensures crisp presentation across all retina screens."
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deleteTarget}
        itemTitle={deleteTarget?.title}
        itemType="Hackathon Event"
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
