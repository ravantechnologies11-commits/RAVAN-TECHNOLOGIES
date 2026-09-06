import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { useToast } from '../../context/ToastContext';
import { EventItem } from '../../types';
import { initialEvents } from '../../data/initialData';
import { DeleteConfirmationModal } from '../../components/admin/DeleteConfirmationModal';
import { ImageCropModal, CropResult } from '../../components/admin/ImageCropModal';
import {
  Calendar,
  Plus,
  Trash2,
  Edit2,
  Save,
  Search,
  MapPin,
  ExternalLink,
  Upload,
  X
} from 'lucide-react';

const isValidHttpUrl = (urlStr: string): boolean => {
  if (!urlStr || !urlStr.trim()) return true;
  const lower = urlStr.trim().toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
    return false;
  }
  try {
    const url = new URL(urlStr.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

export const AdminEvents: React.FC = () => {
  const { showToast } = useToast();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [editingItem, setEditingItem] = useState<EventItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Crop Modal
  const [isCropOpen, setIsCropOpen] = useState(false);

  // Delete Modal
  const [deleteTarget, setDeleteTarget] = useState<EventItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Saving state
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await dataService.getEvents();
      setEvents(data && data.length > 0 ? data : initialEvents);
    } catch (e) {
      console.error(e);
      showToast('Failed to load events from database.', 'error');
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
    const newItem: EventItem = {
      id: 'event-' + Date.now(),
      title: 'Global Sovereign Computing Summit',
      slug: 'global-sovereign-computing-summit',
      event_type: 'summit',
      event_date: 'December 10, 2026',
      location: 'Ravan Tech Park Amphitheatre, Thiruvannamalai, Tamil Nadu, India',
      description: 'Annual gathering of enterprise architects, AI researchers, and sovereign infrastructure leaders.',
      image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200',
      registration_link: 'https://ravantechnologies.com/events/summit',
      status: 'upcoming'
    };
    setEditingItem(newItem);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (e: EventItem) => {
    setEditingItem(JSON.parse(JSON.stringify(e)));
    setIsModalOpen(true);
  };

  const handleSaveModal = async () => {
    if (!editingItem) return;
    if (!editingItem.title.trim()) {
      showToast('Event title is required.', 'info');
      return;
    }

    if (editingItem.registration_link && !isValidHttpUrl(editingItem.registration_link)) {
      showToast('Registration URL must start with http:// or https://', 'error');
      return;
    }

    if (!editingItem.slug.trim()) {
      editingItem.slug = slugify(editingItem.title);
    }

    setIsSaving(true);
    try {
      const exists = events.some(e => e.id === editingItem.id);
      const updated = exists
        ? events.map(e => (e.id === editingItem.id ? editingItem : e))
        : [editingItem, ...events];

      setEvents(updated);
      await dataService.saveEvents(updated);
      showToast('Event schedule saved successfully.', 'success');
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err: any) {
      console.error('Error saving event:', err);
      showToast(err?.message || 'Error saving event.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const updated = events.filter(e => e.id !== deleteTarget.id);
      setEvents(updated);
      await dataService.deleteEvent(deleteTarget.id);
      showToast(`Deleted event "${deleteTarget.title}".`, 'success');
      setDeleteTarget(null);
    } catch (err: any) {
      console.error('Failed to delete event:', err);
      showToast(err?.message || 'Failed to delete event.', 'error');
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
    showToast('Event banner image updated.', 'success');
  };

  const filteredEvents = events.filter(e => {
    const matchesSearch = (e.title || '').toLowerCase().includes(search.toLowerCase()) ||
                          (e.location || '').toLowerCase().includes(search.toLowerCase()) ||
                          (e.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in font-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-[#0a192f] p-5 border border-slate-800 rounded-xl">
        <div>
          <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-secondary" />
            Summits, Keynotes & Global Events CMS
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Schedule technical summits, pitch days, hackathon ceremonies, and architectural conferences.
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
            placeholder="Search events by title, venue, or description..."
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
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 font-mono">Loading events from Supabase...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-12 bg-[#0a192f] border border-slate-800 rounded-xl text-center space-y-3">
          <Calendar className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm text-slate-400 font-semibold">No events scheduled.</p>
          <button
            onClick={handleOpenCreate}
            className="px-3 py-1.5 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase"
          >
            Create First Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map(evt => (
            <div
              key={evt.id}
              className="bg-[#0a192f] border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg group"
            >
              <div>
                <div className="h-36 relative overflow-hidden bg-slate-900">
                  <img
                    src={evt.image_url}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f] via-transparent to-black/40" />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#0a192f]/90 border border-slate-700 rounded text-[10px] font-bold text-secondary uppercase font-mono">
                      {evt.event_type}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        evt.status === 'upcoming'
                          ? 'bg-blue-950 border-blue-500/40 text-blue-400'
                          : evt.status === 'ongoing'
                          ? 'bg-emerald-950 border-emerald-500/40 text-emerald-400 animate-pulse'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      {evt.status}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="text-base font-bold text-white leading-snug">{evt.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{evt.description}</p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px] text-slate-300 font-mono">
                    <div className="flex items-center gap-1.5 truncate">
                      <Calendar className="w-3.5 h-3.5 text-secondary shrink-0" />
                      <span className="truncate">{evt.event_date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
                      <span className="truncate">{evt.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 bg-[#07111e] border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="text-[10px] text-slate-500 font-mono truncate max-w-[180px]">
                  /{evt.slug}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(evt)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setDeleteTarget(evt)}
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
            className="w-full max-w-2xl bg-[#0a192f] border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          >
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#07111e]">
              <div>
                <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-secondary" />
                  {editingItem.id.startsWith('event-') ? 'Schedule Global Event' : 'Edit Event Record'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Event Title *</label>
                <input
                  type="text"
                  value={editingItem.title}
                  onChange={e => setEditingItem({
                    ...editingItem,
                    title: e.target.value,
                    slug: editingItem.id.startsWith('event-') ? slugify(e.target.value) : editingItem.slug
                  })}
                  className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-secondary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Event Type</label>
                  <select
                    value={editingItem.event_type}
                    onChange={e => setEditingItem({ ...editingItem, event_type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                  >
                    <option value="summit">Summit</option>
                    <option value="keynote">Keynote</option>
                    <option value="webinar">Webinar</option>
                    <option value="workshop">Workshop</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Status</label>
                  <select
                    value={editingItem.status}
                    onChange={e => setEditingItem({ ...editingItem, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Event Date</label>
                  <input
                    type="text"
                    value={editingItem.event_date}
                    onChange={e => setEditingItem({ ...editingItem, event_date: e.target.value })}
                    placeholder="e.g. December 10, 2026"
                    className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Venue / Location</label>
                <input
                  type="text"
                  value={editingItem.location}
                  onChange={e => setEditingItem({ ...editingItem, location: e.target.value })}
                  placeholder="Ravan Tech Park Amphitheatre, Thiruvannamalai, Tamil Nadu, India"
                  className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Event Banner Image URL</label>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={editingItem.slug}
                    onChange={e => setEditingItem({ ...editingItem, slug: slugify(e.target.value) })}
                    className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-secondary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Registration Link</label>
                  <input
                    type="text"
                    value={editingItem.registration_link || ''}
                    onChange={e => setEditingItem({ ...editingItem, registration_link: e.target.value })}
                    placeholder="https://ravantechnologies.com/events/register"
                    className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Event Description</label>
                <textarea
                  rows={4}
                  value={editingItem.description}
                  onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed focus:outline-none focus:border-secondary"
                />
              </div>
            </div>

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
        targetBucket="media"
        targetFolder="events"
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deleteTarget}
        itemTitle={deleteTarget?.title}
        itemType="Event Schedule"
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
