import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { dataService } from '../../lib/dataService';
import { 
  AboutContent, 
  AboutCompanyOverview, 
  AboutVision, 
  AboutMission, 
  AboutCoreValue, 
  AboutTimelinePhase, 
  AboutMilestone, 
  AboutCapability, 
  AboutSEO 
} from '../../types';
import { ImageCropModal, CropResult } from '../../components/admin/ImageCropModal';
import { DeleteConfirmationModal } from '../../components/admin/DeleteConfirmationModal';
import { 
  Save, 
  RefreshCw, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Upload, 
  Image as ImageIcon, 
  Eye, 
  EyeOff, 
  Check, 
  AlertCircle, 
  Layers, 
  Target, 
  Shield, 
  Compass, 
  Calendar, 
  Cpu, 
  Server, 
  Sparkles, 
  Globe, 
  Zap, 
  CheckCircle2, 
  Award, 
  RotateCcw,
  ExternalLink,
  BookOpen,
  FolderKanban
} from 'lucide-react';

type TabKey = 
  | 'overview' 
  | 'vision' 
  | 'mission' 
  | 'values' 
  | 'timeline' 
  | 'milestones' 
  | 'capabilities' 
  | 'images' 
  | 'seo';

interface CropTarget {
  type: 'overview' | 'vision' | 'mission' | 'value' | 'timeline' | 'seo';
  index?: number;
  label: string;
}

interface DeleteTarget {
  type: 'value' | 'timeline' | 'milestone' | 'capability';
  index: number;
  title: string;
}

const SUPPORTED_ICONS = [
  'Shield',
  'Cpu',
  'Server',
  'Target',
  'Award',
  'Sparkles',
  'Layers',
  'Globe',
  'Compass',
  'Zap',
  'CheckCircle2'
];

export const AdminAbout: React.FC = () => {
  const { showToast } = useToast();
  const [content, setContent] = useState<AboutContent | null>(null);
  const [initialData, setInitialData] = useState<AboutContent | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Modal states
  const [cropTarget, setCropTarget] = useState<CropTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const data = await dataService.getAboutContent();
      setContent(JSON.parse(JSON.stringify(data)));
      setInitialData(JSON.parse(JSON.stringify(data)));
      setHasUnsavedChanges(false);
    } catch (err: any) {
      showToast('Failed to load About page data: ' + (err.message || 'Unknown error'), 'error');
    }
  };

  const markChanged = () => {
    setHasUnsavedChanges(true);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content) return;

    setSaving(true);
    try {
      const saved = await dataService.saveAboutContent(content);
      setContent(JSON.parse(JSON.stringify(saved)));
      setInitialData(JSON.parse(JSON.stringify(saved)));
      setHasUnsavedChanges(false);
      showToast('About page content successfully saved to Supabase.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save About content to Supabase.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (initialData) {
      setContent(JSON.parse(JSON.stringify(initialData)));
      setHasUnsavedChanges(false);
      showToast('Unsaved changes discarded.', 'info');
    }
  };

  const handleCropConfirm = (result: CropResult) => {
    if (!cropTarget || !content) return;

    const copy = { ...content };

    if (cropTarget.type === 'overview') {
      copy.overview = { ...(copy.overview || { heading: '', short_intro: '', is_published: true }), image_url: result.url };
    } else if (cropTarget.type === 'vision') {
      copy.vision = { ...(copy.vision || { title: '', description: '', is_published: true }), image_url: result.url };
    } else if (cropTarget.type === 'mission') {
      copy.mission = { ...(copy.mission || { title: '', description: '', is_published: true }), image_url: result.url };
    } else if (cropTarget.type === 'value' && typeof cropTarget.index === 'number') {
      const vals = [...(copy.core_values || [])];
      if (vals[cropTarget.index]) vals[cropTarget.index].image_url = result.url;
      copy.core_values = vals;
    } else if (cropTarget.type === 'timeline' && typeof cropTarget.index === 'number') {
      const tls = [...(copy.timeline || [])];
      if (tls[cropTarget.index]) tls[cropTarget.index].image_url = result.url;
      copy.timeline = tls;
    } else if (cropTarget.type === 'seo') {
      copy.seo = { ...(copy.seo || {}), og_image: result.url };
    }

    setContent(copy);
    markChanged();
    setCropTarget(null);
    showToast(`Image updated for ${cropTarget.label}.`, 'success');
  };

  const confirmDelete = () => {
    if (!deleteTarget || !content) return;

    const copy = { ...content };
    const { type, index } = deleteTarget;

    if (type === 'value') {
      copy.core_values = (copy.core_values || []).filter((_, i) => i !== index);
    } else if (type === 'timeline') {
      copy.timeline = (copy.timeline || []).filter((_, i) => i !== index);
    } else if (type === 'milestone') {
      copy.milestones = (copy.milestones || []).filter((_, i) => i !== index);
    } else if (type === 'capability') {
      copy.capabilities = (copy.capabilities || []).filter((_, i) => i !== index);
    }

    setContent(copy);
    markChanged();
    setDeleteTarget(null);
    showToast(`Deleted ${deleteTarget.title}.`, 'info');
  };

  if (!content) {
    return (
      <div className="flex items-center justify-center p-16 text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        <span>Loading About page configuration...</span>
      </div>
    );
  }

  const overview = content.overview || {
    heading: 'The Enterprise Mandate',
    short_intro: content.mandate || '',
    detailed_description: '',
    image_url: '',
    display_order: 1,
    is_published: true
  };

  const vision = content.vision || {
    title: '',
    description: '',
    image_url: '',
    display_order: 1,
    is_published: true
  };

  const mission = content.mission || {
    title: '',
    description: '',
    image_url: '',
    display_order: 1,
    is_published: true
  };

  const coreValues = content.core_values || [];
  const timeline = content.timeline || [];
  const milestones = content.milestones || [];
  const capabilities = content.capabilities || [];
  const seo = content.seo || {
    meta_title: 'About Us — The Enterprise Mandate | Ravan Technologies',
    meta_description: overview.short_intro,
    canonical_url: '/about',
    og_title: '',
    og_description: '',
    og_image: ''
  };

  // Collect all images currently in use for the Images Tab
  const allImages = [
    { source: 'Company Overview', url: overview.image_url, target: { type: 'overview' as const, label: 'Company Overview' } },
    { source: 'Vision', url: vision.image_url, target: { type: 'vision' as const, label: 'Corporate Vision' } },
    { source: 'Mission', url: mission.image_url, target: { type: 'mission' as const, label: 'Engineering Mission' } },
    ...timeline.map((p, idx) => ({ source: `Timeline: ${p.phase_label || 'Phase ' + (idx + 1)}`, url: p.image_url, target: { type: 'timeline' as const, index: idx, label: p.title || 'Phase ' + (idx + 1) } })),
    ...coreValues.map((v, idx) => ({ source: `Value: ${v.title}`, url: v.image_url, target: { type: 'value' as const, index: idx, label: v.title } })),
    { source: 'SEO / OpenGraph Image', url: seo.og_image, target: { type: 'seo' as const, label: 'SEO OpenGraph Image' } }
  ].filter(img => Boolean(img.url && img.url.trim().length > 0));

  return (
    <div className="space-y-6 animate-fade-in font-body pb-20">
      {/* Top Header & Save Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0a192f] p-6 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold font-display text-white">About Page Management</h2>
            {hasUnsavedChanges && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                UNSAVED CHANGES
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative database-driven content controls for Company Overview, Vision, Mission, Timeline, Values, and SEO.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {hasUnsavedChanges && (
            <button
              type="button"
              onClick={handleDiscard}
              disabled={saving}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold uppercase transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Discard</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="px-5 py-2.5 bg-secondary text-[#0a192f] rounded-lg text-xs font-bold uppercase hover:bg-secondary-fixed transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>SAVING TO SUPABASE...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>SAVE ABOUT PAGE</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#07111e] rounded-xl border border-slate-800 overflow-x-auto">
        {[
          { id: 'overview', label: 'Company Overview', icon: BookOpen },
          { id: 'vision', label: 'Vision', icon: Target },
          { id: 'mission', label: 'Mission', icon: Shield },
          { id: 'values', label: `Core Values (${coreValues.length})`, icon: Sparkles },
          { id: 'timeline', label: `Genesis Timeline (${timeline.length})`, icon: Calendar },
          { id: 'milestones', label: `Milestones (${milestones.length})`, icon: Award },
          { id: 'capabilities', label: `Capabilities (${capabilities.length})`, icon: Cpu },
          { id: 'images', label: `About Images (${allImages.length})`, icon: ImageIcon },
          { id: 'seo', label: 'SEO & Meta', icon: Globe }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabKey)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all ${
                isActive 
                  ? 'bg-secondary text-[#0a192f] font-bold shadow' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT AREAS */}
      <div className="bg-[#0a192f] border border-slate-800 rounded-2xl p-6 shadow-md">
        
        {/* ============================================================ */}
        {/* 1. COMPANY OVERVIEW                                          */}
        {/* ============================================================ */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in max-w-4xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Company Overview & Hero Section</h3>
                <p className="text-xs text-slate-400">The primary identity heading, corporate mandate, and overarching narrative.</p>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={overview.is_published}
                  onChange={e => {
                    setContent({
                      ...content,
                      overview: { ...overview, is_published: e.target.checked }
                    });
                    markChanged();
                  }}
                  className="rounded bg-[#07111e] border-slate-700 text-secondary"
                />
                <span>Published on Website</span>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Section Super-Heading / Label
                </label>
                <input
                  type="text"
                  value={overview.heading}
                  onChange={e => {
                    setContent({
                      ...content,
                      overview: { ...overview, heading: e.target.value }
                    });
                    markChanged();
                  }}
                  placeholder="THE ENTERPRISE MANDATE"
                  className="w-full px-3 py-2 rounded-lg bg-[#07111e] border border-slate-700 text-white text-xs focus:border-secondary outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Primary Mandate (Headline H1) *
                </label>
                <textarea
                  rows={2}
                  value={overview.short_intro}
                  onChange={e => {
                    setContent({
                      ...content,
                      mandate: e.target.value,
                      overview: { ...overview, short_intro: e.target.value }
                    });
                    markChanged();
                  }}
                  placeholder="Engineering the infrastructure of tomorrow with sovereign intelligence and structural integrity."
                  className="w-full px-3 py-2 rounded-lg bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed focus:border-secondary outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Detailed Narrative / Company Description
                </label>
                <textarea
                  rows={4}
                  value={overview.detailed_description || ''}
                  onChange={e => {
                    setContent({
                      ...content,
                      overview: { ...overview, detailed_description: e.target.value }
                    });
                    markChanged();
                  }}
                  placeholder="Ravan Technologies exists at the intersection of authoritative enterprise engineering and bleeding-edge AI innovation..."
                  className="w-full px-3 py-2 rounded-lg bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed focus:border-secondary outline-none"
                />
              </div>

              {/* Supporting Image */}
              <div className="pt-2">
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">
                  Hero Supporting Image (Optional)
                </label>
                <div className="flex items-center gap-4">
                  {overview.image_url ? (
                    <div className="w-36 aspect-[4/3] rounded-lg overflow-hidden border border-slate-700 bg-[#07111e] relative group">
                      <img src={overview.image_url} alt="Overview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setContent({
                            ...content,
                            overview: { ...overview, image_url: '' }
                          });
                          markChanged();
                        }}
                        className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded text-xs transition-colors"
                        title="Remove Image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-36 aspect-[4/3] rounded-lg border border-dashed border-slate-700 bg-[#07111e] flex flex-col items-center justify-center text-slate-500">
                      <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                      <span className="text-[10px]">No image set</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setCropTarget({ type: 'overview', label: 'Company Overview' })}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold uppercase flex items-center gap-2 border border-slate-700 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-secondary" />
                    <span>{overview.image_url ? 'Replace Image' : 'Upload Image'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 2. VISION                                                    */}
        {/* ============================================================ */}
        {activeTab === 'vision' && (
          <div className="space-y-6 animate-fade-in max-w-4xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Corporate Vision</h3>
                <p className="text-xs text-slate-400">Articulate the long-term institutional vision and strategic orientation.</p>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={vision.is_published}
                  onChange={e => {
                    setContent({
                      ...content,
                      vision: { ...vision, is_published: e.target.checked }
                    });
                    markChanged();
                  }}
                  className="rounded bg-[#07111e] border-slate-700 text-secondary"
                />
                <span>Published on Website</span>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Vision Title</label>
                <input
                  type="text"
                  value={vision.title}
                  onChange={e => {
                    setContent({
                      ...content,
                      vision: { ...vision, title: e.target.value }
                    });
                    markChanged();
                  }}
                  placeholder="Sovereign Intelligence & Self-Reliant Ecosystems"
                  className="w-full px-3 py-2 rounded-lg bg-[#07111e] border border-slate-700 text-white text-xs focus:border-secondary outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Vision Description</label>
                <textarea
                  rows={4}
                  value={vision.description}
                  onChange={e => {
                    setContent({
                      ...content,
                      vision: { ...vision, description: e.target.value }
                    });
                    markChanged();
                  }}
                  placeholder="To engineer self-reliant technology ecosystems that empower institutional autonomy, resilience, and operational sovereignty."
                  className="w-full px-3 py-2 rounded-lg bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed focus:border-secondary outline-none"
                />
              </div>

              <div className="pt-2">
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Supporting Visual</label>
                <div className="flex items-center gap-4">
                  {vision.image_url ? (
                    <div className="w-36 aspect-video rounded-lg overflow-hidden border border-slate-700 bg-[#07111e] relative">
                      <img src={vision.image_url} alt="Vision" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setContent({
                            ...content,
                            vision: { ...vision, image_url: '' }
                          });
                          markChanged();
                        }}
                        className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded text-xs"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-36 aspect-video rounded-lg border border-dashed border-slate-700 bg-[#07111e] flex flex-col items-center justify-center text-slate-500 text-[10px]">
                      No visual
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setCropTarget({ type: 'vision', label: 'Corporate Vision' })}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold uppercase flex items-center gap-2 border border-slate-700"
                  >
                    <Upload className="w-3.5 h-3.5 text-secondary" />
                    <span>{vision.image_url ? 'Replace Visual' : 'Upload Visual'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 3. MISSION                                                   */}
        {/* ============================================================ */}
        {activeTab === 'mission' && (
          <div className="space-y-6 animate-fade-in max-w-4xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Engineering Mission</h3>
                <p className="text-xs text-slate-400">Define the operational and architectural mandate governing daily execution.</p>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mission.is_published}
                  onChange={e => {
                    setContent({
                      ...content,
                      mission: { ...mission, is_published: e.target.checked }
                    });
                    markChanged();
                  }}
                  className="rounded bg-[#07111e] border-slate-700 text-secondary"
                />
                <span>Published on Website</span>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Mission Title</label>
                <input
                  type="text"
                  value={mission.title}
                  onChange={e => {
                    setContent({
                      ...content,
                      mission: { ...mission, title: e.target.value }
                    });
                    markChanged();
                  }}
                  placeholder="Architecting Uncompromising Foundations"
                  className="w-full px-3 py-2 rounded-lg bg-[#07111e] border border-slate-700 text-white text-xs focus:border-secondary outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Mission Description</label>
                <textarea
                  rows={4}
                  value={mission.description}
                  onChange={e => {
                    setContent({
                      ...content,
                      mission: { ...mission, description: e.target.value }
                    });
                    markChanged();
                  }}
                  placeholder="To design and deploy enterprise computing architectures, autonomous intelligence layers, and sovereign infrastructure that treat massive scale as a baseline."
                  className="w-full px-3 py-2 rounded-lg bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed focus:border-secondary outline-none"
                />
              </div>

              <div className="pt-2">
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Supporting Visual</label>
                <div className="flex items-center gap-4">
                  {mission.image_url ? (
                    <div className="w-36 aspect-video rounded-lg overflow-hidden border border-slate-700 bg-[#07111e] relative">
                      <img src={mission.image_url} alt="Mission" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setContent({
                            ...content,
                            mission: { ...mission, image_url: '' }
                          });
                          markChanged();
                        }}
                        className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded text-xs"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-36 aspect-video rounded-lg border border-dashed border-slate-700 bg-[#07111e] flex flex-col items-center justify-center text-slate-500 text-[10px]">
                      No visual
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setCropTarget({ type: 'mission', label: 'Engineering Mission' })}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold uppercase flex items-center gap-2 border border-slate-700"
                  >
                    <Upload className="w-3.5 h-3.5 text-secondary" />
                    <span>{mission.image_url ? 'Replace Visual' : 'Upload Visual'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 4. CORE VALUES                                               */}
        {/* ============================================================ */}
        {activeTab === 'values' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Core Values & Immutable Axioms</h3>
                <p className="text-xs text-slate-400">Manage repeatable corporate principles, icons, and descriptions.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newVals = [
                    ...coreValues,
                    {
                      id: 'val-' + Date.now(),
                      title: 'New Value',
                      short_description: 'Description of the principle...',
                      icon: 'Shield',
                      image_url: '',
                      display_order: coreValues.length + 1,
                      is_published: true
                    }
                  ];
                  setContent({ ...content, core_values: newVals });
                  markChanged();
                }}
                className="px-3.5 py-2 bg-secondary/15 hover:bg-secondary/25 text-secondary border border-secondary/40 rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Value</span>
              </button>
            </div>

            {coreValues.length === 0 ? (
              <div className="p-8 rounded-xl bg-[#07111e] border border-slate-800 text-center text-slate-400 text-xs">
                No core values configured. Click "+ Add Value" to create your first entry.
              </div>
            ) : (
              <div className="space-y-4">
                {coreValues.map((val, idx) => (
                  <div key={val.id || idx} className="p-5 rounded-xl bg-[#07111e] border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-secondary">#{idx + 1}</span>
                        <span className="text-xs font-bold text-white">{val.title || 'Untitled Value'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 text-[10px] text-slate-300 cursor-pointer mr-2">
                          <input
                            type="checkbox"
                            checked={val.is_published}
                            onChange={e => {
                              const list = [...coreValues];
                              list[idx].is_published = e.target.checked;
                              setContent({ ...content, core_values: list });
                              markChanged();
                            }}
                            className="rounded bg-[#0a192f] border-slate-700 text-secondary"
                          />
                          <span>Visible</span>
                        </label>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => {
                            if (idx === 0) return;
                            const list = [...coreValues];
                            const temp = list[idx - 1];
                            list[idx - 1] = list[idx];
                            list[idx] = temp;
                            setContent({ ...content, core_values: list });
                            markChanged();
                          }}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === coreValues.length - 1}
                          onClick={() => {
                            if (idx === coreValues.length - 1) return;
                            const list = [...coreValues];
                            const temp = list[idx + 1];
                            list[idx + 1] = list[idx];
                            list[idx] = temp;
                            setContent({ ...content, core_values: list });
                            markChanged();
                          }}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget({ type: 'value', index: idx, title: val.title })}
                          className="p-1 text-slate-400 hover:text-rose-400"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Value Title</label>
                        <input
                          type="text"
                          value={val.title}
                          onChange={e => {
                            const list = [...coreValues];
                            list[idx].title = e.target.value;
                            setContent({ ...content, core_values: list });
                            markChanged();
                          }}
                          className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs focus:border-secondary outline-none font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Icon Representation</label>
                        <select
                          value={val.icon || 'Shield'}
                          onChange={e => {
                            const list = [...coreValues];
                            list[idx].icon = e.target.value;
                            setContent({ ...content, core_values: list });
                            markChanged();
                          }}
                          className="w-full px-2 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                        >
                          {SUPPORTED_ICONS.map(ic => (
                            <option key={ic} value={ic}>{ic}</option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Principle Description</label>
                        <textarea
                          rows={2}
                          value={val.short_description}
                          onChange={e => {
                            const list = [...coreValues];
                            list[idx].short_description = e.target.value;
                            setContent({ ...content, core_values: list });
                            markChanged();
                          }}
                          className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs leading-relaxed focus:border-secondary outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* 5. GENESIS & EVOLUTION (TIMELINE PHASES)                     */}
        {/* ============================================================ */}
        {activeTab === 'timeline' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Genesis & Evolution Timeline</h3>
                <p className="text-xs text-slate-400">
                  Manage architectural phases, milestone narratives, dates, and dedicated image cards.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newTls = [
                    ...timeline,
                    {
                      id: 'phase-' + Date.now(),
                      phase_label: `Phase ${timeline.length === 0 ? 'I' : timeline.length === 1 ? 'II' : timeline.length === 2 ? 'III' : (timeline.length + 1).toString()}`,
                      title: 'New Evolution Phase',
                      short_description: 'Description of architectural milestone...',
                      detailed_description: '',
                      date_or_year: new Date().getFullYear().toString(),
                      image_url: '',
                      icon: timeline.length % 2 === 0 ? 'Server' : 'Cpu',
                      display_order: timeline.length + 1,
                      is_published: true
                    }
                  ];
                  setContent({ ...content, timeline: newTls });
                  markChanged();
                }}
                className="px-3.5 py-2 bg-secondary/15 hover:bg-secondary/25 text-secondary border border-secondary/40 rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Phase</span>
              </button>
            </div>

            {timeline.length === 0 ? (
              <div className="p-8 rounded-xl bg-[#07111e] border border-slate-800 text-center text-slate-400 text-xs">
                No trajectory phases configured. Click "+ Add Phase" to establish a phase entry.
              </div>
            ) : (
              <div className="space-y-6">
                {timeline.map((phase, idx) => (
                  <div key={phase.id || idx} className="p-5 rounded-xl bg-[#07111e] border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-secondary/15 text-secondary font-mono text-[10px] font-bold">
                          {phase.phase_label || `PHASE ${idx + 1}`}
                        </span>
                        <span className="text-xs font-bold text-white">{phase.title || 'Untitled Phase'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 text-[10px] text-slate-300 cursor-pointer mr-2">
                          <input
                            type="checkbox"
                            checked={phase.is_published}
                            onChange={e => {
                              const list = [...timeline];
                              list[idx].is_published = e.target.checked;
                              setContent({ ...content, timeline: list });
                              markChanged();
                            }}
                            className="rounded bg-[#0a192f] border-slate-700 text-secondary"
                          />
                          <span>Visible</span>
                        </label>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => {
                            if (idx === 0) return;
                            const list = [...timeline];
                            const temp = list[idx - 1];
                            list[idx - 1] = list[idx];
                            list[idx] = temp;
                            setContent({ ...content, timeline: list });
                            markChanged();
                          }}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === timeline.length - 1}
                          onClick={() => {
                            if (idx === timeline.length - 1) return;
                            const list = [...timeline];
                            const temp = list[idx + 1];
                            list[idx + 1] = list[idx];
                            list[idx] = temp;
                            setContent({ ...content, timeline: list });
                            markChanged();
                          }}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget({ type: 'timeline', index: idx, title: phase.title })}
                          className="p-1 text-slate-400 hover:text-rose-400"
                          title="Delete Phase"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-3">
                        <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Phase Tag / Badge</label>
                        <input
                          type="text"
                          value={phase.phase_label}
                          onChange={e => {
                            const list = [...timeline];
                            list[idx].phase_label = e.target.value;
                            setContent({ ...content, timeline: list });
                            markChanged();
                          }}
                          placeholder="Phase I"
                          className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs font-bold focus:border-secondary outline-none"
                        />
                      </div>

                      <div className="sm:col-span-6">
                        <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Phase Title</label>
                        <input
                          type="text"
                          value={phase.title}
                          onChange={e => {
                            const list = [...timeline];
                            list[idx].title = e.target.value;
                            setContent({ ...content, timeline: list });
                            markChanged();
                          }}
                          placeholder="The Architectural Foundation"
                          className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs font-bold focus:border-secondary outline-none"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Date / Year</label>
                        <input
                          type="text"
                          value={phase.date_or_year || ''}
                          onChange={e => {
                            const list = [...timeline];
                            list[idx].date_or_year = e.target.value;
                            setContent({ ...content, timeline: list });
                            markChanged();
                          }}
                          placeholder="Genesis / 2024"
                          className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs focus:border-secondary outline-none font-mono"
                        />
                      </div>

                      <div className="sm:col-span-12">
                        <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Short Narrative (Public Description)</label>
                        <textarea
                          rows={2}
                          value={phase.short_description}
                          onChange={e => {
                            const list = [...timeline];
                            list[idx].short_description = e.target.value;
                            setContent({ ...content, timeline: list });
                            markChanged();
                          }}
                          className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs leading-relaxed focus:border-secondary outline-none"
                        />
                      </div>

                      <div className="sm:col-span-12">
                        <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Detailed Technical Context (Optional)</label>
                        <textarea
                          rows={2}
                          value={phase.detailed_description || ''}
                          onChange={e => {
                            const list = [...timeline];
                            list[idx].detailed_description = e.target.value;
                            setContent({ ...content, timeline: list });
                            markChanged();
                          }}
                          placeholder="Extended architectural details, infrastructure specs, or deployment outcomes..."
                          className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs leading-relaxed focus:border-secondary outline-none"
                        />
                      </div>

                      {/* Phase Image & Fallback Icon */}
                      <div className="sm:col-span-8 pt-2">
                        <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Visual Image Card</label>
                        <div className="flex items-center gap-3">
                          {phase.image_url ? (
                            <div className="w-28 aspect-video rounded overflow-hidden border border-slate-700 bg-[#0a192f] relative">
                              <img src={phase.image_url} alt="Phase" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => {
                                  const list = [...timeline];
                                  list[idx].image_url = '';
                                  setContent({ ...content, timeline: list });
                                  markChanged();
                                }}
                                className="absolute top-1 right-1 p-0.5 bg-black/80 hover:bg-rose-600 text-white rounded text-xs"
                                title="Remove Image"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="w-28 aspect-video rounded border border-dashed border-slate-700 bg-[#0a192f] flex flex-col items-center justify-center text-slate-500 text-[9px]">
                              Using Graphic Fallback
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => setCropTarget({ type: 'timeline', index: idx, label: phase.title })}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold uppercase flex items-center gap-1.5 border border-slate-700"
                          >
                            <Upload className="w-3 h-3 text-secondary" />
                            <span>{phase.image_url ? 'Replace Image' : 'Upload Image'}</span>
                          </button>
                        </div>
                      </div>

                      <div className="sm:col-span-4 pt-2">
                        <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Fallback Graphic Icon</label>
                        <select
                          value={phase.icon || 'Server'}
                          onChange={e => {
                            const list = [...timeline];
                            list[idx].icon = e.target.value;
                            setContent({ ...content, timeline: list });
                            markChanged();
                          }}
                          className="w-full px-2 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                        >
                          {SUPPORTED_ICONS.map(ic => (
                            <option key={ic} value={ic}>{ic}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* 6. MILESTONES                                                */}
        {/* ============================================================ */}
        {activeTab === 'milestones' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Historical Milestones & Metrics</h3>
                <p className="text-xs text-slate-400">Add chronological corporate achievements, metric badges, and accolades.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newMs = [
                    ...milestones,
                    {
                      id: 'ms-' + Date.now(),
                      title: 'New Milestone',
                      year_or_date: new Date().getFullYear().toString(),
                      description: 'Milestone description...',
                      metric_value: '',
                      metric_label: '',
                      display_order: milestones.length + 1,
                      is_published: true
                    }
                  ];
                  setContent({ ...content, milestones: newMs });
                  markChanged();
                }}
                className="px-3.5 py-2 bg-secondary/15 hover:bg-secondary/25 text-secondary border border-secondary/40 rounded-lg text-xs font-bold uppercase flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Milestone</span>
              </button>
            </div>

            {milestones.length === 0 ? (
              <div className="p-8 rounded-xl bg-[#07111e] border border-slate-800 text-center text-slate-400 text-xs">
                No milestones added. Click "+ Add Milestone" if you wish to show a corporate milestone grid.
              </div>
            ) : (
              <div className="space-y-4">
                {milestones.map((ms, idx) => (
                  <div key={ms.id || idx} className="p-4 rounded-xl bg-[#07111e] border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-white">{ms.title || 'Untitled'}</span>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 text-[10px] text-slate-300 cursor-pointer mr-2">
                          <input
                            type="checkbox"
                            checked={ms.is_published}
                            onChange={e => {
                              const list = [...milestones];
                              list[idx].is_published = e.target.checked;
                              setContent({ ...content, milestones: list });
                              markChanged();
                            }}
                            className="rounded bg-[#0a192f] border-slate-700 text-secondary"
                          />
                          <span>Visible</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget({ type: 'milestone', index: idx, title: ms.title })}
                          className="p-1 text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Title</label>
                        <input
                          type="text"
                          value={ms.title}
                          onChange={e => {
                            const list = [...milestones];
                            list[idx].title = e.target.value;
                            setContent({ ...content, milestones: list });
                            markChanged();
                          }}
                          className="w-full px-2 py-1 rounded bg-[#0a192f] border border-slate-700 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Year / Date</label>
                        <input
                          type="text"
                          value={ms.year_or_date}
                          onChange={e => {
                            const list = [...milestones];
                            list[idx].year_or_date = e.target.value;
                            setContent({ ...content, milestones: list });
                            markChanged();
                          }}
                          className="w-full px-2 py-1 rounded bg-[#0a192f] border border-slate-700 text-white text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Metric Value (Optional)</label>
                        <input
                          type="text"
                          value={ms.metric_value || ''}
                          onChange={e => {
                            const list = [...milestones];
                            list[idx].metric_value = e.target.value;
                            setContent({ ...content, milestones: list });
                            markChanged();
                          }}
                          placeholder="e.g. 100K+"
                          className="w-full px-2 py-1 rounded bg-[#0a192f] border border-slate-700 text-white text-xs"
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={ms.description || ''}
                          onChange={e => {
                            const list = [...milestones];
                            list[idx].description = e.target.value;
                            setContent({ ...content, milestones: list });
                            markChanged();
                          }}
                          className="w-full px-2 py-1 rounded bg-[#0a192f] border border-slate-700 text-white text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* 7. CAPABILITIES                                              */}
        {/* ============================================================ */}
        {activeTab === 'capabilities' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Capabilities & Technology Focus</h3>
                <p className="text-xs text-slate-400">Manage specialized engineering competencies and architectural focus domains.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newCaps = [
                    ...capabilities,
                    {
                      id: 'cap-' + Date.now(),
                      title: 'New Capability',
                      description: 'Architectural focus description...',
                      icon: 'Cpu',
                      display_order: capabilities.length + 1,
                      is_published: true
                    }
                  ];
                  setContent({ ...content, capabilities: newCaps });
                  markChanged();
                }}
                className="px-3.5 py-2 bg-secondary/15 hover:bg-secondary/25 text-secondary border border-secondary/40 rounded-lg text-xs font-bold uppercase flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Capability</span>
              </button>
            </div>

            {capabilities.length === 0 ? (
              <div className="p-8 rounded-xl bg-[#07111e] border border-slate-800 text-center text-slate-400 text-xs">
                No capabilities configured. Click "+ Add Capability" to establish an engineering capability item.
              </div>
            ) : (
              <div className="space-y-4">
                {capabilities.map((cap, idx) => (
                  <div key={cap.id || idx} className="p-4 rounded-xl bg-[#07111e] border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-white">{cap.title || 'Untitled'}</span>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 text-[10px] text-slate-300 cursor-pointer mr-2">
                          <input
                            type="checkbox"
                            checked={cap.is_published}
                            onChange={e => {
                              const list = [...capabilities];
                              list[idx].is_published = e.target.checked;
                              setContent({ ...content, capabilities: list });
                              markChanged();
                            }}
                            className="rounded bg-[#0a192f] border-slate-700 text-secondary"
                          />
                          <span>Visible</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget({ type: 'capability', index: idx, title: cap.title })}
                          className="p-1 text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Capability Title</label>
                        <input
                          type="text"
                          value={cap.title}
                          onChange={e => {
                            const list = [...capabilities];
                            list[idx].title = e.target.value;
                            setContent({ ...content, capabilities: list });
                            markChanged();
                          }}
                          className="w-full px-2 py-1 rounded bg-[#0a192f] border border-slate-700 text-white text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Icon</label>
                        <select
                          value={cap.icon || 'Cpu'}
                          onChange={e => {
                            const list = [...capabilities];
                            list[idx].icon = e.target.value;
                            setContent({ ...content, capabilities: list });
                            markChanged();
                          }}
                          className="w-full px-2 py-1 rounded bg-[#0a192f] border border-slate-700 text-white text-xs"
                        >
                          {SUPPORTED_ICONS.map(ic => (
                            <option key={ic} value={ic}>{ic}</option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={cap.description}
                          onChange={e => {
                            const list = [...capabilities];
                            list[idx].description = e.target.value;
                            setContent({ ...content, capabilities: list });
                            markChanged();
                          }}
                          className="w-full px-2 py-1 rounded bg-[#0a192f] border border-slate-700 text-white text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* 8. ABOUT IMAGES                                              */}
        {/* ============================================================ */}
        {activeTab === 'images' && (
          <div className="space-y-6 animate-fade-in">
            <div className="pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">About Visual Asset Central</h3>
              <p className="text-xs text-slate-400">
                Audit, preview, and replace all images utilized across Company Overview, Vision, Mission, Timeline, and SEO.
              </p>
            </div>

            {allImages.length === 0 ? (
              <div className="p-8 rounded-xl bg-[#07111e] border border-slate-800 text-center text-slate-400 text-xs">
                No images currently configured on the About page. You can upload images from the Overview, Vision, Mission, or Timeline tabs.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {allImages.map((img, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#07111e] border border-slate-800 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="aspect-video rounded-lg overflow-hidden border border-slate-700 bg-black/40 mb-2">
                        <img src={img.url} alt={img.source} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-secondary uppercase block truncate">
                        {img.source}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <a
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Preview</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => setCropTarget(img.target)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-bold uppercase"
                      >
                        Replace
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* 9. SEO & METADATA                                            */}
        {/* ============================================================ */}
        {activeTab === 'seo' && (
          <div className="space-y-6 animate-fade-in max-w-4xl">
            <div className="pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">About Page SEO & Meta Tags</h3>
              <p className="text-xs text-slate-400">Search engine title, description, canonical path, and social sharing card.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">SEO Title</label>
                <input
                  type="text"
                  value={seo.meta_title || ''}
                  onChange={e => {
                    setContent({
                      ...content,
                      seo: { ...seo, meta_title: e.target.value }
                    });
                    markChanged();
                  }}
                  placeholder="About Us — The Enterprise Mandate | Ravan Technologies"
                  className="w-full px-3 py-2 rounded-lg bg-[#07111e] border border-slate-700 text-white text-xs focus:border-secondary outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">SEO Meta Description</label>
                <textarea
                  rows={3}
                  value={seo.meta_description || ''}
                  onChange={e => {
                    setContent({
                      ...content,
                      seo: { ...seo, meta_description: e.target.value }
                    });
                    markChanged();
                  }}
                  placeholder="Engineering the infrastructure of tomorrow with sovereign intelligence and structural integrity..."
                  className="w-full px-3 py-2 rounded-lg bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed focus:border-secondary outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Canonical URL</label>
                <input
                  type="text"
                  value={seo.canonical_url || '/about'}
                  onChange={e => {
                    setContent({
                      ...content,
                      seo: { ...seo, canonical_url: e.target.value }
                    });
                    markChanged();
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-[#07111e] border border-slate-700 text-white text-xs focus:border-secondary outline-none font-mono"
                />
              </div>

              <div className="pt-2">
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Social / OpenGraph Image</label>
                <div className="flex items-center gap-4">
                  {seo.og_image ? (
                    <div className="w-40 aspect-[1200/630] rounded-lg overflow-hidden border border-slate-700 bg-[#07111e] relative">
                      <img src={seo.og_image} alt="OG" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setContent({
                            ...content,
                            seo: { ...seo, og_image: '' }
                          });
                          markChanged();
                        }}
                        className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded text-xs"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-40 aspect-[1200/630] rounded-lg border border-dashed border-slate-700 bg-[#07111e] flex flex-col items-center justify-center text-slate-500 text-[10px]">
                      Default Corporate Logo
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setCropTarget({ type: 'seo', label: 'SEO OpenGraph Image' })}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold uppercase flex items-center gap-2 border border-slate-700"
                  >
                    <Upload className="w-3.5 h-3.5 text-secondary" />
                    <span>{seo.og_image ? 'Replace OG Image' : 'Upload OG Image'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Image Crop Modal Integration */}
      <ImageCropModal
        isOpen={cropTarget !== null}
        onClose={() => setCropTarget(null)}
        onConfirm={handleCropConfirm}
        aspectRatioLabel="16:9 (Landscape)"
        targetBucket="media"
        targetFolder="about"
        initialAltText={cropTarget?.label || 'About visual'}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteTarget !== null}
        itemTitle={deleteTarget?.title}
        itemType={deleteTarget?.type || 'item'}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
