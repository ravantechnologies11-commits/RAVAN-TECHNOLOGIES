import React, { useState, useEffect } from 'react';
import { dataService, generateSlug } from '../../lib/dataService';
import { useToast } from '../../context/ToastContext';
import { 
  Founder, 
  ProfileEducation, 
  ProfileProject, 
  ProfileExperience, 
  ProfileSkill, 
  SkillCategory 
} from '../../types';
import { initialFounder, initialFounders } from '../../data/initialData';
import { ImageCropModal, CropResult } from '../../components/admin/ImageCropModal';
import { DeleteConfirmationModal } from '../../components/admin/DeleteConfirmationModal';
import { 
  Plus, 
  Trash2, 
  Upload, 
  Save, 
  Check, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Shield,
  Layers,
  Award,
  Sparkles,
  Mail,
  Phone,
  User,
  GraduationCap,
  Briefcase,
  Cpu,
  Share2,
  Search,
  ArrowUp,
  ArrowDown,
  Globe,
  Github,
  AlertCircle,
  Clock,
  CheckCircle2,
  CheckCircle,
  Eraser,
  Target,
  Quote
} from 'lucide-react';
import { validateSocialUrl, SUPPORTED_SOCIAL_PLATFORMS } from '../../lib/socialUtils';

const SKILL_CATEGORIES: SkillCategory[] = [
  'Programming',
  'AI / ML',
  'Web Development',
  'Mobile Development',
  'Cloud',
  'Database',
  'DevOps',
  'Hardware',
  'Embedded Systems',
  'Design',
  'Management',
  'Other'
];

export const AdminFounder: React.FC = () => {
  const { showToast } = useToast();
  const [founders, setFounders] = useState<Founder[]>(initialFounders);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeCropIndex, setActiveCropIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  
  // Tab state per founder id: 'basic' | 'education' | 'projects' | 'experience' | 'skills' | 'social' | 'seo'
  const [founderTabs, setFounderTabs] = useState<Record<string, string>>({});
  
  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Founder | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dataService.getFounders().then(loaded => {
      if (Array.isArray(loaded) && loaded.length > 0) {
        setFounders(loaded);
      }
    });
  }, []);

  const getActiveTab = (founderId: string): string => {
    return founderTabs[founderId] || 'basic';
  };

  const setActiveTab = (founderId: string, tab: string) => {
    setFounderTabs(prev => ({ ...prev, [founderId]: tab }));
  };

  const markChanged = () => {
    setHasUnsavedChanges(true);
  };

  const handleSaveAll = async () => {
    // 1. Strict validation
    for (const f of founders) {
      if (!f.name?.trim()) {
        showToast('Founder Full Name is required.', 'error');
        return;
      }
      if (!f.designation?.trim()) {
        showToast(`Designation is required for ${f.name}.`, 'error');
        return;
      }

      if (f.social_links) {
        for (const platform of SUPPORTED_SOCIAL_PLATFORMS) {
          const rawUrl = f.social_links[platform.id];
          if (rawUrl && typeof rawUrl === 'string' && rawUrl.trim().length > 0) {
            const valRes = validateSocialUrl(rawUrl);
            if (!valRes.valid) {
              showToast(`Validation Error for ${f.name} (${platform.name}): ${valRes.error}`, 'error');
              return;
            }
          }
        }
      }

      if (f.public_email && typeof f.public_email === 'string' && f.public_email.trim().length > 0) {
        const emailTrim = f.public_email.trim();
        if (!emailTrim.includes('@') || !emailTrim.includes('.')) {
          showToast(`Validation Error for ${f.name}: Invalid public email address.`, 'error');
          return;
        }
      }
    }

    // 2. Clean and sanitize social links
    const sanitizedFounders = founders.map(f => {
      const cleanedSocial: Record<string, string> = {};
      if (f.social_links) {
        for (const [key, val] of Object.entries(f.social_links)) {
          if (key !== '_meta' && typeof val === 'string' && val.trim().length > 0) {
            const valRes = validateSocialUrl(val);
            if (valRes.valid) {
              cleanedSocial[key] = valRes.cleanUrl || val.trim();
            }
          }
        }
      }
      return {
        ...f,
        public_email: f.public_email ? f.public_email.trim() : '',
        public_phone: f.public_phone ? f.public_phone.trim() : '',
        social_links: cleanedSocial
      };
    });

    setIsSaving(true);
    try {
      await dataService.saveFounders(sanitizedFounders);
      
      // Verification fetch
      const verified = await dataService.getFounders(true);
      setFounders(verified);
      
      setIsSaved(true);
      setHasUnsavedChanges(false);
      showToast('Founders profiles persisted and synchronized with database.', 'success');
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err: any) {
      if (import.meta.env.DEV) console.error("Founders Save Error:", err);
      showToast(`Failed to save founders: ${err.message || 'Unknown database error'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCropConfirm = async (result: CropResult) => {
    if (activeCropIndex === null) return;
    const copy = [...founders];
    copy[activeCropIndex].image_url = result.url;
    setFounders(copy);
    markChanged();
    
    try {
      await dataService.saveFounders(copy);
      showToast(`Portrait uploaded for ${copy[activeCropIndex].name} and persisted to database.`, 'success');
    } catch (err: any) {
      showToast(`Image uploaded, but database save failed: ${err.message}`, 'error');
    }
  };

  const addFounder = () => {
    const newId = 'founder-' + Date.now();
    const newFounder: Founder = {
      id: newId,
      name: 'New Founder / Executive Architect',
      designation: 'Co-Founder & Chief Technology Officer',
      company_branch: 'Ravan Technologies',
      bio: '',
      image_url: '',
      slug: 'founder-' + Date.now().toString(36),
      display_order: founders.length + 1,
      status: 'draft',
      short_intro: '',
      vision: '',
      quote: '',
      quote_author_tag: 'Executive Address',
      tenure_years: '2 Years',
      focus_areas: [],
      achievements: [],
      custom_sections: [],
      education: [],
      projects: [],
      experience_records: [],
      structured_skills: [],
      public_email: '',
      public_phone: '',
      social_links: {
        linkedin: '',
        youtube: '',
        instagram: '',
        twitter: '',
        github: '',
        facebook: '',
        website: '',
        email: ''
      },
      updated_at: new Date().toISOString()
    };
    setFounders([...founders, newFounder]);
    setExpandedIndex(founders.length);
    setActiveTab(newId, 'basic');
    markChanged();
    showToast('New founder profile initialized. Fill details and click SAVE.', 'info');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await dataService.deleteFounder(deleteTarget.id);
      setFounders(prev => prev.filter(f => f.id !== deleteTarget.id));
      showToast(`Permanently deleted ${deleteTarget.name} from database.`, 'success');
      setDeleteTarget(null);
    } catch {
      showToast('Failed to delete founder profile. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const moveFounder = (idx: number, direction: 'up' | 'down') => {
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === founders.length - 1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const copy = [...founders];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    copy.forEach((f, i) => { f.display_order = i + 1; });
    setFounders(copy);
    setExpandedIndex(targetIdx);
    markChanged();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-6 max-w-5xl">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0a192f] p-6 rounded-2xl border border-slate-800 shadow-md">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded bg-secondary/15 text-secondary border border-secondary/30 text-[10px] font-bold uppercase tracking-widest">
                FOUNDERS CMS
              </span>
              {hasUnsavedChanges && (
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-semibold animate-pulse">
                  Unsaved Changes
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold font-display text-white tracking-tight">
              Founders & Executive Architects
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Manage complete 7-tab executive profiles, sovereign mandates, education, projects, technical expertise, and verified contact channels.
            </p>
          </div>

          <div className="flex gap-3 shrink-0">
            <button
              onClick={addFounder}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Plus className="w-4 h-4 text-secondary" />
              <span>Add Founder</span>
            </button>
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg ${
                isSaved
                  ? 'bg-emerald-500 text-white'
                  : 'bg-secondary text-[#0a192f] hover:bg-secondary-fixed'
              }`}
            >
              {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? 'SAVING...' : isSaved ? 'SAVED ✓' : 'SAVE ALL CHANGES'}</span>
            </button>
          </div>
        </div>

        {/* Founder Roster List */}
        {founders.length === 0 ? (
          <div className="p-16 rounded-2xl bg-[#0a192f] border border-slate-800 text-center">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">No Founders Found</h3>
            <p className="text-xs text-slate-400 mb-4">Click "Add Founder" to initialize a Founder profile.</p>
            <button
              onClick={addFounder}
              className="px-4 py-2 bg-secondary text-[#0a192f] rounded-lg text-xs font-bold uppercase"
            >
              Add Founder
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {founders.map((f, idx) => {
              const isExpanded = expandedIndex === idx;
              const currentSlug = f.slug || generateSlug(f.name);
              const activeTab = getActiveTab(f.id);
              const initials = f.name
                ? f.name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase()
                : 'VA';

              const eduCount = f.education?.length || 0;
              const projCount = f.projects?.length || 0;
              const expCount = f.experience_records?.length || 0;
              const skillsCount = f.structured_skills?.length || 0;

              return (
                <div
                  key={f.id}
                  className="bg-[#0a192f] border border-slate-800 rounded-2xl overflow-hidden shadow-md transition-all duration-300"
                >
                  {/* Executive Header Banner */}
                  <div className="p-6 bg-[#0c1f38] border-b border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Photo Thumbnail */}
                      <div className="w-16 h-20 rounded-xl overflow-hidden bg-[#07111e] border border-slate-700/80 flex items-center justify-center shrink-0 relative shadow-inner">
                        {f.image_url ? (
                          <img
                            src={f.image_url}
                            alt={f.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-base font-bold font-display text-secondary">{initials}</span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold font-display text-white">
                            {f.name || 'Untitled Founder'}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                              f.status === 'published'
                                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                                : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                            }`}
                          >
                            {f.status || 'published'}
                          </span>
                        </div>
                        <p className="text-xs text-secondary font-medium">
                          {f.designation || 'Founder of RAVAN TECHNOLOGIES'}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                          <span>/team/{currentSlug}</span>
                          <span className="opacity-40">|</span>
                          <span className="text-slate-500">Order: #{f.display_order ?? idx + 1}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2.5 self-end md:self-center">
                      <div className="flex items-center bg-[#07111e] rounded-lg border border-slate-800 p-0.5">
                        <button
                          type="button"
                          onClick={() => moveFounder(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                          title="Move Founder Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveFounder(idx, 'down')}
                          disabled={idx === founders.length - 1}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                          title="Move Founder Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {f.status === 'published' && (
                        <a
                          href={`/team/${currentSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                        >
                          <span>Live Profile</span>
                          <ExternalLink className="w-3.5 h-3.5 text-secondary" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                        className="px-3.5 py-1.5 bg-secondary/10 hover:bg-secondary/20 border border-secondary/40 text-secondary rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        <span>{isExpanded ? 'Collapse' : 'Edit Profile'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(f)}
                        className="p-1.5 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                        title="Delete Profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded 7-Tab Modular Editor */}
                  {isExpanded && (
                    <div className="p-6 space-y-6">
                      {/* Section Navigation Tabs */}
                      <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-800">
                        {[
                          { id: 'basic', label: '1. Basic Profile', icon: User, count: null },
                          { id: 'education', label: '2. Education', icon: GraduationCap, count: eduCount },
                          { id: 'projects', label: '3. Projects', icon: Layers, count: projCount },
                          { id: 'experience', label: '4. Experience', icon: Briefcase, count: expCount },
                          { id: 'skills', label: '5. Skills & Expertise', icon: Cpu, count: skillsCount },
                          { id: 'social', label: '6. Official Social', icon: Share2, count: Object.keys(f.social_links || {}).filter(k => k !== '_meta' && !!f.social_links?.[k]).length },
                          { id: 'seo', label: '7. SEO / Metadata', icon: Globe, count: null }
                        ].map(tab => {
                          const Icon = tab.icon;
                          const isActive = activeTab === tab.id;
                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setActiveTab(f.id, tab.id)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                                isActive
                                  ? 'bg-secondary text-[#0a192f] shadow-md'
                                  : 'bg-[#07111e] text-slate-300 hover:text-white border border-slate-800'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              <span>{tab.label}</span>
                              {tab.count !== null && (
                                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                                  isActive ? 'bg-[#0a192f]/20 text-[#0a192f]' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {tab.count}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* ============================================================ */}
                      {/* TAB 1: BASIC PROFILE                                         */}
                      {/* ============================================================ */}
                      {activeTab === 'basic' && (
                        <div className="space-y-5 animate-fade-in">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                            {/* Portrait Photo Upload & Preview */}
                            <div className="md:col-span-3 flex flex-col items-center gap-3 p-4 bg-[#07111e] rounded-xl border border-slate-800 text-center">
                              <div className="w-28 h-36 rounded-xl overflow-hidden bg-[#0a192f] border border-slate-700 flex items-center justify-center relative shadow-inner">
                                {f.image_url ? (
                                  <img
                                    src={f.image_url}
                                    alt={f.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="p-4 text-center">
                                    <span className="text-2xl font-bold font-display text-secondary">{initials}</span>
                                    <span className="text-[9px] text-slate-500 uppercase tracking-widest block mt-1">No Image</span>
                                  </div>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => setActiveCropIndex(idx)}
                                className="w-full py-1.5 px-3 bg-secondary/15 hover:bg-secondary/25 border border-secondary/40 text-secondary rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>{f.image_url ? 'Change Photo' : 'Upload Photo'}</span>
                              </button>
                              <div className="w-full">
                                <label className="block text-[9px] font-mono text-slate-500 text-left mb-1">Direct Image URL</label>
                                <input
                                  type="text"
                                  value={f.image_url || ''}
                                  onChange={e => {
                                    const copy = [...founders];
                                    copy[idx].image_url = e.target.value;
                                    setFounders(copy);
                                    markChanged();
                                  }}
                                  placeholder="https://... or /avatars/..."
                                  className="w-full px-2 py-1 rounded bg-[#0a192f] border border-slate-700 text-[10px] text-slate-300 font-mono focus:border-secondary outline-none truncate"
                                />
                              </div>
                            </div>

                            {/* Core Fields */}
                            <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Full Name *</label>
                                <input
                                  type="text"
                                  value={f.name}
                                  onChange={e => {
                                    const copy = [...founders];
                                    copy[idx].name = e.target.value;
                                    setFounders(copy);
                                    markChanged();
                                  }}
                                  className="w-full px-3 py-2 rounded-lg bg-[#07111e] border border-slate-700 text-white text-xs font-bold focus:border-secondary outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Designation / Role *</label>
                                <input
                                  type="text"
                                  value={f.designation}
                                  onChange={e => {
                                    const copy = [...founders];
                                    copy[idx].designation = e.target.value;
                                    setFounders(copy);
                                    markChanged();
                                  }}
                                  className="w-full px-3 py-2 rounded-lg bg-[#07111e] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Company Branch</label>
                                <select
                                  value={f.company_branch || 'Ravan Technologies'}
                                  onChange={e => {
                                    const copy = [...founders];
                                    copy[idx].company_branch = e.target.value as any;
                                    setFounders(copy);
                                    markChanged();
                                  }}
                                  className="w-full px-3 py-2 rounded-lg bg-[#07111e] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                                >
                                  <option value="Ravan Technologies">Ravan Technologies</option>
                                  <option value="Ravan Tech Park">Ravan Tech Park</option>
                                  <option value="Ravan Film Studio">Ravan Film Studio</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Publishing Status</label>
                                <select
                                  value={f.status || 'published'}
                                  onChange={e => {
                                    const copy = [...founders];
                                    copy[idx].status = e.target.value as any;
                                    setFounders(copy);
                                    markChanged();
                                  }}
                                  className="w-full px-3 py-2 rounded-lg bg-[#07111e] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                                >
                                  <option value="published">Published (Public)</option>
                                  <option value="draft">Draft (Hidden)</option>
                                  <option value="archived">Archived</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Display Order</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={f.display_order ?? 1}
                                  onChange={e => {
                                    const copy = [...founders];
                                    copy[idx].display_order = parseInt(e.target.value) || 1;
                                    setFounders(copy);
                                    markChanged();
                                  }}
                                  className="w-full px-3 py-2 rounded-lg bg-[#07111e] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Public Profile Slug</label>
                                <div className="flex items-center bg-[#07111e] border border-slate-700 rounded-lg px-3 py-2">
                                  <span className="text-xs text-slate-500 font-mono">/team/</span>
                                  <input
                                    type="text"
                                    value={f.slug || ''}
                                    onChange={e => {
                                      const copy = [...founders];
                                      copy[idx].slug = generateSlug(e.target.value);
                                      setFounders(copy);
                                      markChanged();
                                    }}
                                    placeholder={generateSlug(f.name)}
                                    className="w-full bg-transparent text-secondary text-xs font-mono focus:outline-none"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Short Introduction */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[10px] font-bold uppercase text-slate-400">
                                Short Introduction (Executive Mandate Quote) *
                              </label>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {(f.short_intro || '').length} characters
                              </span>
                            </div>
                            <textarea
                              rows={2}
                              value={f.short_intro || ''}
                              onChange={e => {
                                const copy = [...founders];
                                copy[idx].short_intro = e.target.value;
                                setFounders(copy);
                                markChanged();
                              }}
                              placeholder="A concise, high-impact professional introduction about the founder..."
                              className="w-full px-3 py-2 rounded-lg bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed focus:border-secondary outline-none"
                            />
                          </div>

                          {/* Executive Biography */}
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                              Full Executive Biography
                            </label>
                            <textarea
                              rows={3}
                              value={f.bio || ''}
                              onChange={e => {
                                const copy = [...founders];
                                copy[idx].bio = e.target.value;
                                setFounders(copy);
                                markChanged();
                              }}
                              placeholder="Comprehensive executive biography describing founder's engineering background and vision..."
                              className="w-full px-3 py-2 rounded-lg bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed focus:border-secondary outline-none"
                            />
                          </div>

                          {/* Institutional Vision & Official Quote */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#07111e] border border-slate-800">
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-secondary" />
                                <span>Institutional Vision</span>
                              </label>
                              <textarea
                                rows={2}
                                value={f.vision || ''}
                                onChange={e => {
                                  const copy = [...founders];
                                  copy[idx].vision = e.target.value;
                                  setFounders(copy);
                                  markChanged();
                                }}
                                placeholder="Vision statement for autonomous sovereign computing..."
                                className="w-full px-3 py-2 rounded-lg bg-[#0a192f] border border-slate-700 text-white text-xs leading-relaxed focus:border-secondary outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1.5">
                                <Quote className="w-3.5 h-3.5 text-secondary" />
                                <span>Executive Address Quote</span>
                              </label>
                              <textarea
                                rows={2}
                                value={f.quote || ''}
                                onChange={e => {
                                  const copy = [...founders];
                                  copy[idx].quote = e.target.value;
                                  setFounders(copy);
                                  markChanged();
                                }}
                                placeholder="Key quote featured in address and about pages..."
                                className="w-full px-3 py-2 rounded-lg bg-[#0a192f] border border-slate-700 text-white text-xs leading-relaxed focus:border-secondary outline-none"
                              />
                            </div>
                          </div>

                          {/* Tenure & Key Achievements */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-secondary" />
                                <span>Tenure</span>
                              </label>
                              <input
                                type="text"
                                value={f.tenure_years || ''}
                                onChange={e => {
                                  const copy = [...founders];
                                  copy[idx].tenure_years = e.target.value;
                                  setFounders(copy);
                                  markChanged();
                                }}
                                placeholder="e.g. 2 Years"
                                className="w-full px-3 py-2 rounded-lg bg-[#07111e] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                                  <Award className="w-3 h-3 text-secondary" />
                                  <span>Key Achievements (One per line)</span>
                                </label>
                              </div>
                              <textarea
                                rows={2}
                                value={(f.achievements || []).join('\n')}
                                onChange={e => {
                                  const copy = [...founders];
                                  copy[idx].achievements = e.target.value.split('\n').filter(Boolean);
                                  setFounders(copy);
                                  markChanged();
                                }}
                                placeholder="Pioneered Sovereign Intelligence framework\nEstablished Ravan Tech Park"
                                className="w-full px-3 py-2 rounded-lg bg-[#07111e] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ============================================================ */}
                      {/* TAB 2: EDUCATION & QUALIFICATIONS                            */}
                      {/* ============================================================ */}
                      {activeTab === 'education' && (
                        <div className="space-y-4 animate-fade-in">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-bold text-white">Education & Academic Qualifications</h4>
                              <p className="text-xs text-slate-400">Manage degrees, institutions, departments, and tenure.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const copy = [...founders];
                                const currentEdu = copy[idx].education || [];
                                const newEdu: ProfileEducation = {
                                  id: 'edu-' + Date.now(),
                                  degree: 'B.E. / B.Tech',
                                  institution: '',
                                  field: '',
                                  start_year: '2024',
                                  end_year: '2028',
                                  description: ''
                                };
                                copy[idx].education = [...currentEdu, newEdu];
                                setFounders(copy);
                                markChanged();
                              }}
                              className="px-3 py-1.5 bg-secondary/15 hover:bg-secondary/25 text-secondary border border-secondary/40 rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Education</span>
                            </button>
                          </div>

                          {(f.education || []).length === 0 ? (
                            <div className="p-8 rounded-xl bg-[#07111e] border border-slate-800 text-center text-slate-400 text-xs">
                              No education records added yet. Click "+ Add Education" to add an entry.
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {(f.education || []).map((edu, eIdx) => (
                                <div
                                  key={edu.id || eIdx}
                                  className="p-4 rounded-xl bg-[#07111e] border border-slate-800 space-y-3"
                                >
                                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                                    <span className="text-[10px] font-mono font-bold text-secondary">
                                      ENTRY #{eIdx + 1}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (eIdx === 0) return;
                                          const copy = [...founders];
                                          const list = [...(copy[idx].education || [])];
                                          [list[eIdx - 1], list[eIdx]] = [list[eIdx], list[eIdx - 1]];
                                          copy[idx].education = list;
                                          setFounders(copy);
                                          markChanged();
                                        }}
                                        disabled={eIdx === 0}
                                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                                        title="Move Up"
                                      >
                                        <ArrowUp className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const copy = [...founders];
                                          const list = [...(copy[idx].education || [])];
                                          if (eIdx === list.length - 1) return;
                                          [list[eIdx + 1], list[eIdx]] = [list[eIdx], list[eIdx + 1]];
                                          copy[idx].education = list;
                                          setFounders(copy);
                                          markChanged();
                                        }}
                                        disabled={eIdx === (f.education?.length || 0) - 1}
                                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                                        title="Move Down"
                                      >
                                        <ArrowDown className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const copy = [...founders];
                                          copy[idx].education = (copy[idx].education || []).filter((_, i) => i !== eIdx);
                                          setFounders(copy);
                                          markChanged();
                                        }}
                                        className="p-1 text-slate-400 hover:text-rose-400"
                                        title="Delete Entry"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Degree / Qualification *</label>
                                      <input
                                        type="text"
                                        value={edu.degree}
                                        onChange={e => {
                                          const copy = [...founders];
                                          const list = [...(copy[idx].education || [])];
                                          list[eIdx].degree = e.target.value;
                                          copy[idx].education = list;
                                          setFounders(copy);
                                          markChanged();
                                        }}
                                        placeholder="B.E. / B.Tech"
                                        className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Institution *</label>
                                      <input
                                        type="text"
                                        value={edu.institution}
                                        onChange={e => {
                                          const copy = [...founders];
                                          const list = [...(copy[idx].education || [])];
                                          list[eIdx].institution = e.target.value;
                                          copy[idx].education = list;
                                          setFounders(copy);
                                          markChanged();
                                        }}
                                        placeholder="Institution Name"
                                        className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Field / Department</label>
                                      <input
                                        type="text"
                                        value={edu.field || ''}
                                        onChange={e => {
                                          const copy = [...founders];
                                          const list = [...(copy[idx].education || [])];
                                          list[eIdx].field = e.target.value;
                                          copy[idx].education = list;
                                          setFounders(copy);
                                          markChanged();
                                        }}
                                        placeholder="Computer Science / Electronics"
                                        className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Start Year</label>
                                      <input
                                        type="text"
                                        value={edu.start_year || ''}
                                        onChange={e => {
                                          const copy = [...founders];
                                          const list = [...(copy[idx].education || [])];
                                          list[eIdx].start_year = e.target.value;
                                          copy[idx].education = list;
                                          setFounders(copy);
                                          markChanged();
                                        }}
                                        placeholder="2024"
                                        className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">End Year</label>
                                      <input
                                        type="text"
                                        value={edu.end_year || ''}
                                        onChange={e => {
                                          const copy = [...founders];
                                          const list = [...(copy[idx].education || [])];
                                          list[eIdx].end_year = e.target.value;
                                          copy[idx].education = list;
                                          setFounders(copy);
                                          markChanged();
                                        }}
                                        placeholder="2028 or Present"
                                        className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Notes / Description</label>
                                      <input
                                        type="text"
                                        value={edu.description || ''}
                                        onChange={e => {
                                          const copy = [...founders];
                                          const list = [...(copy[idx].education || [])];
                                          list[eIdx].description = e.target.value;
                                          copy[idx].education = list;
                                          setFounders(copy);
                                          markChanged();
                                        }}
                                        placeholder="Undergraduate studies in systems..."
                                        className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
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
                      {/* TAB 3: PROJECTS                                              */}
                      {/* ============================================================ */}
                      {activeTab === 'projects' && (
                        <div className="space-y-4 animate-fade-in">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-bold text-white">Engineering & Strategic Projects</h4>
                              <p className="text-xs text-slate-400">Manage platforms, hardware architectures, and AI systems created or led.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const copy = [...founders];
                                const currentProj = copy[idx].projects || [];
                                const newProj: ProfileProject = {
                                  id: 'proj-' + Date.now(),
                                  title: 'New Enterprise Project',
                                  short_description: '',
                                  role: 'Principal Architect',
                                  technologies: ['Architecture', 'Cloud', 'AI'],
                                  status: 'Production',
                                  start_date: '2025',
                                  end_date: 'Present',
                                  featured: true,
                                  display_order: currentProj.length + 1,
                                  is_published: true
                                };
                                copy[idx].projects = [...currentProj, newProj];
                                setFounders(copy);
                                markChanged();
                              }}
                              className="px-3 py-1.5 bg-secondary/15 hover:bg-secondary/25 text-secondary border border-secondary/40 rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Project</span>
                            </button>
                          </div>

                          {(f.projects || []).length === 0 ? (
                            <div className="p-8 rounded-xl bg-[#07111e] border border-slate-800 text-center text-slate-400 text-xs">
                              No projects registered. Click "+ Add Project" to build portfolio.
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {(f.projects || []).map((p, pIdx) => (
                                <div
                                  key={p.id || pIdx}
                                  className="p-4 rounded-xl bg-[#07111e] border border-slate-800 space-y-3"
                                >
                                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-mono font-bold text-secondary">
                                        PROJECT #{pIdx + 1}
                                      </span>
                                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                        p.is_published ? 'bg-emerald-950/60 text-emerald-300' : 'bg-slate-800 text-slate-400'
                                      }`}>
                                        {p.is_published ? 'Visible' : 'Hidden'}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (pIdx === 0) return;
                                          const copy = [...founders];
                                          const list = [...(copy[idx].projects || [])];
                                          [list[pIdx - 1], list[pIdx]] = [list[pIdx], list[pIdx - 1]];
                                          copy[idx].projects = list;
                                          setFounders(copy);
                                          markChanged();
                                        }}
                                        disabled={pIdx === 0}
                                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                                        title="Move Up"
                                      >
                                        <ArrowUp className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const copy = [...founders];
                                          const list = [...(copy[idx].projects || [])];
                                          if (pIdx === list.length - 1) return;
                                          [list[pIdx + 1], list[pIdx]] = [list[pIdx], list[pIdx + 1]];
                                          copy[idx].projects = list;
                                          setFounders(copy);
                                          markChanged();
                                        }}
                                        disabled={pIdx === (f.projects?.length || 0) - 1}
                                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                                        title="Move Down"
                                      >
                                        <ArrowDown className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const copy = [...founders];
                                          copy[idx].projects = (copy[idx].projects || []).filter((_, i) => i !== pIdx);
                                          setFounders(copy);
                                          markChanged();
                                        }}
                                        className="p-1 text-slate-400 hover:text-rose-400"
                                        title="Delete Project"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="sm:col-span-2">
                                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Project Title *</label>
                                      <input
                                        type="text"
                                        value={p.title}
                                        onChange={e => {
                                          const copy = [...founders];
                                          const list = [...(copy[idx].projects || [])];
                                          list[pIdx].title = e.target.value;
                                          copy[idx].projects = list;
                                          setFounders(copy);
                                          markChanged();
                                        }}
                                        placeholder="e.g. Sovereign Intelligence Platform"
                                        className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs font-semibold focus:border-secondary outline-none"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Role in Project</label>
                                      <input
                                        type="text"
                                        value={p.role || ''}
                                        onChange={e => {
                                          const copy = [...founders];
                                          const list = [...(copy[idx].projects || [])];
                                          list[pIdx].role = e.target.value;
                                          copy[idx].projects = list;
                                          setFounders(copy);
                                          markChanged();
                                        }}
                                        placeholder="Lead Architect"
                                        className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                                      />
                                    </div>

                                    <div className="sm:col-span-3">
                                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Short Description</label>
                                      <textarea
                                        rows={2}
                                        value={p.short_description || ''}
                                        onChange={e => {
                                          const copy = [...founders];
                                          const list = [...(copy[idx].projects || [])];
                                          list[pIdx].short_description = e.target.value;
                                          copy[idx].projects = list;
                                          setFounders(copy);
                                          markChanged();
                                        }}
                                        placeholder="Concise overview of engineering mandates, architecture, and impact..."
                                        className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs leading-relaxed focus:border-secondary outline-none"
                                      />
                                    </div>

                                    <div className="sm:col-span-2">
                                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Technologies (Comma separated)</label>
                                      <input
                                        type="text"
                                        value={Array.isArray(p.technologies) ? p.technologies.join(', ') : ''}
                                        onChange={e => {
                                          const copy = [...founders];
                                          const list = [...(copy[idx].projects || [])];
                                          list[pIdx].technologies = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                                          copy[idx].projects = list;
                                          setFounders(copy);
                                          markChanged();
                                        }}
                                        placeholder="Python, PyTorch, Distributed Systems, Docker"
                                        className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Project Status</label>
                                      <select
                                        value={p.status || 'Production'}
                                        onChange={e => {
                                          const copy = [...founders];
                                          const list = [...(copy[idx].projects || [])];
                                          list[pIdx].status = e.target.value as any;
                                          copy[idx].projects = list;
                                          setFounders(copy);
                                          markChanged();
                                        }}
                                        className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                                      >
                                        <option value="Production">Production</option>
                                        <option value="Completed">Completed</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Beta">Beta</option>
                                        <option value="Concept">Concept</option>
                                      </select>
                                    </div>

                                    <div>
                                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Live URL (Optional)</label>
                                      <input
                                        type="url"
                                        value={p.project_url || ''}
                                        onChange={e => {
                                          const copy = [...founders];
                                          const list = [...(copy[idx].projects || [])];
                                          list[pIdx].project_url = e.target.value;
                                          copy[idx].projects = list;
                                          setFounders(copy);
                                          markChanged();
                                        }}
                                        placeholder="https://..."
                                        className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs focus:border-secondary outline-none font-mono"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">GitHub URL (Optional)</label>
                                      <input
                                        type="url"
                                        value={p.github_url || ''}
                                        onChange={e => {
                                          const copy = [...founders];
                                          const list = [...(copy[idx].projects || [])];
                                          list[pIdx].github_url = e.target.value;
                                          copy[idx].projects = list;
                                          setFounders(copy);
                                          markChanged();
                                        }}
                                        placeholder="https://github.com/..."
                                        className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs focus:border-secondary outline-none font-mono"
                                      />
                                    </div>

                                    <div className="flex items-center gap-4 pt-4">
                                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                                        <input
                                          type="checkbox"
                                          checked={p.featured ?? true}
                                          onChange={e => {
                                            const copy = [...founders];
                                            const list = [...(copy[idx].projects || [])];
                                            list[pIdx].featured = e.target.checked;
                                            copy[idx].projects = list;
                                            setFounders(copy);
                                            markChanged();
                                          }}
                                          className="rounded border-slate-700 text-secondary focus:ring-0"
                                        />
                                        <span>Featured</span>
                                      </label>

                                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                                        <input
                                          type="checkbox"
                                          checked={p.is_published ?? true}
                                          onChange={e => {
                                            const copy = [...founders];
                                            const list = [...(copy[idx].projects || [])];
                                            list[pIdx].is_published = e.target.checked;
                                            copy[idx].projects = list;
                                            setFounders(copy);
                                            markChanged();
                                          }}
                                          className="rounded border-slate-700 text-secondary focus:ring-0"
                                        />
                                        <span>Published</span>
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* ============================================================ */}
                      {/* TAB 4: EXPERIENCE                                            */}
                      {/* ============================================================ */}
                      {activeTab === 'experience' && (
                        <div className="space-y-4 animate-fade-in">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-bold text-white">Professional & Venture Experience</h4>
                              <p className="text-xs text-slate-400">Manage corporate leadership roles, engineering experience, and responsibilities.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const copy = [...founders];
                                const currentExp = copy[idx].experience_records || [];
                                const newExp: ProfileExperience = {
                                  id: 'exp-' + Date.now(),
                                  organization: 'Ravan Technologies',
                                  role: 'Founder & Chief Architect',
                                  start_date: '2024',
                                  end_date: '',
                                  is_current: true,
                                  description: 'Leading enterprise software engineering, sovereign cloud infrastructure, and AI systems.',
                                  responsibilities: [],
                                  contributions: []
                                };
                                copy[idx].experience_records = [...currentExp, newExp];
                                setFounders(copy);
                                markChanged();
                              }}
                              className="px-3 py-1.5 bg-secondary/15 hover:bg-secondary/25 text-secondary border border-secondary/40 rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Experience</span>
                            </button>
                          </div>

                          {(f.experience_records || []).length === 0 ? (
                            <div className="p-8 rounded-xl bg-[#07111e] border border-slate-800 text-center text-slate-400 text-xs">
                              No experience records registered. Click "+ Add Experience" to record tenure.
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {(f.experience_records || []).map((exp, xIdx) => (
                                <div
                                  key={exp.id || xIdx}
                                  className="p-4 rounded-xl bg-[#07111e] border border-slate-800 space-y-3"
                                >
                                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-mono font-bold text-secondary">
                                        EXPERIENCE #{xIdx + 1}
                                      </span>
                                      {exp.is_current && (
                                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-secondary/15 text-secondary border border-secondary/30">
                                          Current Venture
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (xIdx === 0) return;
                                          const copy = [...founders];
                                          const list = [...(copy[idx].experience_records || [])];
                                          [list[xIdx - 1], list[xIdx]] = [list[xIdx], list[xIdx - 1]];
                                          copy[idx].experience_records = list;
                                          setFounders(copy);
                                          markChanged();
                                        }}
                                        disabled={xIdx === 0}
                                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                                        title="Move Up"
                                      >
                                        <ArrowUp className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const copy = [...founders];
                                          const list = [...(copy[idx].experience_records || [])];
                                          if (xIdx === list.length - 1) return;
                                          [list[xIdx + 1], list[xIdx]] = [list[xIdx], list[xIdx + 1]];
                                          copy[idx].experience_records = list;
                                          setFounders(copy);
                                          markChanged();
                                        }}
                                        disabled={xIdx === (f.experience_records?.length || 0) - 1}
                                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                                        title="Move Down"
                                      >
                                        <ArrowDown className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const copy = [...founders];
                                          copy[idx].experience_records = (copy[idx].experience_records || []).filter((_, i) => i !== xIdx);
                                          setFounders(copy);
                                          markChanged();
                                        }}
                                        className="p-1 text-slate-400 hover:text-rose-400"
                                        title="Delete Experience"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Organization / Venture *</label>
                                      <input
                                        type="text"
                                        value={exp.organization}
                                        onChange={e => {
                                          const copy = [...founders];
                                          const list = [...(copy[idx].experience_records || [])];
                                          list[xIdx].organization = e.target.value;
                                          copy[idx].experience_records = list;
                                          setFounders(copy);
                                          markChanged();
                                        }}
                                        placeholder="Company / Enterprise"
                                        className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs font-semibold focus:border-secondary outline-none"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Role / Title *</label>
                                      <input
                                        type="text"
                                        value={exp.role}
                                        onChange={e => {
                                          const copy = [...founders];
                                          const list = [...(copy[idx].experience_records || [])];
                                          list[xIdx].role = e.target.value;
                                          copy[idx].experience_records = list;
                                          setFounders(copy);
                                          markChanged();
                                        }}
                                        placeholder="Founder & Chief Architect"
                                        className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Start Date / Year</label>
                                      <input
                                        type="text"
                                        value={exp.start_date || ''}
                                        onChange={e => {
                                          const copy = [...founders];
                                          const list = [...(copy[idx].experience_records || [])];
                                          list[xIdx].start_date = e.target.value;
                                          copy[idx].experience_records = list;
                                          setFounders(copy);
                                          markChanged();
                                        }}
                                        placeholder="2024"
                                        className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                                      />
                                    </div>

                                    <div>
                                      <div className="flex items-center justify-between mb-1">
                                        <label className="text-[9px] font-bold uppercase text-slate-400">End Date / Year</label>
                                        <label className="flex items-center gap-1.5 text-[9px] text-slate-300 cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={!!exp.is_current}
                                            onChange={e => {
                                              const copy = [...founders];
                                              const list = [...(copy[idx].experience_records || [])];
                                              list[xIdx].is_current = e.target.checked;
                                              if (e.target.checked) list[xIdx].end_date = '';
                                              copy[idx].experience_records = list;
                                              setFounders(copy);
                                              markChanged();
                                            }}
                                            className="rounded border-slate-700 text-secondary focus:ring-0"
                                          />
                                          <span>Present</span>
                                        </label>
                                      </div>
                                      <input
                                        type="text"
                                        value={exp.is_current ? 'Present' : (exp.end_date || '')}
                                        disabled={!!exp.is_current}
                                        onChange={e => {
                                          const copy = [...founders];
                                          const list = [...(copy[idx].experience_records || [])];
                                          list[xIdx].end_date = e.target.value;
                                          copy[idx].experience_records = list;
                                          setFounders(copy);
                                          markChanged();
                                        }}
                                        placeholder="2026"
                                        className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs disabled:opacity-50 focus:border-secondary outline-none"
                                      />
                                    </div>

                                    <div className="sm:col-span-2">
                                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Overview / Description</label>
                                      <textarea
                                        rows={2}
                                        value={exp.description || ''}
                                        onChange={e => {
                                          const copy = [...founders];
                                          const list = [...(copy[idx].experience_records || [])];
                                          list[xIdx].description = e.target.value;
                                          copy[idx].experience_records = list;
                                          setFounders(copy);
                                          markChanged();
                                        }}
                                        placeholder="High-level mandate and architectural contributions..."
                                        className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs leading-relaxed focus:border-secondary outline-none"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Key Responsibilities (One per line)</label>
                                      <textarea
                                        rows={3}
                                        value={(exp.responsibilities || []).join('\n')}
                                        onChange={e => {
                                          const copy = [...founders];
                                          const list = [...(copy[idx].experience_records || [])];
                                          list[xIdx].responsibilities = e.target.value.split('\n').filter(Boolean);
                                          copy[idx].experience_records = list;
                                          setFounders(copy);
                                          markChanged();
                                        }}
                                        placeholder="Architected AI systems\nLed platform execution"
                                        className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs font-mono focus:border-secondary outline-none"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Major Contributions (One per line)</label>
                                      <textarea
                                        rows={3}
                                        value={(exp.contributions || []).join('\n')}
                                        onChange={e => {
                                          const copy = [...founders];
                                          const list = [...(copy[idx].experience_records || [])];
                                          list[xIdx].contributions = e.target.value.split('\n').filter(Boolean);
                                          copy[idx].experience_records = list;
                                          setFounders(copy);
                                          markChanged();
                                        }}
                                        placeholder="Pioneered sovereign intelligence\nFounded Ravan Hackathon series"
                                        className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs font-mono focus:border-secondary outline-none"
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
                      {/* TAB 5: SKILLS & EXPERTISE                                    */}
                      {/* ============================================================ */}
                      {activeTab === 'skills' && (
                        <div className="space-y-4 animate-fade-in">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-bold text-white">Skills & Technical Expertise</h4>
                              <p className="text-xs text-slate-400">Organized into standard corporate technical domains.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const copy = [...founders];
                                const currentSkills = copy[idx].structured_skills || [];
                                const newSkill: ProfileSkill = {
                                  id: 'skill-' + Date.now(),
                                  name: '',
                                  category: 'Programming',
                                  proficiency: 'Expert',
                                  display_order: currentSkills.length + 1
                                };
                                copy[idx].structured_skills = [...currentSkills, newSkill];
                                setFounders(copy);
                                markChanged();
                              }}
                              className="px-3 py-1.5 bg-secondary/15 hover:bg-secondary/25 text-secondary border border-secondary/40 rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Skill</span>
                            </button>
                          </div>

                          {(f.structured_skills || []).length === 0 ? (
                            <div className="p-8 rounded-xl bg-[#07111e] border border-slate-800 text-center text-slate-400 text-xs">
                              No structured skills registered. Click "+ Add Skill" to start.
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {(f.structured_skills || []).map((sk, sIdx) => (
                                <div
                                  key={sk.id || sIdx}
                                  className="p-3 rounded-xl bg-[#07111e] border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                                >
                                  <div className="sm:col-span-5">
                                    <input
                                      type="text"
                                      value={sk.name}
                                      onChange={e => {
                                        const copy = [...founders];
                                        const list = [...(copy[idx].structured_skills || [])];
                                        list[sIdx].name = e.target.value;
                                        copy[idx].structured_skills = list;
                                        setFounders(copy);
                                        markChanged();
                                      }}
                                      placeholder="Skill Name (e.g. Python, AI / ML, LLM Integration)"
                                      className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs font-medium focus:border-secondary outline-none"
                                    />
                                  </div>

                                  <div className="sm:col-span-4">
                                    <select
                                      value={sk.category}
                                      onChange={e => {
                                        const copy = [...founders];
                                        const list = [...(copy[idx].structured_skills || [])];
                                        list[sIdx].category = e.target.value as SkillCategory;
                                        copy[idx].structured_skills = list;
                                        setFounders(copy);
                                        markChanged();
                                      }}
                                      className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                                    >
                                      {SKILL_CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="sm:col-span-2">
                                    <select
                                      value={sk.proficiency || 'Expert'}
                                      onChange={e => {
                                        const copy = [...founders];
                                        const list = [...(copy[idx].structured_skills || [])];
                                        list[sIdx].proficiency = e.target.value;
                                        copy[idx].structured_skills = list;
                                        setFounders(copy);
                                        markChanged();
                                      }}
                                      className="w-full px-2 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                                    >
                                      <option value="Expert">Expert</option>
                                      <option value="Advanced">Advanced</option>
                                      <option value="Intermediate">Intermediate</option>
                                      <option value="Beginner">Beginner</option>
                                    </select>
                                  </div>

                                  <div className="sm:col-span-1 flex justify-end">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const copy = [...founders];
                                        copy[idx].structured_skills = (copy[idx].structured_skills || []).filter((_, i) => i !== sIdx);
                                        setFounders(copy);
                                        markChanged();
                                      }}
                                      className="p-1.5 text-slate-400 hover:text-rose-400"
                                      title="Remove Skill"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* ============================================================ */}
                      {/* TAB 6: OFFICIAL SOCIAL & CONNECTIVITY                        */}
                      {/* ============================================================ */}
                      {activeTab === 'social' && (
                        <div className="space-y-4 animate-fade-in">
                          <div>
                            <h4 className="text-sm font-bold text-white">Official Social & Direct Connectivity Channels</h4>
                            <p className="text-xs text-slate-400">
                              Validated external profiles and verified channels. Cleared links will not appear on the website.
                            </p>
                          </div>

                          {/* Direct Email & Phone */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#07111e] border border-slate-800">
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Official Founder Email</label>
                              <div className="flex items-center bg-[#0a192f] border border-slate-700 rounded-lg px-2.5 py-1.5">
                                <Mail className="w-3.5 h-3.5 text-secondary mr-2 shrink-0" />
                                <input
                                  type="email"
                                  value={f.public_email || ''}
                                  onChange={e => {
                                    const copy = [...founders];
                                    copy[idx].public_email = e.target.value;
                                    setFounders(copy);
                                    markChanged();
                                  }}
                                  placeholder="founder@ravantechnologies.com"
                                  className="w-full bg-transparent text-white text-xs focus:outline-none"
                                />
                                {f.public_email && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const copy = [...founders];
                                      copy[idx].public_email = '';
                                      setFounders(copy);
                                      markChanged();
                                    }}
                                    className="text-slate-400 hover:text-white"
                                    title="Clear"
                                  >
                                    <Eraser className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Official Phone / WhatsApp</label>
                              <div className="flex items-center bg-[#0a192f] border border-slate-700 rounded-lg px-2.5 py-1.5">
                                <Phone className="w-3.5 h-3.5 text-secondary mr-2 shrink-0" />
                                <input
                                  type="tel"
                                  value={f.public_phone || ''}
                                  onChange={e => {
                                    const copy = [...founders];
                                    copy[idx].public_phone = e.target.value;
                                    setFounders(copy);
                                    markChanged();
                                  }}
                                  placeholder="+91 98765 43210"
                                  className="w-full bg-transparent text-white text-xs font-mono focus:outline-none"
                                />
                                {f.public_phone && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const copy = [...founders];
                                      copy[idx].public_phone = '';
                                      setFounders(copy);
                                      markChanged();
                                    }}
                                    className="text-slate-400 hover:text-white"
                                    title="Clear"
                                  >
                                    <Eraser className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Social Platforms List */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {SUPPORTED_SOCIAL_PLATFORMS.map(platform => {
                              const val = f.social_links?.[platform.id] || '';
                              const validation = val ? validateSocialUrl(val) : { valid: true, error: undefined, cleanUrl: '' };

                              return (
                                <div
                                  key={platform.id}
                                  className="p-3 rounded-xl bg-[#07111e] border border-slate-800 space-y-1.5"
                                >
                                  <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                                      {platform.name}
                                    </label>
                                    {val && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const copy = [...founders];
                                          copy[idx].social_links = {
                                            ...(copy[idx].social_links || {}),
                                            [platform.id]: ''
                                          };
                                          setFounders(copy);
                                          markChanged();
                                        }}
                                        className="text-[10px] text-slate-500 hover:text-rose-400 flex items-center gap-1"
                                      >
                                        <Eraser className="w-3 h-3" />
                                        <span>Clear</span>
                                      </button>
                                    )}
                                  </div>

                                  <input
                                    type="text"
                                    value={val}
                                    onChange={e => {
                                      const copy = [...founders];
                                      copy[idx].social_links = {
                                        ...(copy[idx].social_links || {}),
                                        [platform.id]: e.target.value
                                      };
                                      setFounders(copy);
                                      markChanged();
                                    }}
                                    placeholder={platform.placeholder}
                                    className={`w-full px-2.5 py-1.5 rounded bg-[#0a192f] border text-xs focus:outline-none ${
                                      val && !validation.valid
                                        ? 'border-rose-500 text-rose-300'
                                        : 'border-slate-700 text-white focus:border-secondary'
                                    }`}
                                  />

                                  {val && !validation.valid && (
                                    <span className="text-[9px] text-rose-400 flex items-center gap-1">
                                      <AlertCircle className="w-2.5 h-2.5" />
                                      <span>{validation.error || 'Invalid URL'}</span>
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* ============================================================ */}
                      {/* TAB 7: SEO / METADATA                                        */}
                      {/* ============================================================ */}
                      {activeTab === 'seo' && (
                        <div className="space-y-4 animate-fade-in p-4 rounded-xl bg-[#07111e] border border-slate-800">
                          <div>
                            <h4 className="text-sm font-bold text-white">SEO & Social Meta Tags</h4>
                            <p className="text-xs text-slate-400">Control search engine title, description, and OpenGraph parameters.</p>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Custom SEO Title</label>
                              <input
                                type="text"
                                value={f.seo_title || ''}
                                onChange={e => {
                                  const copy = [...founders];
                                  copy[idx].seo_title = e.target.value;
                                  setFounders(copy);
                                  markChanged();
                                }}
                                placeholder={`${f.name} — Founder & Architect | Ravan Technologies`}
                                className="w-full px-3 py-2 rounded-lg bg-[#0a192f] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Custom SEO Meta Description</label>
                              <textarea
                                rows={2}
                                value={f.seo_description || ''}
                                onChange={e => {
                                  const copy = [...founders];
                                  copy[idx].seo_description = e.target.value;
                                  setFounders(copy);
                                  markChanged();
                                }}
                                placeholder="Concise 150-160 character description for Google search snippets..."
                                className="w-full px-3 py-2 rounded-lg bg-[#0a192f] border border-slate-700 text-white text-xs leading-relaxed focus:border-secondary outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Canonical URL Override</label>
                              <input
                                type="text"
                                value={f.canonical_url || ''}
                                onChange={e => {
                                  const copy = [...founders];
                                  copy[idx].canonical_url = e.target.value;
                                  setFounders(copy);
                                  markChanged();
                                }}
                                placeholder={`/team/${currentSlug}`}
                                className="w-full px-3 py-2 rounded-lg bg-[#0a192f] border border-slate-700 text-white text-xs focus:border-secondary outline-none font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Image Crop Modal */}
      {activeCropIndex !== null && (
        <ImageCropModal
          isOpen={true}
          onClose={() => setActiveCropIndex(null)}
          onConfirm={handleCropConfirm}
          aspectRatioLabel="4:5 (Portrait)"
          targetBucket="avatars"
          targetFolder="founder"
          initialAltText={founders[activeCropIndex]?.name || 'Founder'}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <DeleteConfirmationModal
          isOpen={true}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          itemTitle={deleteTarget.name}
          itemType="Founder & Architect Profile"
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};
