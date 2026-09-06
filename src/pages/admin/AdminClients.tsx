import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { useToast } from '../../context/ToastContext';
import { ClientItem } from '../../types';
import { initialClients } from '../../data/initialData';
import { DeleteConfirmationModal } from '../../components/admin/DeleteConfirmationModal';
import { ImageCropModal, CropResult } from '../../components/admin/ImageCropModal';
import {
  Building,
  Plus,
  Trash2,
  Edit2,
  Save,
  Search,
  ExternalLink,
  Upload,
  X,
  Briefcase
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

export const AdminClients: React.FC = () => {
  const { showToast } = useToast();
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');

  // Modal State
  const [editingItem, setEditingItem] = useState<ClientItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Crop Modal
  const [isCropOpen, setIsCropOpen] = useState(false);

  // Delete Modal
  const [deleteTarget, setDeleteTarget] = useState<ClientItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Saving state
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await dataService.getClients();
      setClients(data && data.length > 0 ? data : initialClients);
    } catch (e) {
      console.error(e);
      showToast('Failed to load clients from database.', 'error');
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
    const newItem: ClientItem = {
      id: 'client-' + Date.now(),
      name: 'Institutional Client',
      industry: 'Defense & Aerospace',
      logo_url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&q=80&w=300',
      description: 'Mission-critical real-time telemetry processing infrastructure.',
      website_url: 'https://example.com',
      project_reference: 'Sovereign Telemetry Engine v4',
      display_order: clients.length + 1,
      status: 'published'
    };
    setEditingItem(newItem);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: ClientItem) => {
    setEditingItem(JSON.parse(JSON.stringify(c)));
    setIsModalOpen(true);
  };

  const handleSaveModal = async () => {
    if (!editingItem) return;
    if (!editingItem.name.trim()) {
      showToast('Client name is required.', 'info');
      return;
    }

    if (editingItem.website_url && !isValidHttpUrl(editingItem.website_url)) {
      showToast('Invalid website URL. Must begin with http:// or https://', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const exists = clients.some(c => c.id === editingItem.id);
      const updated = exists
        ? clients.map(c => (c.id === editingItem.id ? editingItem : c))
        : [editingItem, ...clients];

      setClients(updated);
      await dataService.saveClients(updated);
      showToast('Client record saved successfully.', 'success');
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (e: any) {
      console.error('Error saving client record:', e);
      showToast(e?.message || 'Error saving client record.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const updated = clients.filter(c => c.id !== deleteTarget.id);
      setClients(updated);
      await dataService.deleteClient(deleteTarget.id);
      showToast(`Deleted client "${deleteTarget.name}".`, 'success');
      setDeleteTarget(null);
    } catch (e: any) {
      console.error('Failed to delete client:', e);
      showToast(e?.message || 'Failed to delete client.', 'error');
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
    showToast('Client logo updated.', 'success');
  };

  const industries = Array.from(new Set(clients.map(c => c.industry).filter(Boolean)));

  const filteredClients = clients.filter(c => {
    const matchesSearch = (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
                          (c.industry || '').toLowerCase().includes(search.toLowerCase()) ||
                          (c.project_reference || '').toLowerCase().includes(search.toLowerCase());
    const matchesIndustry = industryFilter === 'all' || c.industry === industryFilter;
    return matchesSearch && matchesIndustry;
  });

  return (
    <div className="space-y-6 animate-fade-in font-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-[#0a192f] p-5 border border-slate-800 rounded-xl">
        <div>
          <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-secondary" />
            Institutional Client Portfolio CMS
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage enterprise client endorsements, industry sectors, delivery references, and confidential badges.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Add Client</span>
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search clients by name, industry, or project..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-secondary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={industryFilter}
            onChange={e => setIndustryFilter(e.target.value)}
            className="px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
          >
            <option value="all">All Industries</option>
            {industries.map((ind, i) => (
              <option key={i} value={ind}>{ind}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 font-mono">Loading clients from Supabase...</div>
      ) : filteredClients.length === 0 ? (
        <div className="p-12 bg-[#0a192f] border border-slate-800 rounded-xl text-center space-y-3">
          <Building className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm text-slate-400 font-semibold">No client records found.</p>
          <button
            onClick={handleOpenCreate}
            className="px-3 py-1.5 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase"
          >
            Add First Client
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map(c => (
            <div
              key={c.id}
              className="bg-[#0a192f] border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="px-2 py-0.5 bg-[#07111e] border border-slate-700 rounded text-[10px] font-bold text-secondary uppercase font-mono">
                    {c.industry}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      c.status === 'published'
                        ? 'bg-emerald-950 border-emerald-500/40 text-emerald-400'
                        : 'bg-amber-950 border-amber-500/40 text-amber-400'
                    }`}
                  >
                    {c.status || 'published'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                    <img src={c.logo_url} alt={c.name} className="w-full h-full object-contain p-1" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">{c.name}</h3>
                    {c.project_reference && (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Briefcase className="w-3 h-3 text-secondary shrink-0" />
                        <span className="truncate max-w-[170px]">{c.project_reference}</span>
                      </span>
                    )}
                  </div>
                </div>

                {c.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="text-[10px] text-slate-500 font-mono">Order: {c.display_order ?? 1}</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setDeleteTarget(c)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                    title="Delete Client"
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
                  <Building className="w-5 h-5 text-secondary" />
                  {editingItem.id.startsWith('client-') ? 'Add Client Record' : 'Edit Client Record'}
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
                  Client Organization Name *
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
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Industry Sector</label>
                  <input
                    type="text"
                    value={editingItem.industry}
                    onChange={e => setEditingItem({ ...editingItem, industry: e.target.value })}
                    placeholder="e.g. Defense & Aerospace"
                    className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                  />
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
                  Client Logo URL
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
                    Project Reference / Scope Tag
                  </label>
                  <input
                    type="text"
                    value={editingItem.project_reference || ''}
                    onChange={e => setEditingItem({ ...editingItem, project_reference: e.target.value })}
                    placeholder="e.g. Sovereign Telemetry Engine v4"
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
                  Official Website URL (https://)
                </label>
                <input
                  type="text"
                  value={editingItem.website_url || ''}
                  onChange={e => setEditingItem({ ...editingItem, website_url: e.target.value })}
                  placeholder="https://client-company.com"
                  className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Engagement Description
                </label>
                <textarea
                  rows={3}
                  value={editingItem.description || ''}
                  onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Describe technical implementation, deliverables, or institutional achievements..."
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
                <span>{isSaving ? 'Saving...' : 'Save Client'}</span>
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
        targetFolder="clients"
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deleteTarget}
        itemTitle={deleteTarget?.name}
        itemType="Client Record"
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
