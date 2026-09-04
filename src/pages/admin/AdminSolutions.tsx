import React, { useState, useEffect } from 'react';
import { dataService, generateSlug } from '../../lib/dataService';
import { useToast } from '../../context/ToastContext';
import { SolutionItem } from '../../types';
import { initialSolutions } from '../../data/initialData';
import { ImageCropModal, CropResult } from '../../components/admin/ImageCropModal';
import { DeleteConfirmationModal } from '../../components/admin/DeleteConfirmationModal';
import {
  Plus,
  Trash2,
  Upload,
  Save,
  Check,
  Layers,
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
  { id: 'Layers', label: 'Layers / Architecture' },
  { id: 'Cpu', label: 'CPU / Processing' },
  { id: 'ShieldCheck', label: 'Shield / Security' },
  { id: 'Activity', label: 'Activity / Telemetry' },
  { id: 'Terminal', label: 'Terminal / CLI' },
  { id: 'Zap', label: 'Zap / Low-Latency' },
  { id: 'Cloud', label: 'Cloud / Sovereign Infrastructure' },
  { id: 'Database', label: 'Database / Storage Ledger' },
  { id: 'Network', label: 'Network / Decentralized Mesh' },
  { id: 'Sparkles', label: 'AI / Cognitive Engine' }
];

export const AdminSolutions: React.FC = () => {
  const { showToast } = useToast();
  const [solutions, setSolutions] = useState<SolutionItem[]>(initialSolutions);
  const [originalSolutions, setOriginalSolutions] = useState<SolutionItem[]>(initialSolutions);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');

  // Active expanded item and tab per solution
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTabs, setActiveTabs] = useState<Record<string, 'info' | 'challenge' | 'benefits' | 'media' | 'seo'>>({});

  // Image crop modal state
  const [cropTargetIndex, setCropTargetIndex] = useState<number | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<SolutionItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // New technology tag input state per solution
  const [newTechInputs, setNewTechInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    dataService.getSolutions().then(loaded => {
      setSolutions(loaded);
      setOriginalSolutions(JSON.parse(JSON.stringify(loaded)));
      if (loaded.length > 0 && !expandedId) {
        setExpandedId(loaded[0].id);
      }
    });
  }, []);

  const getActiveTab = (id: string): 'info' | 'challenge' | 'benefits' | 'media' | 'seo' => {
    return activeTabs[id] || 'info';
  };

  const setActiveTab = (id: string, tab: 'info' | 'challenge' | 'benefits' | 'media' | 'seo') => {
    setActiveTabs(prev => ({ ...prev, [id]: tab }));
  };

  const markChanged = () => {
    setHasUnsavedChanges(true);
  };

  // Reorder Solutions
  const moveSolution = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= solutions.length) return;

    const updated = [...solutions];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    updated.forEach((sol, idx) => {
      sol.display_order = idx + 1;
    });

    setSolutions(updated);
    markChanged();
    showToast(`Moved ${temp.title} ${direction}.`, 'info');
  };

  // Toggle Publish Status
  const togglePublishStatus = (id: string) => {
    const updated = solutions.map(sol => {
      if (sol.id === id) {
        const nextStatus: 'draft' | 'published' | 'archived' = sol.status === 'published' ? 'draft' : 'published';
        return { ...sol, status: nextStatus };
      }
      return sol;
    });
    setSolutions(updated);
    markChanged();
    const item = updated.find(s => s.id === id);
    showToast(`Status for "${item?.title}" set to ${item?.status.toUpperCase()}.`, 'info');
  };

  // Add Solution
  const addSolution = () => {
    const newId = 'sol-' + Date.now();
    const newSolution: SolutionItem = {
      id: newId,
      slug: 'solution-' + Date.now(),
      title: 'New Sovereign Architectural Blueprint',
      category: 'Applied AI',
      description: 'Pre-validated architectural framework designed for extreme scale and sovereign operations.',
      architecture_details: 'Runs isolated open-weights LLMs on dedicated bare-metal GPU clusters with differential privacy layers.',
      problem: 'Enterprise data sovereignty and low-latency regulatory compliance bottlenecks.',
      solution: 'Deterministic air-gapped cognitive engine with sub-millisecond cryptographic validation.',
      benefits: [
        'Absolute data sovereignty with zero telemetry leakage',
        'Deterministic transaction auditing and verifiable ledger state',
        'Sub-50 microsecond execution latency'
      ],
      technologies: ['PyTorch', 'Rust', 'CUDA', 'PostgreSQL'],
      image_url: '',
      icon: 'Layers',
      cta_text: 'REQUEST BLUEPRINT SPECS',
      cta_url: '/contact',
      display_order: solutions.length + 1,
      status: 'published',
      seo_title: 'New Sovereign Architectural Blueprint — Solutions | Ravan Technologies',
      seo_description: 'Pre-validated architectural framework designed for extreme scale and sovereign operations.'
    };

    const updated = [...solutions, newSolution];
    setSolutions(updated);
    setExpandedId(newId);
    markChanged();
    showToast('New blueprint card created. Fill details and click SAVE.', 'success');
  };

  // Delete Solution Confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await dataService.deleteSolution(deleteTarget.id);
      setSolutions(prev => prev.filter(s => s.id !== deleteTarget.id));
      showToast(`Permanently removed "${deleteTarget.title}" from database.`, 'success');
      setDeleteTarget(null);
      if (expandedId === deleteTarget.id) {
        setExpandedId(null);
      }
    } catch (err: any) {
      showToast(`Failed to delete solution: ${err.message}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Image Crop Confirm
  const handleCropConfirm = (result: CropResult) => {
    if (cropTargetIndex === null) return;
    const updated = [...solutions];
    updated[cropTargetIndex].image_url = result.url;
    setSolutions(updated);
    markChanged();
    setCropTargetIndex(null);
    showToast(`Cover visual updated for ${updated[cropTargetIndex].title}.`, 'success');
  };

  // Add Key Benefit
  const handleAddBenefit = (solutionIndex: number) => {
    const updated = [...solutions];
    const currentBenefits = updated[solutionIndex].benefits || [];
    updated[solutionIndex].benefits = [...currentBenefits, 'New verified enterprise advantage'];
    setSolutions(updated);
    markChanged();
  };

  // Update Key Benefit
  const handleUpdateBenefit = (solutionIndex: number, benefitIndex: number, text: string) => {
    const updated = [...solutions];
    updated[solutionIndex].benefits[benefitIndex] = text;
    setSolutions(updated);
    markChanged();
  };

  // Remove Key Benefit
  const handleRemoveBenefit = (solutionIndex: number, benefitIndex: number) => {
    const updated = [...solutions];
    updated[solutionIndex].benefits = updated[solutionIndex].benefits.filter((_, bi) => bi !== benefitIndex);
    setSolutions(updated);
    markChanged();
  };

  // Add Technology Tag
  const handleAddTech = (solutionIndex: number, solId: string) => {
    const val = (newTechInputs[solId] || '').trim();
    if (!val) return;

    const updated = [...solutions];
    const currentTech = updated[solutionIndex].technologies || [];
    if (!currentTech.includes(val)) {
      updated[solutionIndex].technologies = [...currentTech, val];
      setSolutions(updated);
      markChanged();
    }
    setNewTechInputs(prev => ({ ...prev, [solId]: '' }));
  };

  // Remove Technology Tag
  const handleRemoveTech = (solutionIndex: number, techToRemove: string) => {
    const updated = [...solutions];
    updated[solutionIndex].technologies = (updated[solutionIndex].technologies || []).filter(t => t !== techToRemove);
    setSolutions(updated);
    markChanged();
  };

  // Save All Solutions
  const handleSaveAll = async () => {
    for (const sol of solutions) {
      if (!sol.title?.trim()) {
        showToast('Every blueprint must have a Title.', 'error');
        setExpandedId(sol.id);
        setActiveTab(sol.id, 'info');
        return;
      }
      if (!sol.description?.trim()) {
        showToast(`Please provide a Short Summary for "${sol.title}".`, 'error');
        setExpandedId(sol.id);
        setActiveTab(sol.id, 'info');
        return;
      }
      if (!sol.architecture_details?.trim()) {
        showToast(`Please provide Architecture Specifications for "${sol.title}".`, 'error');
        setExpandedId(sol.id);
        setActiveTab(sol.id, 'info');
        return;
      }
    }

    setIsSaving(true);
    try {
      await dataService.saveSolutions(solutions);
      setOriginalSolutions(JSON.parse(JSON.stringify(solutions)));
      setHasUnsavedChanges(false);
      setIsSaved(true);
      showToast('All solutions blueprints saved to Supabase.', 'success');
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err: any) {
      showToast(`Failed to save solutions: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Discard Changes
  const handleDiscard = () => {
    setSolutions(JSON.parse(JSON.stringify(originalSolutions)));
    setHasUnsavedChanges(false);
    showToast('Unsaved changes discarded.', 'info');
  };

  // Filtered List
  const filteredSolutions = solutions.filter(sol => {
    const matchesSearch = (sol.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (sol.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (sol.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sol.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const publishedCount = solutions.filter(s => s.status === 'published').length;
  const draftCount = solutions.filter(s => s.status === 'draft').length;

  return (
    <div className="space-y-6 animate-fade-in font-body pb-20">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-[#0a192f] p-6 border border-slate-800 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold font-display text-white tracking-tight">
              Solutions & Architectural Blueprints
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-secondary/20 text-secondary border border-secondary/30">
              Database Managed
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Configure institutional blueprints, technical problem/solution paradigms, key benefits, technology stacks, and photography.
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
            <span>Total: {solutions.length}</span>
          </div>
        </div>

        {/* Header Action Buttons */}
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
            onClick={addSolution}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <Plus className="w-4 h-4 text-secondary" />
            <span>+ Add Solution</span>
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
                <span>SAVE SOLUTIONS</span>
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
            <span>You have unsaved changes to the solutions catalog. Click <strong>SAVE SOLUTIONS</strong> to persist to the database.</span>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-[#0a192f] p-4 border border-slate-800 rounded-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search blueprints by title, category, or specifications..."
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

      {/* Solutions List */}
      <div className="space-y-4">
        {filteredSolutions.length === 0 ? (
          <div className="p-12 text-center bg-[#0a192f] border border-slate-800 rounded-2xl">
            <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">No Solutions Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
              No solutions blueprints match your search. Click below to add a new blueprint.
            </p>
            <button
              onClick={addSolution}
              className="px-4 py-2 bg-secondary text-[#0a192f] rounded-lg text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Solution</span>
            </button>
          </div>
        ) : (
          filteredSolutions.map((sol, index) => {
            const actualIndex = solutions.findIndex(s => s.id === sol.id);
            const isExpanded = expandedId === sol.id;
            const currentTab = getActiveTab(sol.id);

            return (
              <div
                key={sol.id}
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
                    onClick={() => setExpandedId(isExpanded ? null : sol.id)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#07111e] border border-slate-700 flex items-center justify-center text-xs font-mono font-bold text-secondary shrink-0">
                      #{actualIndex + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-mono font-bold text-secondary tracking-wider uppercase">
                          {sol.category || 'ENTERPRISE'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            sol.status === 'published'
                              ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-400'
                              : sol.status === 'draft'
                              ? 'bg-amber-950/80 border border-amber-500/40 text-amber-400'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {sol.status}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white truncate font-display mt-0.5">
                        {sol.title || 'Untitled Blueprint'}
                      </h3>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveSolution(actualIndex, 'up')}
                      disabled={actualIndex === 0}
                      title="Move Up"
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#07111e] disabled:opacity-20 transition-colors"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSolution(actualIndex, 'down')}
                      disabled={actualIndex === solutions.length - 1}
                      title="Move Down"
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#07111e] disabled:opacity-20 transition-colors"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => togglePublishStatus(sol.id)}
                      title={sol.status === 'published' ? 'Unpublish (set to Draft)' : 'Publish Solution'}
                      className={`p-2 rounded-lg transition-colors ${
                        sol.status === 'published'
                          ? 'text-emerald-400 hover:bg-emerald-950/50'
                          : 'text-amber-400 hover:bg-amber-950/50'
                      }`}
                    >
                      {sol.status === 'published' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget(sol)}
                      title="Delete Solution Blueprint Permanently"
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : sol.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#07111e] transition-colors ml-1"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Form Details */}
                {isExpanded && (
                  <div className="border-t border-slate-800/80 p-5 sm:p-6 bg-[#07111e]/60 space-y-6">
                    {/* Tabs */}
                    <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
                      {[
                        { id: 'info', label: '1. Blueprint Specs' },
                        { id: 'challenge', label: '2. Problem & Impact' },
                        { id: 'benefits', label: `3. Key Benefits (${sol.benefits?.length || 0})` },
                        { id: 'media', label: '4. Visual & Tech Stack' },
                        { id: 'seo', label: '5. CTA & SEO' }
                      ].map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setActiveTab(sol.id, t.id as any)}
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

                    {/* TAB 1: BLUEPRINT SPECS */}
                    {currentTab === 'info' && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="md:col-span-8">
                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                              Blueprint Title <span className="text-rose-400">*</span>
                            </label>
                            <input
                              type="text"
                              value={sol.title}
                              onChange={e => {
                                const copy = [...solutions];
                                copy[actualIndex].title = e.target.value;
                                copy[actualIndex].slug = generateSlug(e.target.value);
                                setSolutions(copy);
                                markChanged();
                              }}
                              placeholder="e.g. Sovereign AI & Data Governance Framework"
                              className="w-full px-3.5 py-2 rounded-xl bg-[#0a192f] border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-secondary"
                            />
                          </div>

                          <div className="md:col-span-4">
                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                              Sector Category
                            </label>
                            <input
                              type="text"
                              value={sol.category}
                              onChange={e => {
                                const copy = [...solutions];
                                copy[actualIndex].category = e.target.value;
                                setSolutions(copy);
                                markChanged();
                              }}
                              placeholder="e.g. Applied AI, Distributed Systems"
                              className="w-full px-3.5 py-2 rounded-xl bg-[#0a192f] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                              Icon Representation
                            </label>
                            <select
                              value={sol.icon || 'Layers'}
                              onChange={e => {
                                const copy = [...solutions];
                                copy[actualIndex].icon = e.target.value;
                                setSolutions(copy);
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
                              value={sol.display_order}
                              onChange={e => {
                                const copy = [...solutions];
                                copy[actualIndex].display_order = parseInt(e.target.value) || 0;
                                setSolutions(copy);
                                markChanged();
                              }}
                              className="w-full px-3.5 py-2 rounded-xl bg-[#0a192f] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                              Status
                            </label>
                            <select
                              value={sol.status}
                              onChange={e => {
                                const copy = [...solutions];
                                copy[actualIndex].status = e.target.value as any;
                                setSolutions(copy);
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
                            Short Summary <span className="text-rose-400">*</span>
                          </label>
                          <textarea
                            rows={2}
                            value={sol.description}
                            onChange={e => {
                              const copy = [...solutions];
                              copy[actualIndex].description = e.target.value;
                              setSolutions(copy);
                              markChanged();
                            }}
                            placeholder="Executive summary of this architectural blueprint..."
                            className="w-full px-3.5 py-2 rounded-xl bg-[#0a192f] border border-slate-700 text-white text-xs leading-relaxed focus:outline-none focus:border-secondary"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                            Architecture Specifications (Technical Specifications) <span className="text-rose-400">*</span>
                          </label>
                          <textarea
                            rows={4}
                            value={sol.architecture_details}
                            onChange={e => {
                              const copy = [...solutions];
                              copy[actualIndex].architecture_details = e.target.value;
                              setSolutions(copy);
                              markChanged();
                            }}
                            placeholder="Detailed technical topology: GPU clustering, differential privacy, kernel bypass, ledger consensus..."
                            className="w-full px-3.5 py-2 rounded-xl bg-[#0a192f] border border-slate-700 text-white text-xs font-mono leading-relaxed focus:outline-none focus:border-secondary"
                          />
                        </div>
                      </div>
                    )}

                    {/* TAB 2: PROBLEM & IMPACT */}
                    {currentTab === 'challenge' && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="bg-[#0a192f] p-5 rounded-xl border border-slate-800 space-y-4">
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                              Institutional Problem Statement / Challenge
                            </label>
                            <textarea
                              rows={3}
                              value={sol.problem || ''}
                              onChange={e => {
                                const copy = [...solutions];
                                copy[actualIndex].problem = e.target.value;
                                setSolutions(copy);
                                markChanged();
                              }}
                              placeholder="Describe the institutional failure mode, compliance restriction, or concurrency bottleneck being solved..."
                              className="w-full px-3.5 py-2 rounded-xl bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed focus:outline-none focus:border-secondary"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                              Engineered Resolution / Deployed Impact
                            </label>
                            <textarea
                              rows={3}
                              value={sol.solution || ''}
                              onChange={e => {
                                const copy = [...solutions];
                                copy[actualIndex].solution = e.target.value;
                                setSolutions(copy);
                                markChanged();
                              }}
                              placeholder="Quantifiable operational outcome, latency improvements, and architectural resilience achieved..."
                              className="w-full px-3.5 py-2 rounded-xl bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed focus:outline-none focus:border-secondary"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 3: KEY BENEFITS */}
                    {currentTab === 'benefits' && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-xs font-bold uppercase text-white tracking-wider">
                              Verified Key Benefits
                            </h4>
                            <p className="text-[11px] text-slate-400">
                              Bullet points displayed with gold checkmarks on the Solutions blueprint card.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddBenefit(actualIndex)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 border border-slate-700 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5 text-secondary" />
                            <span>+ Add Benefit</span>
                          </button>
                        </div>

                        <div className="space-y-2.5">
                          {(sol.benefits || []).map((benefit, bi) => (
                            <div
                              key={bi}
                              className="flex items-center gap-3 p-3 bg-[#0a192f] border border-slate-800 rounded-xl group"
                            >
                              <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                              <input
                                type="text"
                                value={benefit}
                                onChange={e => handleUpdateBenefit(actualIndex, bi, e.target.value)}
                                placeholder="Key architectural benefit..."
                                className="flex-1 px-3 py-1.5 rounded-lg bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveBenefit(actualIndex, bi)}
                                className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                                title="Delete benefit"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* TAB 4: VISUAL & TECH STACK */}
                    {currentTab === 'media' && (
                      <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                          {/* Image Box */}
                          <div className="md:col-span-5 bg-[#0a192f] p-4 rounded-xl border border-slate-800 space-y-3">
                            <label className="block text-[10px] font-bold uppercase text-slate-400">
                              Blueprint Cover Visual
                            </label>
                            {sol.image_url ? (
                              <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-slate-700 group">
                                <img
                                  src={sol.image_url}
                                  alt={sol.title}
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
                                      const copy = [...solutions];
                                      copy[actualIndex].image_url = '';
                                      setSolutions(copy);
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
                                <p className="text-xs font-medium">No cover assigned</p>
                                <p className="text-[10px] text-slate-500 mt-1 mb-3">4:3 Aspect Ratio</p>
                                <button
                                  type="button"
                                  onClick={() => setCropTargetIndex(actualIndex)}
                                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase rounded flex items-center gap-1.5 border border-slate-700 transition-colors"
                                >
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>Upload Cover</span>
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Tech Stack */}
                          <div className="md:col-span-7 bg-[#0a192f] p-5 rounded-xl border border-slate-800 space-y-4">
                            <div>
                              <h4 className="text-xs font-bold uppercase text-white tracking-wider mb-1">
                                Core Technologies & Protocols
                              </h4>
                              <p className="text-[11px] text-slate-400 leading-relaxed">
                                Technologies utilized in this blueprint (e.g. Bare-Metal Rust, CUDA, Differential Privacy).
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-3">
                              {(sol.technologies || []).map(tech => (
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

                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newTechInputs[sol.id] || ''}
                                onChange={e => setNewTechInputs({ ...newTechInputs, [sol.id]: e.target.value })}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddTech(actualIndex, sol.id);
                                  }
                                }}
                                placeholder="Add technology (e.g. Rust, PyTorch, Ray)..."
                                className="flex-1 px-3 py-1.5 rounded-lg bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                              />
                              <button
                                type="button"
                                onClick={() => handleAddTech(actualIndex, sol.id)}
                                className="px-4 py-1.5 bg-secondary text-[#0a192f] rounded-lg text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 5: CTA & SEO */}
                    {currentTab === 'seo' && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="bg-[#0a192f] p-5 rounded-xl border border-slate-800 space-y-4">
                          <h4 className="text-xs font-bold uppercase text-white tracking-wider">
                            Action Trigger & Search Metadata
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                                CTA Button Label
                              </label>
                              <input
                                type="text"
                                value={sol.cta_text || ''}
                                onChange={e => {
                                  const copy = [...solutions];
                                  copy[actualIndex].cta_text = e.target.value;
                                  setSolutions(copy);
                                  markChanged();
                                }}
                                placeholder="REQUEST BLUEPRINT SPECS"
                                className="w-full px-3.5 py-2 rounded-xl bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                                CTA Target Destination URL
                              </label>
                              <input
                                type="text"
                                value={sol.cta_url || ''}
                                onChange={e => {
                                  const copy = [...solutions];
                                  copy[actualIndex].cta_url = e.target.value;
                                  setSolutions(copy);
                                  markChanged();
                                }}
                                placeholder="/contact"
                                className="w-full px-3.5 py-2 rounded-xl bg-[#07111e] border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-secondary"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                              Custom SEO Title
                            </label>
                            <input
                              type="text"
                              value={sol.seo_title || ''}
                              onChange={e => {
                                const copy = [...solutions];
                                copy[actualIndex].seo_title = e.target.value;
                                setSolutions(copy);
                                markChanged();
                              }}
                              placeholder={`${sol.title} — Solutions | Ravan Technologies`}
                              className="w-full px-3.5 py-2 rounded-xl bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                              Custom SEO Meta Description
                            </label>
                            <textarea
                              rows={2}
                              value={sol.seo_description || ''}
                              onChange={e => {
                                const copy = [...solutions];
                                copy[actualIndex].seo_description = e.target.value;
                                setSolutions(copy);
                                markChanged();
                              }}
                              placeholder={sol.description || 'Enterprise sovereign solutions blueprint...'}
                              className="w-full px-3.5 py-2 rounded-xl bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                            />
                          </div>

                          {/* SERP Snippet Preview */}
                          <div className="p-4 rounded-xl bg-[#07111e] border border-slate-800">
                            <div className="text-[10px] font-mono text-slate-500 uppercase mb-2">Google SERP Snippet Preview</div>
                            <div className="text-[#8ab4f8] text-sm font-medium hover:underline cursor-pointer truncate">
                              {sol.seo_title || `${sol.title} — Solutions | Ravan Technologies`}
                            </div>
                            <div className="text-emerald-400 text-xs font-mono truncate">
                              https://ravantechnologies.com/solutions#{sol.slug}
                            </div>
                            <div className="text-slate-400 text-xs mt-1 line-clamp-2 leading-relaxed">
                              {sol.seo_description || sol.description || 'Pre-validated architectural frameworks designed to solve high-concurrency enterprise challenges...'}
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
          targetFolder="solutions"
          initialAltText={solutions[cropTargetIndex]?.title || 'Solution blueprint visual'}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteTarget !== null}
        itemTitle={deleteTarget?.title}
        itemType="solution blueprint"
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
