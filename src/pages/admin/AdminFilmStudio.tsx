import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { useToast } from '../../context/ToastContext';
import { EcosystemItem, EcosystemFeature } from '../../types';
import { initialEcosystem } from '../../data/initialData';
import { ImageCropModal, CropResult } from '../../components/admin/ImageCropModal';
import {
  Clapperboard,
  Save,
  Plus,
  Trash2,
  Upload,
  MapPin,
  ExternalLink,
  Layers,
  Video,
  Sparkles
} from 'lucide-react';

export const AdminFilmStudio: React.FC = () => {
  const { showToast } = useToast();
  const [studio, setStudio] = useState<EcosystemItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'facilities' | 'features' | 'gallery'>('general');
  const [isCropOpen, setIsCropOpen] = useState(false);

  useEffect(() => {
    dataService.getEcosystem().then(items => {
      const st = items.find(i => i.type === 'studio') || items[1] || initialEcosystem[1];
      setStudio(JSON.parse(JSON.stringify(st)));
      setLoading(false);
    }).catch(() => {
      setStudio(JSON.parse(JSON.stringify(initialEcosystem[1])));
      setLoading(false);
    });
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!studio) return;

    setIsSaving(true);
    try {
      const all = await dataService.getEcosystem();
      const updated = all.map(item => (item.id === studio.id ? studio : item));
      await dataService.saveEcosystem(updated);
      showToast('Ravan Film Studio specifications saved.', 'success');
    } catch (err: any) {
      console.error('Error saving Film Studio:', err);
      showToast(err?.message || 'Failed to save Film Studio specifications.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCropResult = (res: CropResult) => {
    if (!studio) return;
    setStudio({
      ...studio,
      image_url: res.url
    });
    showToast('Studio hero image updated.', 'success');
  };

  const handleAddFeature = () => {
    if (!studio) return;
    const newFeature: EcosystemFeature = {
      title: 'Virtual Production Capability',
      description: 'Describe soundstage pipeline and tracking technology...',
      icon: 'Clapperboard'
    };
    setStudio({
      ...studio,
      features: [...(studio.features || []), newFeature]
    });
  };

  const handleRemoveFeature = (index: number) => {
    if (!studio) return;
    setStudio({
      ...studio,
      features: studio.features.filter((_, idx) => idx !== index)
    });
  };

  if (loading || !studio) {
    return <div className="p-12 text-center text-xs text-slate-500 font-mono">Loading Film Studio data...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in font-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-[#0a192f] p-5 border border-slate-800 rounded-xl">
        <div>
          <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
            <Clapperboard className="w-5 h-5 text-secondary" />
            Ravan Film Studio & Virtual Production CMS
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage virtual LED volume soundstage specifications, real-time Unreal Engine 5.4 pipelines, and cinematic ventures.
          </p>
        </div>

        <button
          onClick={() => handleSave()}
          disabled={isSaving}
          className="px-6 py-2.5 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors flex items-center justify-center gap-1.5 shadow"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'SAVING...' : 'SAVE STUDIO SPECS'}</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-4 px-4 border-b border-slate-800 text-xs font-bold uppercase">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'general' ? 'border-secondary text-secondary' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Overview & Metrics
        </button>
        <button
          onClick={() => setActiveTab('facilities')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'facilities' ? 'border-secondary text-secondary' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Soundstage & Pipelines
        </button>
        <button
          onClick={() => setActiveTab('features')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'features' ? 'border-secondary text-secondary' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Production Features ({studio.features?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'gallery' ? 'border-secondary text-secondary' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Media & Showreels
        </button>
      </div>

      {/* Tab Contents */}
      <div className="bg-[#0a192f] border border-slate-800 rounded-xl p-6 space-y-6 max-w-5xl">
        {activeTab === 'general' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Studio Name *</label>
                <input
                  type="text"
                  value={studio.name}
                  onChange={e => setStudio({ ...studio, name: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-secondary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Status Badge</label>
                <input
                  type="text"
                  value={studio.status_badge || 'ACTIVE SOUNDSTAGE'}
                  onChange={e => setStudio({ ...studio, status_badge: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Tagline</label>
              <input
                type="text"
                value={studio.tagline}
                onChange={e => setStudio({ ...studio, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
              />
            </div>

            {/* Metrics */}
            <div className="p-4 bg-[#07111e] rounded-xl border border-slate-800 space-y-3">
              <span className="text-[10px] font-bold uppercase text-secondary tracking-wider block">Production Key Metric</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Value</label>
                  <input
                    type="text"
                    value={studio.metrics?.value || ''}
                    onChange={e => setStudio({
                      ...studio,
                      metrics: { ...(studio.metrics || { value: '', label: '' }), value: e.target.value }
                    })}
                    placeholder="e.g. 8K REALTIME"
                    className="w-full px-3 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Metric Label</label>
                  <input
                    type="text"
                    value={studio.metrics?.label || ''}
                    onChange={e => setStudio({
                      ...studio,
                      metrics: { ...(studio.metrics || { value: '', label: '' }), label: e.target.value }
                    })}
                    placeholder="e.g. Virtual LED Volume Pipeline"
                    className="w-full px-3 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Sublabel / Spec</label>
                  <input
                    type="text"
                    value={studio.metrics?.sublabel || ''}
                    onChange={e => setStudio({
                      ...studio,
                      metrics: { ...(studio.metrics || { value: '', label: '' }), sublabel: e.target.value }
                    })}
                    placeholder="e.g. Unreal Engine 5.4 In-Camera VFX"
                    className="w-full px-3 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Studio Location</label>
                <input
                  type="text"
                  value={studio.address || studio.location || ''}
                  onChange={e => setStudio({ ...studio, address: e.target.value, location: e.target.value })}
                  placeholder="Thiruvannamalai, Tamil Nadu, India"
                  className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Booking & Production Inquiries</label>
                <input
                  type="text"
                  value={studio.contact_info || ''}
                  onChange={e => setStudio({ ...studio, contact_info: e.target.value })}
                  placeholder="filmstudio@ravantechnologies.com"
                  className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Executive Summary Description</label>
              <textarea
                rows={3}
                value={studio.description}
                onChange={e => setStudio({ ...studio, description: e.target.value })}
                className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed focus:outline-none focus:border-secondary"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Comprehensive Studio Overview</label>
              <textarea
                rows={5}
                value={studio.overview || ''}
                onChange={e => setStudio({ ...studio, overview: e.target.value })}
                placeholder="Detailed technical overview of LED volume curves, motion capture pipelines, high-throughput render farm..."
                className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed focus:outline-none focus:border-secondary"
              />
            </div>
          </div>
        )}

        {activeTab === 'facilities' && (
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Soundstage Facilities (One per line)
              </label>
              <textarea
                rows={5}
                value={(studio.facilities || []).join('\n')}
                onChange={e => setStudio({
                  ...studio,
                  facilities: e.target.value.split('\n').filter(Boolean)
                })}
                placeholder="400 sqm Curved Virtual LED Volume&#10;Sub-millisecond Camera & Optitrack Systems&#10;Dolby Atmos 9.1.4 Mastering Studio&#10;Live High-Throughput Render Farm"
                className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-mono leading-relaxed focus:outline-none focus:border-secondary"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Technical Pipelines & Specifications (One per line)
              </label>
              <textarea
                rows={5}
                value={(studio.specifications || []).join('\n')}
                onChange={e => setStudio({
                  ...studio,
                  specifications: e.target.value.split('\n').filter(Boolean)
                })}
                placeholder="Unreal Engine 5.4 Live Stage synchronization&#10;Brompton Tessera SX40 4K LED Processors&#10;SMPTE 2110 IP Video Architecture&#10;12-bit RAW 8K Color Pipeline"
                className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-mono leading-relaxed focus:outline-none focus:border-secondary"
              />
            </div>
          </div>
        )}

        {activeTab === 'features' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">Virtual production modules and soundstage capabilities.</p>
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-3 py-1.5 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Feature</span>
              </button>
            </div>

            <div className="space-y-3">
              {(studio.features || []).map((feat, idx) => (
                <div key={idx} className="p-4 bg-[#07111e] border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="text"
                      value={feat.title}
                      onChange={e => {
                        const copy = [...studio.features];
                        copy[idx].title = e.target.value;
                        setStudio({ ...studio, features: copy });
                      }}
                      placeholder="Capability Title"
                      className="flex-1 px-3 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="p-1.5 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={feat.description}
                    onChange={e => {
                      const copy = [...studio.features];
                      copy[idx].description = e.target.value;
                      setStudio({ ...studio, features: copy });
                    }}
                    placeholder="Capability description and technical specs..."
                    className="w-full px-3 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Primary Hero Image URL</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={studio.image_url}
                  onChange={e => setStudio({ ...studio, image_url: e.target.value })}
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

            {studio.image_url && (
              <div className="h-48 rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                <img src={studio.image_url} alt="Studio preview" className="w-full h-full object-cover" />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Studio Gallery Image URLs (One URL per line)
              </label>
              <textarea
                rows={4}
                value={(studio.gallery || []).join('\n')}
                onChange={e => setStudio({
                  ...studio,
                  gallery: e.target.value.split('\n').filter(Boolean)
                })}
                placeholder="https://images.unsplash.com/...&#10;https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-mono leading-relaxed focus:outline-none focus:border-secondary"
              />
            </div>
          </div>
        )}
      </div>

      <ImageCropModal
        isOpen={isCropOpen}
        onClose={() => setIsCropOpen(false)}
        onConfirm={handleCropResult}
        aspectRatioLabel="16:9 (Landscape)"
        targetBucket="ecosystem"
        targetFolder="film-studio"
      />
    </div>
  );
};
