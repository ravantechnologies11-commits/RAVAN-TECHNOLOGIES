import React, { useState, useEffect } from 'react';
import { dataService, generateSlug } from '../../lib/dataService';
import { useToast } from '../../context/ToastContext';
import { ServiceItem, ServiceFeature } from '../../types';
import { initialServices } from '../../data/initialData';
import { ImageCropModal, CropResult } from '../../components/admin/ImageCropModal';
import { DeleteConfirmationModal } from '../../components/admin/DeleteConfirmationModal';
import {
  Plus,
  Trash2,
  Upload,
  Save,
  Check,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Search,
  ArrowUp,
  ArrowDown,
  Globe,
  AlertCircle,
  Eye,
  EyeOff,
  RotateCcw,
  CheckCircle2,
  Cpu,
  Layers,
  ShieldCheck,
  Activity,
  Terminal,
  Zap,
  Cloud,
  Database,
  Network,
  Code,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';

const ICON_PRESETS = [
  { id: 'Cpu', label: 'CPU / Processing' },
  { id: 'Layers', label: 'Layers / Architecture' },
  { id: 'ShieldCheck', label: 'Shield / Security' },
  { id: 'Activity', label: 'Activity / Telemetry' },
  { id: 'Terminal', label: 'Terminal / CLI' },
  { id: 'Zap', label: 'Zap / Performance' },
  { id: 'Cloud', label: 'Cloud / Infrastructure' },
  { id: 'Database', label: 'Database / Storage' },
  { id: 'Network', label: 'Network / Mesh' },
  { id: 'Code', label: 'Code / Engineering' },
  { id: 'Sparkles', label: 'AI / Intelligence' },
  { id: 'Globe', label: 'Web / Platform' }
];

export const AdminServices: React.FC = () => {
  const { showToast } = useToast();
  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [originalServices, setOriginalServices] = useState<ServiceItem[]>(initialServices);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');

  // Active expanded item and tab per service
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTabs, setActiveTabs] = useState<Record<string, 'info' | 'media' | 'features' | 'tech' | 'seo'>>({});

  // Image crop modal state
  const [cropTargetIndex, setCropTargetIndex] = useState<number | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<ServiceItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // New technology tag input state per service
  const [newTechInputs, setNewTechInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    dataService.getServices().then(loaded => {
      setServices(loaded);
      setOriginalServices(JSON.parse(JSON.stringify(loaded)));
      if (loaded.length > 0 && !expandedId) {
        setExpandedId(loaded[0].id);
      }
    });
  }, []);

  const getActiveTab = (id: string): 'info' | 'media' | 'features' | 'tech' | 'seo' => {
    return activeTabs[id] || 'info';
  };

  const setActiveTab = (id: string, tab: 'info' | 'media' | 'features' | 'tech' | 'seo') => {
    setActiveTabs(prev => ({ ...prev, [id]: tab }));
  };

  const markChanged = () => {
    setHasUnsavedChanges(true);
  };

  // Reorder Services
  const moveService = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= services.length) return;

    const updated = [...services];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Recalculate display_order
    updated.forEach((srv, idx) => {
      srv.display_order = idx + 1;
    });

    setServices(updated);
    markChanged();
    showToast(`Moved ${temp.title} ${direction}.`, 'info');
  };

  // Toggle Publish Status
  const togglePublishStatus = (id: string) => {
    const updated = services.map(srv => {
      if (srv.id === id) {
        const nextStatus: 'draft' | 'published' | 'archived' = srv.status === 'published' ? 'draft' : 'published';
        return { ...srv, status: nextStatus };
      }
      return srv;
    });
    setServices(updated);
    markChanged();
    const item = updated.find(s => s.id === id);
    showToast(`Status for "${item?.title}" set to ${item?.status.toUpperCase()}.`, 'info');
  };

  // Add Service
  const addService = () => {
    const newId = 'srv-' + Date.now();
    const newService: ServiceItem = {
      id: newId,
      slug: 'service-' + Date.now(),
      title: 'New Enterprise Capability',
      code: `0${services.length + 1} // ENTERPRISE`,
      short_description: 'High-performance engineering capability designed for institutional scale.',
      full_description: 'Architecting robust, fault-tolerant infrastructure built on sovereign engineering protocols.',
      icon: 'Cpu',
      image_url: '',
      metric_value: '99.999%',
      metric_label: 'SLA UPTIME',
      features: [
        {
          title: 'Architectural Framework',
          description: 'Engineered for high-availability distributed operations.',
          icon: 'check_circle'
        }
      ],
      technologies: ['TypeScript', 'Rust', 'PostgreSQL'],
      benefits: ['Zero-latency execution', 'Deterministic data validation'],
      cta_text: 'VIEW SPECIFICATIONS',
      cta_url: '/contact',
      display_order: services.length + 1,
      status: 'published',
      seo_title: 'New Enterprise Capability — Services | Ravan Technologies',
      seo_description: 'High-performance engineering capability designed for institutional scale.'
    };

    const updated = [...services, newService];
    setServices(updated);
    setExpandedId(newId);
    markChanged();
    showToast('New service card created. Fill details and click SAVE.', 'success');
  };

  // Delete Service Confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await dataService.deleteService(deleteTarget.id);
      setServices(prev => prev.filter(s => s.id !== deleteTarget.id));
      showToast(`Permanently removed "${deleteTarget.title}" from database.`, 'success');
      setDeleteTarget(null);
      if (expandedId === deleteTarget.id) {
        setExpandedId(null);
      }
    } catch (err: any) {
      showToast(`Failed to delete service: ${err.message}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Image Crop Confirm
  const handleCropConfirm = (result: CropResult) => {
    if (cropTargetIndex === null) return;
    const updated = [...services];
    updated[cropTargetIndex].image_url = result.url;
    setServices(updated);
    markChanged();
    setCropTargetIndex(null);
    showToast(`Cover visual updated for ${updated[cropTargetIndex].title}.`, 'success');
  };

  // Add Technology Tag
  const handleAddTech = (serviceIndex: number, srvId: string) => {
    const val = (newTechInputs[srvId] || '').trim();
    if (!val) return;

    const updated = [...services];
    const currentTech = updated[serviceIndex].technologies || [];
    if (!currentTech.includes(val)) {
      updated[serviceIndex].technologies = [...currentTech, val];
      setServices(updated);
      markChanged();
    }
    setNewTechInputs(prev => ({ ...prev, [srvId]: '' }));
  };

  // Remove Technology Tag
  const handleRemoveTech = (serviceIndex: number, techToRemove: string) => {
    const updated = [...services];
    updated[serviceIndex].technologies = (updated[serviceIndex].technologies || []).filter(t => t !== techToRemove);
    setServices(updated);
    markChanged();
  };

  // Add Feature to Service
  const handleAddFeature = (serviceIndex: number) => {
    const updated = [...services];
    const currentFeatures = updated[serviceIndex].features || [];
    updated[serviceIndex].features = [
      ...currentFeatures,
      {
        title: 'New Core Feature',
        description: 'Detailed description of this functional capability.',
        icon: 'check_circle'
      }
    ];
    setServices(updated);
    markChanged();
  };

  // Remove Feature from Service
  const handleRemoveFeature = (serviceIndex: number, featureIndex: number) => {
    const updated = [...services];
    updated[serviceIndex].features = updated[serviceIndex].features.filter((_, fi) => fi !== featureIndex);
    setServices(updated);
    markChanged();
  };

  // Save All Services
  const handleSaveAll = async () => {
    // Validation
    for (const srv of services) {
      if (!srv.title?.trim()) {
        showToast('Every service must have a Title.', 'error');
        setExpandedId(srv.id);
        setActiveTab(srv.id, 'info');
        return;
      }
      if (!srv.short_description?.trim()) {
        showToast(`Please provide a Short Description for "${srv.title}".`, 'error');
        setExpandedId(srv.id);
        setActiveTab(srv.id, 'info');
        return;
      }
    }

    setIsSaving(true);
    try {
      await dataService.saveServices(services);
      setOriginalServices(JSON.parse(JSON.stringify(services)));
      setHasUnsavedChanges(false);
      setIsSaved(true);
      showToast('All services synchronized and saved to database.', 'success');
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err: any) {
      showToast(`Failed to save services: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Discard Changes
  const handleDiscard = () => {
    setServices(JSON.parse(JSON.stringify(originalServices)));
    setHasUnsavedChanges(false);
    showToast('Unsaved changes discarded.', 'info');
  };

  // Filtered List
  const filteredServices = services.filter(srv => {
    const matchesSearch = (srv.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (srv.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (srv.short_description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || srv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const publishedCount = services.filter(s => s.status === 'published').length;
  const draftCount = services.filter(s => s.status === 'draft').length;

  return (
    <div className="space-y-6 animate-fade-in font-body pb-20">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-[#0a192f] p-6 border border-slate-800 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold font-display text-white tracking-tight">
              Services & Capabilities
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-secondary/20 text-secondary border border-secondary/30">
              Database Managed
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Manage public services catalog, technical specifications, SLA benchmarks, repeatable features, and visual media.
          </p>
          <div className="flex items-center gap-3 mt-3 text-[11px] font-medium text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {publishedCount} Published
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              {draftCount} Draft
            </span>
            <span className="text-slate-600">•</span>
            <span>Total: {services.length}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {hasUnsavedChanges && (
            <button
              onClick={handleDiscard}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Discard</span>
            </button>
          )}

          <button
            onClick={addService}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <Plus className="w-4 h-4 text-secondary" />
            <span>+ Add Service</span>
          </button>

          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-6 py-2.5 bg-secondary text-[#0a192f] rounded-xl text-xs font-bold uppercase hover:bg-secondary-fixed transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 font-display tracking-wider"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0a192f] border-t-transparent rounded-full animate-spin" />
                <span>SAVING...</span>
              </>
            ) : isSaved ? (
              <>
                <Check className="w-4 h-4" />
                <span>SAVED!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>SAVE ALL SERVICES</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Dirty Warning Alert */}
      {hasUnsavedChanges && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between text-amber-300 text-xs animate-pulse">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>You have unsaved changes to the services catalog. Click <strong>SAVE ALL SERVICES</strong> to persist to the database.</span>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-[#0a192f] p-4 border border-slate-800 rounded-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search services by title, code, or description..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#07111e] border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-secondary"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Status:</span>
          {(['all', 'published', 'draft', 'archived'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${
                statusFilter === st
                  ? 'bg-secondary text-[#0a192f]'
                  : 'bg-[#07111e] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-4">
        {filteredServices.length === 0 ? (
          <div className="p-12 text-center bg-[#0a192f] border border-slate-800 rounded-2xl">
            <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">No Services Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
              No services match your current search query or filter. Click below to add a new service offering.
            </p>
            <button
              onClick={addService}
              className="px-4 py-2 bg-secondary text-[#0a192f] rounded-lg text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Service</span>
            </button>
          </div>
        ) : (
          filteredServices.map((srv, index) => {
            const actualIndex = services.findIndex(s => s.id === srv.id);
            const isExpanded = expandedId === srv.id;
            const currentTab = getActiveTab(srv.id);

            return (
              <div
                key={srv.id}
                className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? 'bg-[#0a192f] border-slate-700 shadow-xl'
                    : 'bg-[#0a192f]/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Header Row */}
                <div className="p-4 sm:p-5 flex items-center justify-between gap-3 select-none">
                  <div
                    className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : srv.id)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#07111e] border border-slate-700 flex items-center justify-center text-xs font-mono font-bold text-secondary shrink-0">
                      #{actualIndex + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-mono font-bold text-secondary tracking-wider uppercase">
                          {srv.code || `0${actualIndex + 1} // CAPABILITY`}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            srv.status === 'published'
                              ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-400'
                              : srv.status === 'draft'
                              ? 'bg-amber-950/80 border border-amber-500/40 text-amber-400'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {srv.status}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white truncate font-display mt-0.5">
                        {srv.title || 'Untitled Service'}
                      </h3>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveService(actualIndex, 'up')}
                      disabled={actualIndex === 0}
                      title="Move Up"
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#07111e] disabled:opacity-20 transition-colors"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveService(actualIndex, 'down')}
                      disabled={actualIndex === services.length - 1}
                      title="Move Down"
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#07111e] disabled:opacity-20 transition-colors"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => togglePublishStatus(srv.id)}
                      title={srv.status === 'published' ? 'Unpublish (set to Draft)' : 'Publish Service'}
                      className={`p-2 rounded-lg transition-colors ${
                        srv.status === 'published'
                          ? 'text-emerald-400 hover:bg-emerald-950/50'
                          : 'text-amber-400 hover:bg-amber-950/50'
                      }`}
                    >
                      {srv.status === 'published' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget(srv)}
                      title="Delete Service Permanently"
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : srv.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#07111e] transition-colors ml-1"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Form Details */}
                {isExpanded && (
                  <div className="border-t border-slate-800/80 p-5 sm:p-6 bg-[#07111e]/60 space-y-6">
                    {/* Module Tabs */}
                    <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
                      {[
                        { id: 'info', label: '1. Basic Info' },
                        { id: 'media', label: '2. Cover & Metrics' },
                        { id: 'features', label: `3. Features (${srv.features?.length || 0})` },
                        { id: 'tech', label: `4. Tech & CTA (${srv.technologies?.length || 0})` },
                        { id: 'seo', label: '5. SEO / SERP' }
                      ].map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setActiveTab(srv.id, t.id as any)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${
                            currentTab === t.id
                              ? 'bg-secondary text-[#0a192f] shadow'
                              : 'bg-[#0a192f] text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {/* TAB 1: BASIC INFO */}
                    {currentTab === 'info' && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="md:col-span-8">
                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                              Service Title <span className="text-rose-400">*</span>
                            </label>
                            <input
                              type="text"
                              value={srv.title}
                              onChange={e => {
                                const copy = [...services];
                                copy[actualIndex].title = e.target.value;
                                copy[actualIndex].slug = generateSlug(e.target.value);
                                setServices(copy);
                                markChanged();
                              }}
                              placeholder="e.g. Applied AI & Machine Learning"
                              className="w-full px-3.5 py-2 rounded-xl bg-[#0a192f] border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-secondary"
                            />
                          </div>

                          <div className="md:col-span-4">
                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                              Category / Code Tag
                            </label>
                            <input
                              type="text"
                              value={srv.code}
                              onChange={e => {
                                const copy = [...services];
                                copy[actualIndex].code = e.target.value;
                                setServices(copy);
                                markChanged();
                              }}
                              placeholder="e.g. 02 // SOVEREIGN INTELLIGENCE"
                              className="w-full px-3.5 py-2 rounded-xl bg-[#0a192f] border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-secondary"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                              Icon Style
                            </label>
                            <select
                              value={srv.icon || 'Cpu'}
                              onChange={e => {
                                const copy = [...services];
                                copy[actualIndex].icon = e.target.value;
                                setServices(copy);
                                markChanged();
                              }}
                              className="w-full px-3.5 py-2 rounded-xl bg-[#0a192f] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                            >
                              {ICON_PRESETS.map(ic => (
                                <option key={ic.id} value={ic.id}>{ic.label}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                              Display Order
                            </label>
                            <input
                              type="number"
                              value={srv.display_order}
                              onChange={e => {
                                const copy = [...services];
                                copy[actualIndex].display_order = parseInt(e.target.value) || 0;
                                setServices(copy);
                                markChanged();
                              }}
                              className="w-full px-3.5 py-2 rounded-xl bg-[#0a192f] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                              Publish Status
                            </label>
                            <select
                              value={srv.status}
                              onChange={e => {
                                const copy = [...services];
                                copy[actualIndex].status = e.target.value as any;
                                setServices(copy);
                                markChanged();
                              }}
                              className="w-full px-3.5 py-2 rounded-xl bg-[#0a192f] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                            >
                              <option value="published">Published (Visible on site)</option>
                              <option value="draft">Draft (Hidden publicly)</option>
                              <option value="archived">Archived (Stored internally)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                            Short Description / Value Proposition <span className="text-rose-400">*</span>
                          </label>
                          <textarea
                            rows={2}
                            value={srv.short_description}
                            onChange={e => {
                              const copy = [...services];
                              copy[actualIndex].short_description = e.target.value;
                              setServices(copy);
                              markChanged();
                            }}
                            placeholder="Brief summary rendered on service cards and meta previews..."
                            className="w-full px-3.5 py-2 rounded-xl bg-[#0a192f] border border-slate-700 text-white text-xs leading-relaxed focus:outline-none focus:border-secondary"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                            Full Detailed Technical Description
                          </label>
                          <textarea
                            rows={4}
                            value={srv.full_description}
                            onChange={e => {
                              const copy = [...services];
                              copy[actualIndex].full_description = e.target.value;
                              setServices(copy);
                              markChanged();
                            }}
                            placeholder="Comprehensive description detailing technical architecture, enterprise integration, and operational guarantees..."
                            className="w-full px-3.5 py-2 rounded-xl bg-[#0a192f] border border-slate-700 text-white text-xs leading-relaxed focus:outline-none focus:border-secondary"
                          />
                        </div>
                      </div>
                    )}

                    {/* TAB 2: MEDIA & METRICS */}
                    {currentTab === 'media' && (
                      <div className="space-y-5 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                          {/* Image Preview Box */}
                          <div className="md:col-span-5 bg-[#0a192f] p-4 rounded-xl border border-slate-800 space-y-3">
                            <label className="block text-[10px] font-bold uppercase text-slate-400">
                              Service Photographic Cover
                            </label>
                            {srv.image_url ? (
                              <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-slate-700 group">
                                <img
                                  src={srv.image_url}
                                  alt={srv.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                                  <button
                                    type="button"
                                    onClick={() => setCropTargetIndex(actualIndex)}
                                    className="px-3 py-1.5 bg-secondary text-[#0a192f] text-xs font-bold uppercase rounded shadow hover:bg-secondary-fixed"
                                  >
                                    Replace
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const copy = [...services];
                                      copy[actualIndex].image_url = '';
                                      setServices(copy);
                                      markChanged();
                                    }}
                                    className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold uppercase rounded shadow hover:bg-rose-700"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="aspect-[4/3] rounded-lg border-2 border-dashed border-slate-700 flex flex-col items-center justify-center p-6 text-center text-slate-500 bg-[#07111e]">
                                <ImageIcon className="w-8 h-8 mb-2 opacity-50 text-slate-400" />
                                <p className="text-xs font-medium">No image assigned</p>
                                <p className="text-[10px] text-slate-500 mt-1 mb-3">Aspect ratio 4:3 recommended</p>
                                <button
                                  type="button"
                                  onClick={() => setCropTargetIndex(actualIndex)}
                                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase rounded flex items-center gap-1.5 border border-slate-700 transition-colors"
                                >
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>Upload Image</span>
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Metric Benchmark */}
                          <div className="md:col-span-7 bg-[#0a192f] p-5 rounded-xl border border-slate-800 space-y-4">
                            <div>
                              <h4 className="text-xs font-bold uppercase text-white tracking-wider mb-1">
                                Key Metric Highlight Badge
                              </h4>
                              <p className="text-[11px] text-slate-400 leading-relaxed">
                                Renders on the frontend visual card with an active pulsing indicator.
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                                  Metric Value (e.g. 99.999% or 100/100)
                                </label>
                                <input
                                  type="text"
                                  value={srv.metric_value || ''}
                                  onChange={e => {
                                    const copy = [...services];
                                    copy[actualIndex].metric_value = e.target.value;
                                    setServices(copy);
                                    markChanged();
                                  }}
                                  placeholder="99.999%"
                                  className="w-full px-3.5 py-2 rounded-xl bg-[#07111e] border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-secondary"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                                  Metric Label (e.g. UPTIME SLA)
                                </label>
                                <input
                                  type="text"
                                  value={srv.metric_label || ''}
                                  onChange={e => {
                                    const copy = [...services];
                                    copy[actualIndex].metric_label = e.target.value;
                                    setServices(copy);
                                    markChanged();
                                  }}
                                  placeholder="UPTIME SLA"
                                  className="w-full px-3.5 py-2 rounded-xl bg-[#07111e] border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-secondary"
                                />
                              </div>
                            </div>

                            {srv.metric_value && (
                              <div className="p-3 rounded-lg bg-[#07111e] border border-slate-800 flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse shrink-0" />
                                <div>
                                  <div className="text-[10px] font-mono uppercase text-slate-400">
                                    {srv.metric_label || 'BENCHMARK'}
                                  </div>
                                  <div className="text-lg font-bold text-white font-display">
                                    {srv.metric_value}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 3: FEATURES REPEATER */}
                    {currentTab === 'features' && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-xs font-bold uppercase text-white tracking-wider">
                              Repeatable Service Features
                            </h4>
                            <p className="text-[11px] text-slate-400">
                              Highlights and technical capabilities displayed in bullet cards on the Services page.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddFeature(actualIndex)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 border border-slate-700 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5 text-secondary" />
                            <span>+ Add Feature</span>
                          </button>
                        </div>

                        <div className="space-y-3">
                          {(srv.features || []).map((feat, fi) => (
                            <div
                              key={fi}
                              className="p-4 bg-[#0a192f] border border-slate-800 rounded-xl space-y-3 relative group"
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-mono font-bold text-secondary uppercase tracking-wider">
                                  Feature #{fi + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFeature(actualIndex, fi)}
                                  className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                                  title="Remove feature"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                                <div className="sm:col-span-4">
                                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                                    Feature Title
                                  </label>
                                  <input
                                    type="text"
                                    value={feat.title}
                                    onChange={e => {
                                      const copy = [...services];
                                      copy[actualIndex].features[fi].title = e.target.value;
                                      setServices(copy);
                                      markChanged();
                                    }}
                                    placeholder="e.g. Systems Architecture"
                                    className="w-full px-3 py-1.5 rounded-lg bg-[#07111e] border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-secondary"
                                  />
                                </div>

                                <div className="sm:col-span-8">
                                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                                    Description
                                  </label>
                                  <input
                                    type="text"
                                    value={feat.description}
                                    onChange={e => {
                                      const copy = [...services];
                                      copy[actualIndex].features[fi].description = e.target.value;
                                      setServices(copy);
                                      markChanged();
                                    }}
                                    placeholder="Detailed specification of this feature..."
                                    className="w-full px-3 py-1.5 rounded-lg bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* TAB 4: TECHNOLOGIES & CTA */}
                    {currentTab === 'tech' && (
                      <div className="space-y-5 animate-fade-in">
                        {/* Technologies Tags */}
                        <div className="bg-[#0a192f] p-5 rounded-xl border border-slate-800 space-y-3">
                          <label className="block text-[10px] font-bold uppercase text-slate-400">
                            Technology Stack Tags
                          </label>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {(srv.technologies || []).map(tech => (
                              <span
                                key={tech}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#07111e] border border-slate-700 text-secondary text-xs font-semibold"
                              >
                                <span>{tech}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTech(actualIndex, tech)}
                                  className="text-slate-400 hover:text-rose-400 ml-1"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>

                          <div className="flex gap-2 max-w-md">
                            <input
                              type="text"
                              value={newTechInputs[srv.id] || ''}
                              onChange={e => setNewTechInputs({ ...newTechInputs, [srv.id]: e.target.value })}
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddTech(actualIndex, srv.id);
                                }
                              }}
                              placeholder="Add technology (e.g. PyTorch, Rust, Kafka)..."
                              className="flex-1 px-3 py-1.5 rounded-lg bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddTech(actualIndex, srv.id)}
                              className="px-4 py-1.5 bg-secondary text-[#0a192f] rounded-lg text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors"
                            >
                              Add
                            </button>
                          </div>
                        </div>

                        {/* Call To Action Buttons */}
                        <div className="bg-[#0a192f] p-5 rounded-xl border border-slate-800 space-y-4">
                          <h4 className="text-xs font-bold uppercase text-white tracking-wider">
                            Call to Action Configuration
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                                CTA Button Label
                              </label>
                              <input
                                type="text"
                                value={srv.cta_text || ''}
                                onChange={e => {
                                  const copy = [...services];
                                  copy[actualIndex].cta_text = e.target.value;
                                  setServices(copy);
                                  markChanged();
                                }}
                                placeholder="VIEW SPECIFICATIONS"
                                className="w-full px-3.5 py-2 rounded-xl bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                                CTA Target Destination URL
                              </label>
                              <input
                                type="text"
                                value={srv.cta_url || ''}
                                onChange={e => {
                                  const copy = [...services];
                                  copy[actualIndex].cta_url = e.target.value;
                                  setServices(copy);
                                  markChanged();
                                }}
                                placeholder="/contact"
                                className="w-full px-3.5 py-2 rounded-xl bg-[#07111e] border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-secondary"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 5: SEO / METADATA */}
                    {currentTab === 'seo' && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="bg-[#0a192f] p-5 rounded-xl border border-slate-800 space-y-4">
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                              Custom SEO Title
                            </label>
                            <input
                              type="text"
                              value={srv.seo_title || ''}
                              onChange={e => {
                                const copy = [...services];
                                copy[actualIndex].seo_title = e.target.value;
                                setServices(copy);
                                markChanged();
                              }}
                              placeholder={`${srv.title} — Services | Ravan Technologies`}
                              className="w-full px-3.5 py-2 rounded-xl bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                              Custom SEO Meta Description
                            </label>
                            <textarea
                              rows={2}
                              value={srv.seo_description || ''}
                              onChange={e => {
                                const copy = [...services];
                                copy[actualIndex].seo_description = e.target.value;
                                setServices(copy);
                                markChanged();
                              }}
                              placeholder={srv.short_description || 'Search engine snippet description...'}
                              className="w-full px-3.5 py-2 rounded-xl bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                            />
                          </div>

                          {/* SERP Preview */}
                          <div className="p-4 rounded-xl bg-[#07111e] border border-slate-800">
                            <div className="text-[10px] font-mono text-slate-500 uppercase mb-2">Google SERP Snippet Preview</div>
                            <div className="text-[#8ab4f8] text-sm font-medium hover:underline cursor-pointer truncate">
                              {srv.seo_title || `${srv.title} — Services | Ravan Technologies`}
                            </div>
                            <div className="text-emerald-400 text-xs font-mono truncate">
                              https://ravantechnologies.com/services#{srv.slug}
                            </div>
                            <div className="text-slate-400 text-xs mt-1 line-clamp-2 leading-relaxed">
                              {srv.seo_description || srv.short_description || 'Enterprise sovereign software architecture...'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Image Crop Modal */}
      {cropTargetIndex !== null && (
        <ImageCropModal
          isOpen={true}
          onClose={() => setCropTargetIndex(null)}
          onConfirm={handleCropConfirm}
          aspectRatioLabel="4:3 (Standard)"
          targetBucket="media"
          targetFolder="services"
          initialAltText={services[cropTargetIndex]?.title || 'Service visual'}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteTarget !== null}
        itemTitle={deleteTarget?.title}
        itemType="service"
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
