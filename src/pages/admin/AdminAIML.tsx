import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { useToast } from '../../context/ToastContext';
import { AIMLModel } from '../../types';
import { initialAIMLModels } from '../../data/initialData';
import { DeleteConfirmationModal } from '../../components/admin/DeleteConfirmationModal';
import { ImageCropModal, CropResult } from '../../components/admin/ImageCropModal';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Save,
  Search,
  Cpu,
  Zap,
  ExternalLink,
  Upload,
  X,
  Layers,
  Activity
} from 'lucide-react';

export const AdminAIML: React.FC = () => {
  const { showToast } = useToast();
  const [models, setModels] = useState<AIMLModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [editingItem, setEditingItem] = useState<AIMLModel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'specs' | 'capabilities'>('specs');

  // Crop Modal
  const [isCropOpen, setIsCropOpen] = useState(false);

  // Delete Modal
  const [deleteTarget, setDeleteTarget] = useState<AIMLModel | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Saving state
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await dataService.getAIMLModels();
      setModels(data && data.length > 0 ? data : initialAIMLModels);
    } catch (e) {
      console.error(e);
      showToast('Failed to load AI models from database.', 'error');
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
    const newItem: AIMLModel = {
      id: 'aiml-' + Date.now(),
      name: 'Ravan-Vision-Spatial-v1',
      provider: 'Ravan Technologies R&D',
      model_type: 'Multimodal Spatial Diffusion & NeRF',
      description: 'Zero-latency neural radiance field reconstruction and 3D volumetric inference engine for real-time virtual production.',
      capabilities: ['Real-time 3D Gaussian Splatting', 'Depth Estimation', 'Sub-millisecond Scene Synthesis'],
      use_cases: ['Cinematic Virtual Production', 'Industrial Digital Twins', 'Autonomous Robotics Navigation'],
      version: 'v1.2-enterprise',
      latency: '< 8ms per frame',
      documentation_url: 'https://ravantechnologies.com/solutions/ai-models',
      image_url: '',
      status: 'published',
      display_order: models.length + 1
    };
    setEditingItem(newItem);
    setActiveTab('specs');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: AIMLModel) => {
    setEditingItem(JSON.parse(JSON.stringify(m)));
    setActiveTab('specs');
    setIsModalOpen(true);
  };

  const handleSaveModal = async () => {
    if (!editingItem) return;
    if (!editingItem.name.trim()) {
      showToast('Model name is required.', 'info');
      return;
    }

    setIsSaving(true);
    try {
      const exists = models.some(m => m.id === editingItem.id);
      const updated = exists
        ? models.map(m => (m.id === editingItem.id ? editingItem : m))
        : [editingItem, ...models];

      setModels(updated);
      await dataService.saveAIMLModels(updated);
      showToast('AI/ML model specifications saved successfully.', 'success');
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (e: any) {
      console.error('Error saving AI/ML model:', e);
      showToast(e?.message || 'Error saving AI/ML model.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const updated = models.filter(m => m.id !== deleteTarget.id);
      setModels(updated);
      await dataService.deleteAIMLModel(deleteTarget.id);
      showToast(`Deleted AI model "${deleteTarget.name}".`, 'success');
      setDeleteTarget(null);
    } catch (e: any) {
      console.error('Failed to delete AI model:', e);
      showToast(e?.message || 'Failed to delete AI model.', 'error');
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
    showToast('Architecture diagram updated.', 'success');
  };

  const filteredModels = models.filter(m => {
    const matchesSearch = (m.name || '').toLowerCase().includes(search.toLowerCase()) ||
                          (m.model_type || '').toLowerCase().includes(search.toLowerCase()) ||
                          (m.provider || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in font-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-[#0a192f] p-5 border border-slate-800 rounded-xl">
        <div>
          <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-secondary" />
            Sovereign AI & ML Architectures
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure on-premise foundation models, private inference clusters, neural latency, and capabilities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Add Model</span>
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search models by name, architecture, or provider..."
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
            <option value="published">Deployed / Published</option>
            <option value="draft">Draft / Research</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 font-mono">Loading models from Supabase...</div>
      ) : filteredModels.length === 0 ? (
        <div className="p-12 bg-[#0a192f] border border-slate-800 rounded-xl text-center space-y-3">
          <Sparkles className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm text-slate-400 font-semibold">No AI models found.</p>
          <button
            onClick={handleOpenCreate}
            className="px-3 py-1.5 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase"
          >
            Deploy First Model
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredModels.map(m => (
            <div
              key={m.id}
              className="bg-[#0a192f] border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-secondary/20 border border-secondary/40 text-secondary text-[10px] font-mono font-bold rounded">
                        {m.version || 'v1.0'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          m.status === 'published'
                            ? 'bg-emerald-950 border-emerald-500/40 text-emerald-400'
                            : 'bg-amber-950 border-amber-500/40 text-amber-400'
                        }`}
                      >
                        {m.status === 'published' ? 'Deployed' : 'In Dev'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-secondary shrink-0" />
                      <span>{m.name}</span>
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-mono">Benchmark</span>
                    <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1 justify-end">
                      <Zap className="w-3 h-3 text-secondary" />
                      {m.latency || 'Sub-15ms'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {m.description}
                </p>

                <div className="p-2.5 bg-[#07111e] rounded-lg border border-slate-800/80 space-y-1 text-xs">
                  <div className="text-[11px] text-slate-400">
                    <span className="text-slate-500 font-mono">Architecture:</span> <strong className="text-white">{m.model_type}</strong>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    <span className="text-slate-500 font-mono">Provider:</span> <span className="text-secondary font-medium">{m.provider}</span>
                  </div>
                </div>

                {m.capabilities && m.capabilities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {m.capabilities.slice(0, 3).map((cap, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]">
                        {cap}
                      </span>
                    ))}
                    {m.capabilities.length > 3 && (
                      <span className="px-1.5 py-0.5 text-slate-500 text-[10px]">
                        +{m.capabilities.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="text-[10px] text-slate-500 font-mono">Order: {m.display_order ?? 1}</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(m)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setDeleteTarget(m)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                    title="Delete Model"
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
            className="w-full max-w-3xl bg-[#0a192f] border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#07111e]">
              <div>
                <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-secondary" />
                  {editingItem.id.startsWith('aiml-') ? 'Register AI/ML Model' : 'Edit Model Specifications'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure architecture type, latency metrics, and private cluster capabilities.
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
                onClick={() => setActiveTab('specs')}
                className={`pb-3 border-b-2 transition-colors ${
                  activeTab === 'specs'
                    ? 'border-secondary text-secondary'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Architecture Specs
              </button>
              <button
                onClick={() => setActiveTab('capabilities')}
                className={`pb-3 border-b-2 transition-colors ${
                  activeTab === 'capabilities'
                    ? 'border-secondary text-secondary'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Capabilities & Use Cases
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {activeTab === 'specs' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Model Name *
                      </label>
                      <input
                        type="text"
                        value={editingItem.name}
                        onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                        className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-secondary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Version
                      </label>
                      <input
                        type="text"
                        value={editingItem.version}
                        onChange={e => setEditingItem({ ...editingItem, version: e.target.value })}
                        placeholder="e.g. v2.4-enterprise"
                        className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Architecture / Model Type
                      </label>
                      <input
                        type="text"
                        value={editingItem.model_type}
                        onChange={e => setEditingItem({ ...editingItem, model_type: e.target.value })}
                        placeholder="e.g. Private Fine-Tuned Transformer"
                        className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Provider / Lab
                      </label>
                      <input
                        type="text"
                        value={editingItem.provider}
                        onChange={e => setEditingItem({ ...editingItem, provider: e.target.value })}
                        placeholder="e.g. Ravan Technologies R&D"
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
                        <option value="published">Deployed / Published</option>
                        <option value="draft">Draft / In Development</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Latency Metric</label>
                      <input
                        type="text"
                        value={editingItem.latency || ''}
                        onChange={e => setEditingItem({ ...editingItem, latency: e.target.value })}
                        placeholder="e.g. 12ms / token"
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Documentation / Benchmark URL
                      </label>
                      <input
                        type="text"
                        value={editingItem.documentation_url || ''}
                        onChange={e => setEditingItem({ ...editingItem, documentation_url: e.target.value })}
                        placeholder="https://ravantechnologies.com/docs/model"
                        className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Architecture Diagram / Image URL
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingItem.image_url || ''}
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
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Technical Description
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

              {activeTab === 'capabilities' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Capabilities & Technical Features (One per line)
                    </label>
                    <textarea
                      rows={5}
                      value={(editingItem.capabilities || []).join('\n')}
                      onChange={e =>
                        setEditingItem({
                          ...editingItem,
                          capabilities: e.target.value.split('\n').filter(Boolean)
                        })
                      }
                      placeholder="e.g. Sub-millisecond route recalculation&#10;Private on-premise weights&#10;Zero data exfiltration guarantee"
                      className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Enterprise Use Cases (One per line)
                    </label>
                    <textarea
                      rows={5}
                      value={(editingItem.use_cases || []).join('\n')}
                      onChange={e =>
                        setEditingItem({
                          ...editingItem,
                          use_cases: e.target.value.split('\n').filter(Boolean)
                        })
                      }
                      placeholder="e.g. Sovereign Banking Transactions&#10;Defense Simulation & Telemetry&#10;Healthcare Compliance Verification"
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
                <span>{isSaving ? 'Saving...' : 'Save Model'}</span>
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
        targetFolder="ai-models"
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deleteTarget}
        itemTitle={deleteTarget?.name}
        itemType="AI/ML Model"
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
