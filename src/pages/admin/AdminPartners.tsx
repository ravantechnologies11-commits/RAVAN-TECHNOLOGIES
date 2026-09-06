import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { useToast } from '../../context/ToastContext';
import { PartnerItem } from '../../types';
import { initialPartners } from '../../data/initialData';
import { DeleteConfirmationModal } from '../../components/admin/DeleteConfirmationModal';
import { ImageCropModal, CropResult } from '../../components/admin/ImageCropModal';
import {
  Handshake,
  Plus,
  Trash2,
  Edit2,
  Save,
  Search,
  ExternalLink,
  Upload,
  X,
  ShieldCheck,
  CheckCircle2
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

export const AdminPartners: React.FC = () => {
  const { showToast } = useToast();
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal State
  const [editingItem, setEditingItem] = useState<PartnerItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Crop Modal
  const [isCropOpen, setIsCropOpen] = useState(false);

  // Delete Modal
  const [deleteTarget, setDeleteTarget] = useState<PartnerItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Saving state
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await dataService.getPartners();
      setPartners(data && data.length > 0 ? data : initialPartners);
    } catch (e) {
      console.error(e);
      showToast('Failed to load partners from database.', 'error');
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
    const newItem: PartnerItem = {
      id: 'partner-' + Date.now(),
      name: 'New Strategic Partner',
      category: 'technology',
      logo_url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&q=80&w=300',
      website_url: 'https://example.com',
      description: 'Strategic alliance in distributed computing and neural architectures.',
      display_order: partners.length + 1,
      status: 'published'
    };
    setEditingItem(newItem);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: PartnerItem) => {
    setEditingItem(JSON.parse(JSON.stringify(p)));
    setIsModalOpen(true);
  };

  const handleSaveModal = async () => {
    if (!editingItem) return;
    if (!editingItem.name.trim()) {
      showToast('Partner name is required.', 'info');
      return;
    }

    if (editingItem.website_url && !isValidHttpUrl(editingItem.website_url)) {
      showToast('Invalid website URL. Must begin with http:// or https://', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const exists = partners.some(p => p.id === editingItem.id);
      const updated = exists
        ? partners.map(p => (p.id === editingItem.id ? editingItem : p))
        : [editingItem, ...partners];

      setPartners(updated);
      await dataService.savePartners(updated);
      showToast('Partner record saved successfully.', 'success');
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (e) {
      console.error(e);
      showToast('Error saving partner.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const updated = partners.filter(p => p.id !== deleteTarget.id);
      setPartners(updated);
      await dataService.deletePartner(deleteTarget.id);
      showToast(`Deleted partner "${deleteTarget.name}".`, 'success');
      setDeleteTarget(null);
    } catch (e) {
      console.error(e);
      showToast('Failed to delete partner.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCropResult = (res: CropResult) => {
    if (!editingItem) return;
    setEditingItem({
      ...editingItem,
      logo_url: res.url
    });
    showToast('Partner logo updated.', 'success');
  };

  const filteredPartners = partners.filter(p => {
    const matchesSearch = (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
                          (p.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in font-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-[#0a192f] p-5 border border-slate-800 rounded-xl">
        <div>
          <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
            <Handshake className="w-5 h-5 text-secondary" />
            Strategic Alliances & Ecosystem Partners CMS
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage academic alliances, computing hardware partners, and enterprise consortiums.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Add Partner</span>
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search partners by name or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-secondary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
          >
            <option value="all">All Categories</option>
            <option value="technology">Technology Partners</option>
            <option value="academic">Academic Alliances</option>
            <option value="enterprise">Enterprise Consortiums</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 font-mono">Loading partners from Supabase...</div>
      ) : filteredPartners.length === 0 ? (
        <div className="p-12 bg-[#0a192f] border border-slate-800 rounded-xl text-center space-y-3">
          <Handshake className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm text-slate-400 font-semibold">No partners found.</p>
          <button
            onClick={handleOpenCreate}
            className="px-3 py-1.5 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase"
          >
            Add First Partner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map(p => (
            <div
              key={p.id}
              className="bg-[#0a192f] border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="px-2 py-0.5 bg-[#07111e] border border-slate-700 rounded text-[10px] font-bold text-secondary uppercase font-mono">
                    {p.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      p.status === 'published'
                        ? 'bg-emerald-950 border-emerald-500/40 text-emerald-400'
                        : 'bg-amber-950 border-amber-500/40 text-amber-400'
                    }`}
                  >
                    {p.status || 'published'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                    <img src={p.logo_url} alt={p.name} className="w-full h-full object-contain p-1" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">{p.name}</h3>
                    {p.website_url && (
                      <a
                        href={p.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-secondary hover:underline flex items-center gap-1 mt-0.5 font-mono"
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                        <span className="truncate max-w-[180px]">{p.website_url}</span>
                      </a>
                    )}
                  </div>
                </div>

                {p.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
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
                    title="Delete Partner"
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
            className="w-full max-w-xl bg-[#0a192f] border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          >
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#07111e]">
              <div>
                <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                  <Handshake className="w-5 h-5 text-secondary" />
                  {editingItem.id.startsWith('partner-') ? 'Add Ecosystem Partner' : 'Edit Partner Record'}
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
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Partner Name *
                </label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-secondary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Category</label>
                  <select
                    value={editingItem.category}
                    onChange={e => setEditingItem({ ...editingItem, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                  >
                    <option value="technology">Technology Partner</option>
                    <option value="academic">Academic Alliance</option>
                    <option value="enterprise">Enterprise Consortium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Status</label>
                  <select
                    value={editingItem.status || 'published'}
                    onChange={e => setEditingItem({ ...editingItem, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Partner Logo URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingItem.logo_url}
                    onChange={e => setEditingItem({ ...editingItem, logo_url: e.target.value })}
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Official Website URL (https://)
                  </label>
                  <input
                    type="text"
                    value={editingItem.website_url || ''}
                    onChange={e => setEditingItem({ ...editingItem, website_url: e.target.value })}
                    placeholder="https://partner-company.com"
                    className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                  />
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
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Partnership Scope / Description
                </label>
                <textarea
                  rows={3}
                  value={editingItem.description || ''}
                  onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Describe joint R&D projects, infrastructure sponsorship, or academic curriculum integration..."
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
                <span>{isSaving ? 'Saving...' : 'Save Partner'}</span>
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
        aspectRatioLabel="1:1 (Square)"
        targetBucket="media"
        targetFolder="partners"
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deleteTarget}
        itemTitle={deleteTarget?.name}
        itemType="Strategic Partner"
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
