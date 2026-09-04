import React, { useState, useEffect } from 'react';
import { dataService, generateSlug } from '../../lib/dataService';
import { useToast } from '../../context/ToastContext';
import { 
  LeadershipMember, 
  ProfileEducation, 
  ProfileProject, 
  ProfileExperience, 
  ProfileSkill, 
  SkillCategory 
} from '../../types';
import { initialLeadership } from '../../data/initialData';
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
  Eraser
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

export const AdminLeadership: React.FC = () => {
  const { showToast } = useToast();
  const [members, setMembers] = useState<LeadershipMember[]>(initialLeadership);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeCropIndex, setActiveCropIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  
  // Tab state per member id: 'basic' | 'education' | 'projects' | 'experience' | 'skills' | 'social' | 'seo'
  const [memberTabs, setMemberTabs] = useState<Record<string, string>>({});
  
  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<LeadershipMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dataService.getLeadership().then(loaded => {
      setMembers(loaded);
    });
  }, []);

  const getActiveTab = (memberId: string): string => {
    return memberTabs[memberId] || 'basic';
  };

  const setActiveTab = (memberId: string, tab: string) => {
    setMemberTabs(prev => ({ ...prev, [memberId]: tab }));
  };

  const markChanged = () => {
    setHasUnsavedChanges(true);
  };

  const handleSaveAll = async () => {
    // 1. Strict validation of all social links across all members
    for (const m of members) {
      if (m.social_links) {
        for (const platform of SUPPORTED_SOCIAL_PLATFORMS) {
          const rawUrl = m.social_links[platform.id];
          if (rawUrl && typeof rawUrl === 'string' && rawUrl.trim().length > 0) {
            const valRes = validateSocialUrl(rawUrl);
            if (!valRes.valid) {
              showToast(`Validation Error for ${m.name || 'Executive'} (${platform.name}): ${valRes.error}`, 'error');
              return;
            }
          }
        }
      }

      if (m.public_email && typeof m.public_email === 'string' && m.public_email.trim().length > 0) {
        const emailTrim = m.public_email.trim();
        if (!emailTrim.includes('@') || !emailTrim.includes('.')) {
          showToast(`Validation Error for ${m.name}: Invalid public email address.`, 'error');
          return;
        }
      }
    }

    // 2. Clean and sanitize social links
    const sanitizedMembers = members.map(m => {
      const cleanedSocial: Record<string, string> = {};
      if (m.social_links) {
        for (const [key, val] of Object.entries(m.social_links)) {
          if (key !== '_meta' && typeof val === 'string' && val.trim().length > 0) {
            const valRes = validateSocialUrl(val);
            if (valRes.valid) {
              cleanedSocial[key] = valRes.cleanUrl || val.trim();
            }
          }
        }
      }
      return {
        ...m,
        public_email: m.public_email ? m.public_email.trim() : '',
        public_phone: m.public_phone ? m.public_phone.trim() : '',
        social_links: cleanedSocial
      };
    });

    setIsSaving(true);
    try {
      await dataService.saveLeadership(sanitizedMembers);
      
      // Verification fetch
      const verified = await dataService.getLeadership(true);
      setMembers(verified);
      
      setIsSaved(true);
      setHasUnsavedChanges(false);
      showToast('Corporate profiles persisted and synchronized with database.', 'success');
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err: any) {
      if (import.meta.env.DEV) console.error("Leadership Save Error:", err);
      showToast(`Failed to save roster: ${err.message || 'Unknown database error'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCropConfirm = async (result: CropResult) => {
    if (activeCropIndex === null) return;
    const copy = [...members];
    copy[activeCropIndex].image_url = result.url;
    setMembers(copy);
    markChanged();
    
    try {
      await dataService.saveLeadership(copy);
      showToast(`Portrait uploaded for ${copy[activeCropIndex].name} and persisted to database.`, 'success');
    } catch (err: any) {
      showToast(`Image uploaded, but database save failed: ${err.message}`, 'error');
    }
  };

  const addMember = () => {
    const newId = 'lead-' + Date.now();
    const newMember: LeadershipMember = {
      id: newId,
      name: 'New Executive Leader',
      designation: 'Vice President of Engineering',
      company_branch: 'Ravan Technologies',
      bio: '',
      image_url: '',
      slug: 'leader-' + Date.now().toString(36),
      display_order: members.length + 1,
      status: 'draft',
      short_intro: '',
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
      }
    };
    setMembers([...members, newMember]);
    setExpandedIndex(members.length);
    setActiveTab(newId, 'basic');
    markChanged();
    showToast('New executive member added. Fill details and click SAVE.', 'info');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await dataService.deleteLeadership(deleteTarget.id);
      setMembers(prev => prev.filter(m => m.id !== deleteTarget.id));
      showToast(`Permanently deleted ${deleteTarget.name} from database.`, 'success');
      setDeleteTarget(null);
    } catch {
      showToast('Failed to delete member. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-6 max-w-5xl">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0a192f] p-6 rounded-2xl border border-slate-800 shadow-md">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded bg-secondary/15 text-secondary border border-secondary/30 text-[10px] font-bold uppercase tracking-widest">
                CORPORATE CMS
              </span>
              {hasUnsavedChanges && (
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-semibold animate-pulse">
                  Unsaved Changes
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold font-display text-white tracking-tight">
              Executive Profiles & Corporate Details
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Manage structured biographies, education, projects, experience, technical skills, and verified social connectivity.
            </p>
          </div>

          <div className="flex gap-3 shrink-0">
            <button
              onClick={addMember}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Plus className="w-4 h-4 text-secondary" />
              <span>Add Leader</span>
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

        {/* Member Roster List */}
        {members.length === 0 ? (
          <div className="p-16 rounded-2xl bg-[#0a192f] border border-slate-800 text-center">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">No Leadership Members</h3>
            <p className="text-xs text-slate-400 mb-4">Click "Add Leader" to create the first executive profile.</p>
            <button
              onClick={addMember}
              className="px-4 py-2 bg-secondary text-[#0a192f] rounded-lg text-xs font-bold uppercase"
            >
              Add Executive Leader
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {members.map((m, idx) => {
              const isExpanded = expandedIndex === idx;
              const currentSlug = m.slug || generateSlug(m.name);
              const activeTab = getActiveTab(m.id);
              const initials = m.name
                ? m.name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase()
                : 'RT';

              const eduCount = m.education?.length || 0;
              const projCount = m.projects?.length || 0;
              const expCount = m.experience_records?.length || 0;
              const skillsCount = m.structured_skills?.length || 0;

              return (
                <div
                  key={m.id}
                  className="bg-[#0a192f] border border-slate-800 rounded-2xl overflow-hidden shadow-md transition-all duration-300"
                >
                  {/* Executive Header Banner */}
                  <div className="p-6 bg-[#0c1f38] border-b border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Photo Thumbnail */}
                      <div className="w-16 h-20 rounded-xl overflow-hidden bg-[#07111e] border border-slate-700/80 flex items-center justify-center shrink-0 relative shadow-inner">
                        {m.image_url ? (
                          <img
                            src={m.image_url}
                            alt={m.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-base font-bold font-display text-secondary">{initials}</span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold font-display text-white">
                            {m.name || 'Untitled Leader'}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                              m.status === 'published'
                                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                                : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                            }`}
                          >
                            {m.status || 'draft'}
                          </span>
                        </div>
                        <p className="text-xs text-secondary font-medium">
                          {m.designation || 'No Role Specified'}
                        </p>
                        <span className="inline-block text-[10px] text-slate-400 font-mono">
                          /team/{currentSlug}
                        </span>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-3 self-end md:self-center">
                      {m.status === 'published' && (
                        <a
                          href={`/team/${currentSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                        >
                          <span>View Live Profile</span>
                          <ExternalLink className="w-3.5 h-3.5 text-secondary" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                        className="px-3.5 py-1.5 bg-secondary/10 hover:bg-secondary/20 border border-secondary/40 text-secondary rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        <span>{isExpanded ? 'Collapse' : 'Edit Details'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(m)}
                        className="p-1.5 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                        title="Delete Profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Modular Sections */}
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
                          { id: 'social', label: '6. Official Social', icon: Share2, count: Object.keys(m.social_links || {}).filter(k => k !== '_meta' && !!m.social_links?.[k]).length },
                          { id: 'seo', label: '7. SEO / Metadata', icon: Globe, count: null }
                        ].map(tab => {
                          const Icon = tab.icon;
                          const isActive = activeTab === tab.id;
                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setActiveTab(m.id, tab.id)}
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
                                {m.image_url ? (
                                  <img
                                    src={m.image_url}
                                    alt={m.name}
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
                                <span>{m.image_url ? 'Change Photo' : 'Upload Photo'}</span>
                              </button>
                            </div>

                            {/* Core Fields */}
                            <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Full Name *</label>
                                <input
                                  type="text"
                                  value={m.name}
                                  onChange={e => {
                                    const copy = [...members];
                                    copy[idx].name = e.target.value;
                                    setMembers(copy);
                                    markChanged();
                                  }}
                                  className="w-full px-3 py-2 rounded-lg bg-[#07111e] border border-slate-700 text-white text-xs font-bold focus:border-secondary outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Designation / Role *</label>
                                <input
                                  type="text"
                                  value={m.designation}
                                  onChange={e => {
                                    const copy = [...members];
                                    copy[idx].designation = e.target.value;
                                    setMembers(copy);
                                    markChanged();
                                  }}
                                  className="w-full px-3 py-2 rounded-lg bg-[#07111e] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Company Branch</label>
                                <select
                                  value={m.company_branch}
                                  onChange={e => {
                                    const copy = [...members];
                                    copy[idx].company_branch = e.target.value as any;
                                    setMembers(copy);
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
                                  value={m.status}
                                  onChange={e => {
                                    const copy = [...members];
                                    copy[idx].status = e.target.value as any;
                                    setMembers(copy);
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
                                  value={m.display_order ?? 1}
                                  onChange={e => {
                                    const copy = [...members];
                                    copy[idx].display_order = parseInt(e.target.value) || 1;
                                    setMembers(copy);
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
                                    value={m.slug || ''}
                                    onChange={e => {
                                      const copy = [...members];
                                      copy[idx].slug = generateSlug(e.target.value);
                                      setMembers(copy);
                                      markChanged();
                                    }}
                                    placeholder={generateSlug(m.name)}
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
                                {(m.short_intro || '').length} characters
                              </span>
                            </div>
                            <textarea
                              rows={3}
                              value={m.short_intro || ''}
                              onChange={e => {
                                const copy = [...members];
                                copy[idx].short_intro = e.target.value;
                                setMembers(copy);
                                markChanged();
                              }}
                              placeholder="A concise, high-impact professional introduction about the team member and their focus areas..."
                              className="w-full px-3 py-2 rounded-lg bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed focus:border-secondary outline-none"
                            />
                          </div>

                          {/* Executive Biography */}
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                              Full Executive Biography
                            </label>
                            <textarea
                              rows={4}
                              value={m.bio || ''}
                              onChange={e => {
                                const copy = [...members];
                                copy[idx].bio = e.target.value;
                                setMembers(copy);
                                markChanged();
                              }}
                              placeholder="Comprehensive executive biography describing leadership role, experience, and background..."
                              className="w-full px-3 py-2 rounded-lg bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed focus:border-secondary outline-none"
                            />
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
                                const copy = [...members];
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
                                setMembers(copy);
                                markChanged();
                              }}
                              className="px-3 py-1.5 bg-secondary/15 hover:bg-secondary/25 text-secondary border border-secondary/40 rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Education</span>
                            </button>
                          </div>

                          {(m.education || []).length === 0 ? (
                            <div className="p-8 rounded-xl bg-[#07111e] border border-slate-800 text-center text-slate-400 text-xs">
                              No education records added yet. Click "+ Add Education" to add an entry.
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {(m.education || []).map((edu, eIdx) => (
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
                                          const copy = [...members];
                                          const list = [...(copy[idx].education || [])];
                                          [list[eIdx - 1], list[eIdx]] = [list[eIdx], list[eIdx - 1]];
                                          copy[idx].education = list;
                                          setMembers(copy);
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
                                          const copy = [...members];
                                          const list = [...(copy[idx].education || [])];
                                          if (eIdx === list.length - 1) return;
                                          [list[eIdx + 1], list[eIdx]] = [list[eIdx], list[eIdx + 1]];
                                          copy[idx].education = list;
                                          setMembers(copy);
                                          markChanged();
                                        }}
                                        disabled={eIdx === (m.education?.length || 0) - 1}
                                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                                        title="Move Down"
                                      >
                                        <ArrowDown className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const copy = [...members];
                                          copy[idx].education = (copy[idx].education || []).filter((_, i) => i !== eIdx);
                                          setMembers(copy);
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
                                          const copy = [...members];
                                          const list = [...(copy[idx].education || [])];
                                          list[eIdx].degree = e.target.value;
                                          copy[idx].education = list;
                                          setMembers(copy);
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
                                          const copy = [...members];
                                          const list = [...(copy[idx].education || [])];
                                          list[eIdx].institution = e.target.value;
                                          copy[idx].education = list;
                                          setMembers(copy);
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
                                          const copy = [...members];
                                          const list = [...(copy[idx].education || [])];
                                          list[eIdx].field = e.target.value;
                                          copy[idx].education = list;
                                          setMembers(copy);
                                          markChanged();
                                        }}
                                        placeholder="Department of ECE"
                                        className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Start Year</label>
                                      <input
                                        type="text"
                                        value={edu.start_year}
                                        onChange={e => {
                                          const copy = [...members];
                                          const list = [...(copy[idx].education || [])];
                                          list[eIdx].start_year = e.target.value;
                                          copy[idx].education = list;
                                          setMembers(copy);
                                          markChanged();
                                        }}
                                        placeholder="2024"
                                        className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">End Year (or leave blank)</label>
                                      <input
                                        type="text"
                                        value={edu.end_year || ''}
                                        onChange={e => {
                                          const copy = [...members];
                                          const list = [...(copy[idx].education || [])];
                                          list[eIdx].end_year = e.target.value;
                                          copy[idx].education = list;
                                          setMembers(copy);
                                          markChanged();
                                        }}
                                        placeholder="2028"
                                        className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                                      />
                                    </div>

                                    <div className="sm:col-span-3">
                                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Description (Optional)</label>
                                      <input
                                        type="text"
                                        value={edu.description || ''}
                                        onChange={e => {
                                          const copy = [...members];
                                          const list = [...(copy[idx].education || [])];
                                          list[eIdx].description = e.target.value;
                                          copy[idx].education = list;
                                          setMembers(copy);
                                          markChanged();
                                        }}
                                        placeholder="Additional focus, honors, or thesis..."
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
                              <h4 className="text-sm font-bold text-white">Strategic Deliveries & Projects</h4>
                              <p className="text-xs text-slate-400">
                                Manage individual deliverables. Deleting an entry here does not touch global projects.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const copy = [...members];
                                const currentProj = copy[idx].projects || [];
                                const newProj: ProfileProject = {
                                  id: 'proj-' + Date.now(),
                                  title: 'New Strategic Project',
                                  short_description: '',
                                  role: 'Lead Architect',
                                  technologies: [],
                                  status: 'In Progress',
                                  start_date: '2026',
                                  end_date: '',
                                  project_url: '',
                                  github_url: '',
                                  featured: true,
                                  display_order: currentProj.length + 1,
                                  is_published: true
                                };
                                copy[idx].projects = [...currentProj, newProj];
                                setMembers(copy);
                                markChanged();
                              }}
                              className="px-3 py-1.5 bg-secondary/15 hover:bg-secondary/25 text-secondary border border-secondary/40 rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Project</span>
                            </button>
                          </div>

                          {(m.projects || []).length === 0 ? (
                            <div className="p-8 rounded-xl bg-[#07111e] border border-slate-800 text-center text-slate-400 text-xs">
                              No projects registered. Click "+ Add Project" to add a deliverable.
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {(m.projects || []).map((proj, pIdx) => (
                                <div
                                  key={proj.id || pIdx}
                                  className="p-5 rounded-xl bg-[#07111e] border border-slate-800 space-y-4 shadow-sm"
                                >
                                  {/* Item Header */}
                                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-mono font-bold text-secondary">
                                        PROJECT 0{pIdx + 1}
                                      </span>
                                      <span className="text-xs font-bold text-white truncate max-w-xs">
                                        {proj.title || 'Untitled'}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <label className="flex items-center gap-1.5 text-[10px] text-slate-400 cursor-pointer mr-2">
                                        <input
                                          type="checkbox"
                                          checked={proj.is_published !== false}
                                          onChange={e => {
                                            const copy = [...members];
                                            const list = [...(copy[idx].projects || [])];
                                            list[pIdx].is_published = e.target.checked;
                                            copy[idx].projects = list;
                                            setMembers(copy);
                                            markChanged();
                                          }}
                                          className="rounded bg-[#0a192f] border-slate-700 text-secondary"
                                        />
                                        <span>Visible</span>
                                      </label>
                                      <label className="flex items-center gap-1.5 text-[10px] text-secondary cursor-pointer mr-2">
                                        <input
                                          type="checkbox"
                                          checked={!!proj.featured}
                                          onChange={e => {
                                            const copy = [...members];
                                            const list = [...(copy[idx].projects || [])];
                                            list[pIdx].featured = e.target.checked;
                                            copy[idx].projects = list;
                                            setMembers(copy);
                                            markChanged();
                                          }}
                                          className="rounded bg-[#0a192f] border-slate-700 text-secondary"
                                        />
                                        <span>Featured</span>
                                      </label>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (pIdx === 0) return;
                                          const copy = [...members];
                                          const list = [...(copy[idx].projects || [])];
                                          [list[pIdx - 1], list[pIdx]] = [list[pIdx], list[pIdx - 1]];
                                          copy[idx].projects = list;
                                          setMembers(copy);
                                          markChanged();
                                        }}
                                        disabled={pIdx === 0}
                                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                                      >
                                        <ArrowUp className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const copy = [...members];
                                          const list = [...(copy[idx].projects || [])];
                                          if (pIdx === list.length - 1) return;
                                          [list[pIdx + 1], list[pIdx]] = [list[pIdx], list[pIdx + 1]];
                                          copy[idx].projects = list;
                                          setMembers(copy);
                                          markChanged();
                                        }}
                                        disabled={pIdx === (m.projects?.length || 0) - 1}
                                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                                      >
                                        <ArrowDown className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const copy = [...members];
                                          copy[idx].projects = (copy[idx].projects || []).filter((_, i) => i !== pIdx);
                                          setMembers(copy);
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
                                        value={proj.title}
                                        onChange={e => {
                                          const copy = [...members];
                                          const list = [...(copy[idx].projects || [])];
                                          list[pIdx].title = e.target.value;
                                          copy[idx].projects = list;
                                          setMembers(copy);
                                          markChanged();
                                        }}
                                        className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs font-bold focus:border-secondary outline-none"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Status</label>
                                      <select
                                        value={proj.status}
                                        onChange={e => {
                                          const copy = [...members];
                                          const list = [...(copy[idx].projects || [])];
                                          list[pIdx].status = e.target.value;
                                          copy[idx].projects = list;
                                          setMembers(copy);
                                          markChanged();
                                        }}
                                        className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                                      >
                                        <option value="Completed">Completed</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Production">Production</option>
                                        <option value="Live">Live</option>
                                        <option value="Archived">Archived</option>
                                      </select>
                                    </div>

                                    <div className="sm:col-span-3">
                                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Short Description</label>
                                      <textarea
                                        rows={2}
                                        value={proj.short_description || ''}
                                        onChange={e => {
                                          const copy = [...members];
                                          const list = [...(copy[idx].projects || [])];
                                          list[pIdx].short_description = e.target.value;
                                          copy[idx].projects = list;
                                          setMembers(copy);
                                          markChanged();
                                        }}
                                        placeholder="Clear, professional overview of the problem and technical solution..."
                                        className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs leading-relaxed focus:border-secondary outline-none"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Role / Contribution</label>
                                      <input
                                        type="text"
                                        value={proj.role || ''}
                                        onChange={e => {
                                          const copy = [...members];
                                          const list = [...(copy[idx].projects || [])];
                                          list[pIdx].role = e.target.value;
                                          copy[idx].projects = list;
                                          setMembers(copy);
                                          markChanged();
                                        }}
                                        placeholder="e.g. Lead Architect"
                                        className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Start Date / Year</label>
                                      <input
                                        type="text"
                                        value={proj.start_date || ''}
                                        onChange={e => {
                                          const copy = [...members];
                                          const list = [...(copy[idx].projects || [])];
                                          list[pIdx].start_date = e.target.value;
                                          copy[idx].projects = list;
                                          setMembers(copy);
                                          markChanged();
                                        }}
                                        placeholder="2025"
                                        className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">End Date / Year</label>
                                      <input
                                        type="text"
                                        value={proj.end_date || ''}
                                        onChange={e => {
                                          const copy = [...members];
                                          const list = [...(copy[idx].projects || [])];
                                          list[pIdx].end_date = e.target.value;
                                          copy[idx].projects = list;
                                          setMembers(copy);
                                          markChanged();
                                        }}
                                        placeholder="Present"
                                        className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                                      />
                                    </div>

                                    <div className="sm:col-span-3">
                                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Technologies / Tech Stack (Comma separated)</label>
                                      <input
                                        type="text"
                                        value={(proj.technologies || []).join(', ')}
                                        onChange={e => {
                                          const copy = [...members];
                                          const list = [...(copy[idx].projects || [])];
                                          list[pIdx].technologies = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                          copy[idx].projects = list;
                                          setMembers(copy);
                                          markChanged();
                                        }}
                                        placeholder="React, TypeScript, TensorFlow Lite, ESP32"
                                        className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Project Demo URL</label>
                                      <input
                                        type="url"
                                        value={proj.project_url || ''}
                                        onChange={e => {
                                          const copy = [...members];
                                          const list = [...(copy[idx].projects || [])];
                                          list[pIdx].project_url = e.target.value;
                                          copy[idx].projects = list;
                                          setMembers(copy);
                                          markChanged();
                                        }}
                                        placeholder="https://example.com"
                                        className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">GitHub Repo URL</label>
                                      <input
                                        type="url"
                                        value={proj.github_url || ''}
                                        onChange={e => {
                                          const copy = [...members];
                                          const list = [...(copy[idx].projects || [])];
                                          list[pIdx].github_url = e.target.value;
                                          copy[idx].projects = list;
                                          setMembers(copy);
                                          markChanged();
                                        }}
                                        placeholder="https://github.com/..."
                                        className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Display Order</label>
                                      <input
                                        type="number"
                                        min="1"
                                        value={proj.display_order ?? pIdx + 1}
                                        onChange={e => {
                                          const copy = [...members];
                                          const list = [...(copy[idx].projects || [])];
                                          list[pIdx].display_order = parseInt(e.target.value) || 1;
                                          copy[idx].projects = list;
                                          setMembers(copy);
                                          markChanged();
                                        }}
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
                      {/* TAB 4: EXPERIENCE                                            */}
                      {/* ============================================================ */}
                      {activeTab === 'experience' && (
                        <div className="space-y-4 animate-fade-in">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-bold text-white">Professional Experience</h4>
                              <p className="text-xs text-slate-400">Manage career positions, responsibilities, and key achievements.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const copy = [...members];
                                const currentExp = copy[idx].experience_records || [];
                                const newExp: ProfileExperience = {
                                  id: 'exp-' + Date.now(),
                                  organization: 'Ravan Technologies',
                                  role: 'Executive Leader',
                                  start_date: '2025',
                                  end_date: '',
                                  is_current: true,
                                  description: '',
                                  responsibilities: [],
                                  contributions: []
                                };
                                copy[idx].experience_records = [...currentExp, newExp];
                                setMembers(copy);
                                markChanged();
                              }}
                              className="px-3 py-1.5 bg-secondary/15 hover:bg-secondary/25 text-secondary border border-secondary/40 rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Experience</span>
                            </button>
                          </div>

                          {(m.experience_records || []).length === 0 ? (
                            <div className="p-8 rounded-xl bg-[#07111e] border border-slate-800 text-center text-slate-400 text-xs">
                              No experience entries added. Click "+ Add Experience" to create an entry.
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {(m.experience_records || []).map((exp, xIdx) => (
                                <div
                                  key={exp.id || xIdx}
                                  className="p-5 rounded-xl bg-[#07111e] border border-slate-800 space-y-3"
                                >
                                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-mono font-bold text-secondary">
                                        POSITION #{xIdx + 1}
                                      </span>
                                      <span className="text-xs font-bold text-white truncate max-w-xs">
                                        {exp.role || 'Untitled Role'} — {exp.organization || 'Organization'}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <label className="flex items-center gap-1.5 text-[10px] text-emerald-400 cursor-pointer mr-2">
                                        <input
                                          type="checkbox"
                                          checked={!!exp.is_current}
                                          onChange={e => {
                                            const copy = [...members];
                                            const list = [...(copy[idx].experience_records || [])];
                                            list[xIdx].is_current = e.target.checked;
                                            if (e.target.checked) list[xIdx].end_date = '';
                                            copy[idx].experience_records = list;
                                            setMembers(copy);
                                            markChanged();
                                          }}
                                          className="rounded bg-[#0a192f] border-slate-700 text-emerald-500"
                                        />
                                        <span>Current Position</span>
                                      </label>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const copy = [...members];
                                          copy[idx].experience_records = (copy[idx].experience_records || []).filter((_, i) => i !== xIdx);
                                          setMembers(copy);
                                          markChanged();
                                        }}
                                        className="p-1 text-slate-400 hover:text-rose-400"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Organization / Company *</label>
                                      <input
                                        type="text"
                                        value={exp.organization}
                                        onChange={e => {
                                          const copy = [...members];
                                          const list = [...(copy[idx].experience_records || [])];
                                          list[xIdx].organization = e.target.value;
                                          copy[idx].experience_records = list;
                                          setMembers(copy);
                                          markChanged();
                                        }}
                                        className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs font-bold focus:border-secondary outline-none"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Role / Position *</label>
                                      <input
                                        type="text"
                                        value={exp.role}
                                        onChange={e => {
                                          const copy = [...members];
                                          const list = [...(copy[idx].experience_records || [])];
                                          list[xIdx].role = e.target.value;
                                          copy[idx].experience_records = list;
                                          setMembers(copy);
                                          markChanged();
                                        }}
                                        className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Start Date / Year</label>
                                      <input
                                        type="text"
                                        value={exp.start_date}
                                        onChange={e => {
                                          const copy = [...members];
                                          const list = [...(copy[idx].experience_records || [])];
                                          list[xIdx].start_date = e.target.value;
                                          copy[idx].experience_records = list;
                                          setMembers(copy);
                                          markChanged();
                                        }}
                                        placeholder="2024"
                                        className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">End Date / Year</label>
                                      <input
                                        type="text"
                                        value={exp.is_current ? 'CURRENT' : (exp.end_date || '')}
                                        disabled={!!exp.is_current}
                                        onChange={e => {
                                          const copy = [...members];
                                          const list = [...(copy[idx].experience_records || [])];
                                          list[xIdx].end_date = e.target.value;
                                          copy[idx].experience_records = list;
                                          setMembers(copy);
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
                                          const copy = [...members];
                                          const list = [...(copy[idx].experience_records || [])];
                                          list[xIdx].description = e.target.value;
                                          copy[idx].experience_records = list;
                                          setMembers(copy);
                                          markChanged();
                                        }}
                                        placeholder="High-level mandate and contributions..."
                                        className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs leading-relaxed focus:border-secondary outline-none"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Key Responsibilities (One per line)</label>
                                      <textarea
                                        rows={3}
                                        value={(exp.responsibilities || []).join('\n')}
                                        onChange={e => {
                                          const copy = [...members];
                                          const list = [...(copy[idx].experience_records || [])];
                                          list[xIdx].responsibilities = e.target.value.split('\n').filter(Boolean);
                                          copy[idx].experience_records = list;
                                          setMembers(copy);
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
                                          const copy = [...members];
                                          const list = [...(copy[idx].experience_records || [])];
                                          list[xIdx].contributions = e.target.value.split('\n').filter(Boolean);
                                          copy[idx].experience_records = list;
                                          setMembers(copy);
                                          markChanged();
                                        }}
                                        placeholder="Won 1st Prize at National Symposium"
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
                                const copy = [...members];
                                const currentSkills = copy[idx].structured_skills || [];
                                const newSkill: ProfileSkill = {
                                  id: 'skill-' + Date.now(),
                                  name: '',
                                  category: 'Programming',
                                  proficiency: 'Advanced',
                                  display_order: currentSkills.length + 1
                                };
                                copy[idx].structured_skills = [...currentSkills, newSkill];
                                setMembers(copy);
                                markChanged();
                              }}
                              className="px-3 py-1.5 bg-secondary/15 hover:bg-secondary/25 text-secondary border border-secondary/40 rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Skill</span>
                            </button>
                          </div>

                          {(m.structured_skills || []).length === 0 ? (
                            <div className="p-8 rounded-xl bg-[#07111e] border border-slate-800 text-center text-slate-400 text-xs">
                              No structured skills registered. Click "+ Add Skill" to start.
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {(m.structured_skills || []).map((sk, sIdx) => (
                                <div
                                  key={sk.id || sIdx}
                                  className="p-3 rounded-xl bg-[#07111e] border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                                >
                                  <div className="sm:col-span-5">
                                    <input
                                      type="text"
                                      value={sk.name}
                                      onChange={e => {
                                        const copy = [...members];
                                        const list = [...(copy[idx].structured_skills || [])];
                                        list[sIdx].name = e.target.value;
                                        copy[idx].structured_skills = list;
                                        setMembers(copy);
                                        markChanged();
                                      }}
                                      placeholder="Skill Name (e.g. Python, ESP32, Docker)"
                                      className="w-full px-2.5 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs font-medium focus:border-secondary outline-none"
                                    />
                                  </div>

                                  <div className="sm:col-span-4">
                                    <select
                                      value={sk.category}
                                      onChange={e => {
                                        const copy = [...members];
                                        const list = [...(copy[idx].structured_skills || [])];
                                        list[sIdx].category = e.target.value as SkillCategory;
                                        copy[idx].structured_skills = list;
                                        setMembers(copy);
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
                                      value={sk.proficiency || 'Advanced'}
                                      onChange={e => {
                                        const copy = [...members];
                                        const list = [...(copy[idx].structured_skills || [])];
                                        list[sIdx].proficiency = e.target.value;
                                        copy[idx].structured_skills = list;
                                        setMembers(copy);
                                        markChanged();
                                      }}
                                      className="w-full px-2 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                                    >
                                      <option value="Advanced">Advanced</option>
                                      <option value="Expert">Expert</option>
                                      <option value="Intermediate">Intermediate</option>
                                      <option value="Beginner">Beginner</option>
                                    </select>
                                  </div>

                                  <div className="sm:col-span-1 flex justify-end">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const copy = [...members];
                                        copy[idx].structured_skills = (copy[idx].structured_skills || []).filter((_, i) => i !== sIdx);
                                        setMembers(copy);
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
                            <h4 className="text-sm font-bold text-white">Official Social & Connectivity Channels</h4>
                            <p className="text-xs text-slate-400">
                              Validated external profiles and direct contact channels. Cleared links will not appear on the website.
                            </p>
                          </div>

                          {/* Direct Email & Phone */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#07111e] border border-slate-800">
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Official Executive Email</label>
                              <div className="flex items-center bg-[#0a192f] border border-slate-700 rounded-lg px-2.5 py-1.5">
                                <Mail className="w-3.5 h-3.5 text-secondary mr-2 shrink-0" />
                                <input
                                  type="email"
                                  value={m.public_email || ''}
                                  onChange={e => {
                                    const copy = [...members];
                                    copy[idx].public_email = e.target.value;
                                    setMembers(copy);
                                    markChanged();
                                  }}
                                  placeholder="executive@ravantechnologies.com"
                                  className="w-full bg-transparent text-white text-xs focus:outline-none"
                                />
                                {m.public_email && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const copy = [...members];
                                      copy[idx].public_email = '';
                                      setMembers(copy);
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
                                  value={m.public_phone || ''}
                                  onChange={e => {
                                    const copy = [...members];
                                    copy[idx].public_phone = e.target.value;
                                    setMembers(copy);
                                    markChanged();
                                  }}
                                  placeholder="+91 98765 43210"
                                  className="w-full bg-transparent text-white text-xs font-mono focus:outline-none"
                                />
                                {m.public_phone && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const copy = [...members];
                                      copy[idx].public_phone = '';
                                      setMembers(copy);
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
                              const val = m.social_links?.[platform.id] || '';
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
                                          const copy = [...members];
                                          copy[idx].social_links = {
                                            ...(copy[idx].social_links || {}),
                                            [platform.id]: ''
                                          };
                                          setMembers(copy);
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
                                      const copy = [...members];
                                      copy[idx].social_links = {
                                        ...(copy[idx].social_links || {}),
                                        [platform.id]: e.target.value
                                      };
                                      setMembers(copy);
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
                                value={m.seo_title || ''}
                                onChange={e => {
                                  const copy = [...members];
                                  copy[idx].seo_title = e.target.value;
                                  setMembers(copy);
                                  markChanged();
                                }}
                                placeholder={`${m.name} — ${m.designation} | Ravan Technologies`}
                                className="w-full px-3 py-2 rounded-lg bg-[#0a192f] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Custom SEO Meta Description</label>
                              <textarea
                                rows={2}
                                value={m.seo_description || ''}
                                onChange={e => {
                                  const copy = [...members];
                                  copy[idx].seo_description = e.target.value;
                                  setMembers(copy);
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
                                value={m.canonical_url || ''}
                                onChange={e => {
                                  const copy = [...members];
                                  copy[idx].canonical_url = e.target.value;
                                  setMembers(copy);
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
          targetFolder="leadership"
          initialAltText={members[activeCropIndex]?.name || 'Executive'}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <DeleteConfirmationModal
          isOpen={true}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          itemTitle={deleteTarget.name}
          itemType="Executive Leadership Profile"
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};
