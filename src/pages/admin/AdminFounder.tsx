import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { useToast } from '../../context/ToastContext';
import { Founder } from '../../types';
import { initialFounder } from '../../data/initialData';
import { ImageCropModal, CropResult } from '../../components/admin/ImageCropModal';
import { DeleteConfirmationModal } from '../../components/admin/DeleteConfirmationModal';
import { 
  Save, 
  Upload, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Check, 
  Layers, 
  Quote as QuoteIcon, 
  Sparkles, 
  FileText, 
  Clock, 
  Trophy,
  Eraser,
  Share2,
  Mail
} from 'lucide-react';
import { validateSocialUrl, SUPPORTED_SOCIAL_PLATFORMS } from '../../lib/socialUtils';

export const AdminFounder: React.FC = () => {
  const { showToast } = useToast();
  const [founder, setFounder] = useState<Founder>(initialFounder);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  // Granular Delete Modal State (Only for explicit destructive removals)
  const [deleteTarget, setDeleteTarget] = useState<{
    title: string;
    action: () => void;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dataService.getFounder().then(data => {
      setFounder({
        ...initialFounder,
        ...data,
        achievements: data.achievements || [],
        custom_sections: data.custom_sections || [],
        social_links: data.social_links || {}
      });
    });
  }, []);

  const handleCropConfirm = (result: CropResult) => {
    setFounder(prev => ({
      ...prev,
      image_url: result.url
    }));
    showToast('Portrait updated. Click SAVE to persist to Supabase.', 'success');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!founder.name?.trim() || !founder.designation?.trim()) {
      showToast('Founder Full Name and Designation are required.', 'error');
      return;
    }

    // Strict URL validation and sanitation for social links
    const currentLinks = founder.social_links || {};
    const cleanedLinks: Record<string, string> = {};

    for (const platform of SUPPORTED_SOCIAL_PLATFORMS) {
      const rawUrl = currentLinks[platform.id];
      if (rawUrl && typeof rawUrl === 'string' && rawUrl.trim().length > 0) {
        const valRes = validateSocialUrl(rawUrl);
        if (!valRes.valid) {
          showToast(`Validation Error (${platform.name}): ${valRes.error}`, 'error');
          return;
        }
        cleanedLinks[platform.id] = valRes.cleanUrl || rawUrl.trim();
      }
    }

    if (currentLinks.email && typeof currentLinks.email === 'string' && currentLinks.email.trim().length > 0) {
      const emailTrim = currentLinks.email.trim();
      if (!emailTrim.includes('@') || !emailTrim.includes('.')) {
        showToast('Validation Error: Please enter a valid contact email address.', 'error');
        return;
      }
      cleanedLinks.email = emailTrim;
    }

    const payloadToSave: Founder = {
      ...founder,
      social_links: cleanedLinks
    };

    setIsSaving(true);
    try {
      // 1. UPDATE/UPSERT database
      await dataService.updateFounder(payloadToSave);
      
      // 2. Read the saved record back from Supabase
      const verifiedFounder = await dataService.getFounder(true);

      // 3. Confirm the returned Founder Name matches
      if (verifiedFounder.name !== founder.name) {
        throw new Error('Verification failed: Saved name does not match submitted name.');
      }

      // 4 & 5. Update frontend state & refresh affected components
      setFounder(verifiedFounder);
      
      // 6. Show success message
      setIsSaved(true);
      showToast('Founder profile synchronized and verified across application.', 'success');
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      if (import.meta.env.DEV) console.error("Founder Save Verification Error:", err);
      showToast('Founder profile could not be saved. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Explicit Deletion Handlers with Confirmation
  const confirmDeleteTarget = (title: string, action: () => void) => {
    setDeleteTarget({ title, action });
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      deleteTarget.action();
      showToast(`Removed "${deleteTarget.title}". Click SAVE to persist.`, 'success');
      setDeleteTarget(null);
    } catch {
      showToast('Failed to execute delete.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Milestone Actions
  const addAchievement = () => {
    setFounder(prev => ({
      ...prev,
      achievements: [...(prev.achievements || []), '']
    }));
  };

  const updateAchievement = (index: number, val: string) => {
    setFounder(prev => {
      const copy = [...(prev.achievements || [])];
      copy[index] = val;
      return { ...prev, achievements: copy };
    });
  };

  const removeAchievement = (index: number) => {
    setFounder(prev => ({
      ...prev,
      achievements: (prev.achievements || []).filter((_, i) => i !== index)
    }));
  };

  // Custom Section Actions
  const addCustomSection = () => {
    const newSec = {
      id: 'custom-' + Date.now(),
      title: 'Architectural Philosophy',
      content: ''
    };
    setFounder(prev => ({
      ...prev,
      custom_sections: [...(prev.custom_sections || []), newSec]
    }));
  };

  const updateCustomSection = (id: string, field: 'title' | 'content', value: string) => {
    setFounder(prev => ({
      ...prev,
      custom_sections: (prev.custom_sections || []).map(sec => 
        sec.id === id ? { ...sec, [field]: value } : sec
      )
    }));
  };

  const removeCustomSection = (id: string) => {
    setFounder(prev => ({
      ...prev,
      custom_sections: (prev.custom_sections || []).filter(s => s.id !== id)
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <form onSubmit={handleSave} className="space-y-8 max-w-5xl pb-12">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0a192f] border border-slate-800 rounded-xl p-4 sticky top-0 z-20 backdrop-blur-md">
          <div>
            <h2 className="text-sm font-bold text-white font-display">
              Canonical Founder Profile
            </h2>
            <p className="text-xs text-slate-400">
              Empty fields persist as empty values. Only explicit "Delete Block" removes custom blocks.
            </p>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className={`px-6 py-2.5 rounded text-xs font-bold uppercase transition-all flex items-center gap-2 shadow-lg shrink-0 ${
              isSaved
                ? 'bg-emerald-500 text-white'
                : 'bg-secondary text-[#0a192f] hover:bg-secondary-fixed'
            }`}
          >
            {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'SYNCHRONIZING...' : isSaved ? 'SAVED ✓' : 'SAVE FOUNDER PROFILE'}</span>
          </button>
        </div>

        {/* 1. Core Canonical Identity (Required) */}
        <div className="bg-[#0a192f] border border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Core Canonical Identity (Required)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Founder Full Name <span className="text-secondary">*</span>
              </label>
              <input
                type="text"
                required
                value={founder.name || ''}
                onChange={e => setFounder({ ...founder, name: e.target.value })}
                placeholder="e.g. V Abishek"
                className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-bold focus:border-secondary outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Executive Title / Designation <span className="text-secondary">*</span>
              </label>
              <input
                type="text"
                required
                value={founder.designation || ''}
                onChange={e => setFounder({ ...founder, designation: e.target.value })}
                placeholder="e.g. Founder & Chief Architect"
                className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. Authentic Portrait Management */}
        <div className="bg-[#0a192f] border border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              <span>Founder Authentic Portrait</span>
            </h3>
            {founder.image_url && (
              <button
                type="button"
                onClick={() => setFounder(prev => ({ ...prev, image_url: '' }))}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded text-[10px] font-bold uppercase flex items-center gap-1 transition-colors"
                title="Clear image URL (keeps container)"
              >
                <Eraser className="w-3 h-3" />
                <span>Clear Image</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-3">
              <div className="aspect-[4/5] rounded-xl overflow-hidden border-2 border-slate-700 bg-slate-900 relative">
                <img
                  src={founder.image_url || '/images/founder-real.jpg'}
                  alt={founder.name || 'Founder'}
                  onError={(e) => { e.currentTarget.src = '/images/founder-real.jpg'; }}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="md:col-span-9 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Active Storage URL
                </label>
                <input
                  type="text"
                  value={founder.image_url || ''}
                  onChange={e => setFounder({ ...founder, image_url: e.target.value })}
                  placeholder="https://... or /images/founder-real.jpg"
                  className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-mono"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsCropModalOpen(true)}
                  className="px-4 py-2 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors flex items-center gap-1.5 shadow"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload & Crop 4:5 Portrait</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFounder(prev => ({ ...prev, image_url: '/images/founder-real.jpg' }))}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium"
                >
                  Reset Default Photo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Vision Statement Block (Always persistent in editor) */}
        <div className="bg-[#0a192f] border border-slate-800 rounded-xl p-6 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Vision Statement (Directive)</span>
            </label>
            {founder.vision ? (
              <button
                type="button"
                onClick={() => setFounder(prev => ({ ...prev, vision: '' }))}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded text-[10px] font-bold uppercase flex items-center gap-1 transition-colors"
                title="Clear text content"
              >
                <Eraser className="w-3 h-3" />
                <span>Clear</span>
              </button>
            ) : null}
          </div>
          <textarea
            rows={2}
            value={founder.vision || ''}
            onChange={e => setFounder({ ...founder, vision: e.target.value })}
            placeholder="Enter vision directive (e.g. Order through architecture; innovation through precision.)"
            className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed focus:border-secondary outline-none"
          />
        </div>

        {/* 4. Keynote Quote Block (Always persistent in editor) */}
        <div className="bg-[#0a192f] border border-slate-800 rounded-xl p-6 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
              <QuoteIcon className="w-4 h-4" />
              <span>Keynote Quote</span>
            </label>
            {founder.quote ? (
              <button
                type="button"
                onClick={() => setFounder(prev => ({ ...prev, quote: '' }))}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded text-[10px] font-bold uppercase flex items-center gap-1 transition-colors"
                title="Clear quote text"
              >
                <Eraser className="w-3 h-3" />
                <span>Clear</span>
              </button>
            ) : null}
          </div>
          <textarea
            rows={3}
            value={founder.quote || ''}
            onChange={e => setFounder({ ...founder, quote: e.target.value })}
            placeholder="Enter keynote direct address quote..."
            className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed focus:border-secondary outline-none"
          />
        </div>

        {/* 5. Professional Biography Block (Always persistent in editor) */}
        <div className="bg-[#0a192f] border border-slate-800 rounded-xl p-6 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Professional Biography</span>
            </label>
            {founder.bio ? (
              <button
                type="button"
                onClick={() => setFounder(prev => ({ ...prev, bio: '' }))}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded text-[10px] font-bold uppercase flex items-center gap-1 transition-colors"
                title="Clear bio text"
              >
                <Eraser className="w-3 h-3" />
                <span>Clear</span>
              </button>
            ) : null}
          </div>
          <textarea
            rows={6}
            value={founder.bio || ''}
            onChange={e => setFounder({ ...founder, bio: e.target.value })}
            placeholder="Enter detailed executive background..."
            className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed focus:border-secondary outline-none font-mono"
          />
        </div>

        {/* 6. Tenure Years Block (Always persistent in editor) */}
        <div className="bg-[#0a192f] border border-slate-800 rounded-xl p-6 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Tenure Experience Tag</span>
            </label>
            {founder.tenure_years ? (
              <button
                type="button"
                onClick={() => setFounder(prev => ({ ...prev, tenure_years: '' }))}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded text-[10px] font-bold uppercase flex items-center gap-1 transition-colors"
                title="Clear tenure text"
              >
                <Eraser className="w-3 h-3" />
                <span>Clear</span>
              </button>
            ) : null}
          </div>
          <input
            type="text"
            value={founder.tenure_years || ''}
            onChange={e => setFounder({ ...founder, tenure_years: e.target.value })}
            placeholder="e.g. 20+ Years"
            className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:border-secondary outline-none font-bold"
          />
        </div>

        {/* 7. Strategic Milestones */}
        <div className="bg-[#0a192f] border border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span>Strategic Milestones & Achievements</span>
            </h3>
            <button
              type="button"
              onClick={addAchievement}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Milestone</span>
            </button>
          </div>

          <div className="space-y-3">
            {(founder.achievements || []).map((ach, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="text"
                  value={ach}
                  onChange={e => updateAchievement(idx, e.target.value)}
                  placeholder={`Milestone #${idx + 1}`}
                  className="flex-1 px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeAchievement(idx)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Remove Milestone"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 8. Official Social & Public Channels */}
        <div className="bg-[#0a192f] border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              <span>Official Social & Public Channels</span>
            </h3>
            <span className="text-[10px] text-slate-400">
              Only verified channels configured here appear on the public executive profile.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SUPPORTED_SOCIAL_PLATFORMS.map(platform => {
              const currentVal = founder.social_links?.[platform.id] || '';
              const isYouTube = platform.id === 'youtube';
              const isLinkedIn = platform.id === 'linkedin';

              return (
                <div 
                  key={platform.id} 
                  className={`p-3.5 rounded-lg bg-[#07111e] border ${
                    isYouTube 
                      ? 'border-red-900/40 bg-red-950/10' 
                      : isLinkedIn 
                      ? 'border-blue-900/40 bg-blue-950/10' 
                      : 'border-slate-800'
                  } space-y-1.5`}
                >
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase text-slate-300 flex items-center gap-1.5">
                      <span>{platform.name}</span>
                      {isYouTube && (
                        <span className="px-1.5 py-0.5 bg-red-950/80 border border-red-500/50 text-red-300 text-[9px] font-bold rounded">
                          PRIORITY CHANNEL
                        </span>
                      )}
                      {isLinkedIn && (
                        <span className="px-1.5 py-0.5 bg-blue-950/80 border border-blue-500/50 text-blue-300 text-[9px] font-bold rounded">
                          PRIORITY PROFILE
                        </span>
                      )}
                    </label>
                    {currentVal ? (
                      <button
                        type="button"
                        onClick={() => {
                          setFounder(prev => ({
                            ...prev,
                            social_links: {
                              ...(prev.social_links || {}),
                              [platform.id]: ''
                            }
                          }));
                          showToast(`Cleared ${platform.name}. Click SAVE to persist.`, 'info');
                        }}
                        className="text-[9px] text-slate-400 hover:text-rose-400 uppercase font-bold flex items-center gap-0.5 transition-colors"
                        title={`Remove ${platform.name} URL`}
                      >
                        <Eraser className="w-3 h-3" />
                        <span>Clear</span>
                      </button>
                    ) : null}
                  </div>
                  <input
                    type="url"
                    value={currentVal}
                    onChange={e => {
                      const val = e.target.value;
                      setFounder(prev => ({
                        ...prev,
                        social_links: {
                          ...(prev.social_links || {}),
                          [platform.id]: val
                        }
                      }));
                    }}
                    placeholder={platform.placeholder}
                    className="w-full px-3 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs font-mono focus:border-secondary outline-none placeholder:text-slate-600"
                  />
                  <span className="text-[9px] text-slate-500 block">
                    Example: {platform.placeholder}
                  </span>
                </div>
              );
            })}

            {/* Public Contact Email */}
            <div className="p-3.5 rounded-lg bg-[#07111e] border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-secondary" />
                  <span>Public Direct Email</span>
                </label>
                {founder.social_links?.email ? (
                  <button
                    type="button"
                    onClick={() => {
                      setFounder(prev => ({
                        ...prev,
                        social_links: {
                          ...(prev.social_links || {}),
                          email: ''
                        }
                      }));
                      showToast('Cleared email. Click SAVE to persist.', 'info');
                    }}
                    className="text-[9px] text-slate-400 hover:text-rose-400 uppercase font-bold flex items-center gap-0.5 transition-colors"
                  >
                    <Eraser className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                ) : null}
              </div>
              <input
                type="email"
                value={founder.social_links?.email || ''}
                onChange={e => {
                  const val = e.target.value;
                  setFounder(prev => ({
                    ...prev,
                    social_links: {
                      ...(prev.social_links || {}),
                      email: val
                    }
                  }));
                }}
                placeholder="founder@ravantechnologies.com"
                className="w-full px-3 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs font-mono focus:border-secondary outline-none placeholder:text-slate-600"
              />
              <span className="text-[9px] text-slate-500 block">
                Direct address for corporate and institutional correspondence.
              </span>
            </div>
          </div>
        </div>

        {/* 9. Custom Content Blocks */}
        {(founder.custom_sections || []).length > 0 && (
          <div className="space-y-4">
            {(founder.custom_sections || []).map(sec => (
              <div key={sec.id} className="bg-[#0a192f] border border-slate-800 rounded-xl p-6 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <span>Custom Section</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => confirmDeleteTarget(`Custom Section: "${sec.title}"`, () => {
                      removeCustomSection(sec.id);
                    })}
                    className="px-2.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 rounded text-[10px] font-bold uppercase flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete Block</span>
                  </button>
                </div>

                <input
                  type="text"
                  value={sec.title}
                  onChange={e => updateCustomSection(sec.id, 'title', e.target.value)}
                  placeholder="Section Title (e.g. Special Directives)"
                  className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-bold focus:border-secondary outline-none"
                />

                <textarea
                  rows={3}
                  value={sec.content}
                  onChange={e => updateCustomSection(sec.id, 'content', e.target.value)}
                  placeholder="Section narrative or detailed content..."
                  className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed focus:border-secondary outline-none"
                />
              </div>
            ))}
          </div>
        )}

        {/* Add Custom Section Button */}
        <div className="p-6 rounded-2xl bg-[#0a192f]/60 border border-dashed border-slate-700 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Dynamic Custom Blocks
            </h4>
            <p className="text-[11px] text-slate-400">
              Append custom titled sections without altering the public design system.
            </p>
          </div>
          <button
            type="button"
            onClick={addCustomSection}
            className="px-4 py-2 bg-secondary/10 hover:bg-secondary/20 border border-secondary/40 text-secondary rounded text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Custom Block</span>
          </button>
        </div>
      </form>

      {/* 4:5 Crop Modal */}
      <ImageCropModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        onConfirm={handleCropConfirm}
        aspectRatioLabel="4:5 (Portrait)"
        targetBucket="avatars"
        targetFolder="founder"
        initialAltText={`${founder.name}, ${founder.designation}`}
      />

      {/* Explicit Destruction Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteTarget !== null}
        itemTitle={deleteTarget?.title}
        itemType="Custom Content Block"
        isDeleting={isDeleting}
        onConfirm={executeDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
