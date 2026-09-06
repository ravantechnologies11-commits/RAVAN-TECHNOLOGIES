import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { useToast } from '../../context/ToastContext';
import { HackathonItem, ProblemStatement } from '../../types';
import { initialHackathon } from '../../data/initialData';
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
  X
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
      setHackathons(data && data.length > 0 ? data : [initialHackathon]);
    } catch (e) {
      console.error(e);
      showToast('Failed to load hackathons from database.', 'error');
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
    const newItem: HackathonItem = {
      id: 'hackathon-' + Date.now(),
      title: 'National Enterprise Hackathon',
      edition: 'Edition ' + (hackathons.length + 1) + '.0',
      subtitle: 'Building Autonomous Systems & Sovereign AI',
      event_date: 'November 15-17, 2026',
      time: '09:00 AM - 06:00 PM IST',
      location: 'Ravan Tech Park, Thiruvannamalai & Virtual',
      registration_url: 'https://ravantechnologies.com/hackathons/register',
      status: 'upcoming',
      focus_statement: 'Solving mission-critical engineering bottlenecks through distributed computing.',
      description: 'Join top engineering talent to solve real-world problems in high-throughput data processing.',
      image_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200',
      banner_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200',
      solutions_deployed_count: '25+ Systems',
      tracks: [
        { id: 'trk-1', title: 'Sovereign AI', description: 'Fine-tuned LLM architectures and edge inference.' },
        { id: 'trk-2', title: 'High-Concurrency Systems', description: 'Fault-tolerant distributed transactional pipelines.' }
      ],
      problem_statements: [
        {
          id: 'prob-1',
          title: 'Sub-millisecond State Synchronization',
          category: 'Distributed Systems',
          description: 'Achieve deterministic state replication under simulated 30% packet loss.',
          complexity: 'Hard'
        }
      ],
      rules: [
        'Teams must consist of 2 to 4 eligible developers.',
        'All code submissions must be licensed or open for architecture review.',
        'Pre-built closed solutions are disqualified; boilerplate is allowed.'
      ],
      prizes: [
        '1st Place: INR 5,00,000 + Incubation at Ravan Tech Park',
        '2nd Place: INR 2,50,000 + Cloud Computing Credits',
        '3rd Place: INR 1,00,000'
      ],
      eligibility: 'Open to engineering students, senior developers, and independent researchers worldwide.',
      contact_info: 'hackathons@ravantechnologies.com',
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
      showToast('Event title is required.', 'info');
      return;
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
    } catch (e) {
      console.error(e);
      showToast('Error saving hackathon.', 'error');
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
    } catch (e) {
      console.error(e);
      showToast('Failed to delete hackathon.', 'error');
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
      title: 'New Engineering Challenge',
      category: 'System Architecture',
      description: 'Describe the problem statement and deliverable objectives...',
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
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Banner / Image URL
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingItem.banner_url || editingItem.image_url}
                          onChange={e => setEditingItem({ ...editingItem, banner_url: e.target.value, image_url: e.target.value })}
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400">
                      Problem statements presented to hackathon teams for enterprise evaluation.
                    </p>
                    <button
                      type="button"
                      onClick={handleAddProblem}
                      className="px-3 py-1.5 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Problem</span>
                    </button>
                  </div>

                  {(!editingItem.problem_statements || editingItem.problem_statements.length === 0) ? (
                    <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                      No problem statements registered yet. Click "Add Problem" to configure.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {editingItem.problem_statements.map((prob, pIdx) => (
                        <div key={prob.id || pIdx} className="p-4 bg-[#07111e] border border-slate-800 rounded-xl space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <input
                              type="text"
                              placeholder="Problem Title"
                              value={prob.title}
                              onChange={e => {
                                const copy = [...editingItem.problem_statements];
                                copy[pIdx].title = e.target.value;
                                setEditingItem({ ...editingItem, problem_statements: copy });
                              }}
                              className="flex-1 px-3 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs font-bold"
                            />
                            <select
                              value={prob.complexity}
                              onChange={e => {
                                const copy = [...editingItem.problem_statements];
                                copy[pIdx].complexity = e.target.value as any;
                                setEditingItem({ ...editingItem, problem_statements: copy });
                              }}
                              className="px-3 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs"
                            >
                              <option value="Easy">Easy</option>
                              <option value="Medium">Medium</option>
                              <option value="Hard">Hard</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => handleRemoveProblem(pIdx)}
                              className="p-1.5 text-slate-500 hover:text-rose-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <input
                                type="text"
                                placeholder="Category (e.g. Distributed Systems)"
                                value={prob.category}
                                onChange={e => {
                                  const copy = [...editingItem.problem_statements];
                                  copy[pIdx].category = e.target.value;
                                  setEditingItem({ ...editingItem, problem_statements: copy });
                                }}
                                className="w-full px-3 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <textarea
                                rows={2}
                                placeholder="Problem statement technical requirements..."
                                value={prob.description}
                                onChange={e => {
                                  const copy = [...editingItem.problem_statements];
                                  copy[pIdx].description = e.target.value;
                                  setEditingItem({ ...editingItem, problem_statements: copy });
                                }}
                                className="w-full px-3 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'rules' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Competition Rules (One rule per line)
                    </label>
                    <textarea
                      rows={4}
                      value={(editingItem.rules || []).join('\n')}
                      onChange={e =>
                        setEditingItem({
                          ...editingItem,
                          rules: e.target.value.split('\n').filter(Boolean)
                        })
                      }
                      className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Prizes & Recognition (One prize tier per line)
                    </label>
                    <textarea
                      rows={4}
                      value={(editingItem.prizes || []).join('\n')}
                      onChange={e =>
                        setEditingItem({
                          ...editingItem,
                          prizes: e.target.value.split('\n').filter(Boolean)
                        })
                      }
                      className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed font-mono"
                    />
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
                        className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs"
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
                        className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs"
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
                className="px-5 py-2 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors flex items-center gap-1.5 shadow"
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
        aspectRatioLabel="16:9 (Landscape)"
        targetBucket="ecosystem"
        targetFolder="hackathons"
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
