import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { useToast } from '../../context/ToastContext';
import { EcosystemItem, EcosystemFeature } from '../../types';
import { initialEcosystem } from '../../data/initialData';
import { ImageCropModal, CropResult } from '../../components/admin/ImageCropModal';
import {
  Building2,
  Save,
  Plus,
  Trash2,
  Upload,
  MapPin,
  ExternalLink,
  Layers,
  CheckCircle2,
  Video,
  Image as ImageIcon
} from 'lucide-react';

export const AdminTechPark: React.FC = () => {
  const { showToast } = useToast();
  const [techPark, setTechPark] = useState<EcosystemItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'facilities' | 'features' | 'gallery'>('general');
  const [isCropOpen, setIsCropOpen] = useState(false);

  useEffect(() => {
    dataService.getEcosystem().then(items => {
      const tp = items.find(i => i.type === 'hub') || items[0] || initialEcosystem[0];
      setTechPark(JSON.parse(JSON.stringify(tp)));
      setLoading(false);
    }).catch(() => {
      setTechPark(JSON.parse(JSON.stringify(initialEcosystem[0])));
      setLoading(false);
    });
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!techPark) return;

    setIsSaving(true);
    try {
      const all = await dataService.getEcosystem();
      const updated = all.map(item => (item.id === techPark.id ? techPark : item));
      await dataService.saveEcosystem(updated);
      showToast('Ravan Tech Park campus specifications saved.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to save Tech Park specifications.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCropResult = (res: CropResult) => {
    if (!techPark) return;
    setTechPark({
      ...techPark,
      image_url: res.url
    });
    showToast('Campus hero image updated.', 'success');
  };

  const handleAddFeature = () => {
    if (!techPark) return;
    const newFeature: EcosystemFeature = {
      title: 'New Campus Facility',
      description: 'Describe facility architecture and capacity...',
      icon: 'Building2'
    };
    setTechPark({
      ...techPark,
      features: [...(techPark.features || []), newFeature]
    });
  };

  const handleRemoveFeature = (index: number) => {
    if (!techPark) return;
    setTechPark({
      ...techPark,
      features: techPark.features.filter((_, idx) => idx !== index)
    });
  };

  if (loading || !techPark) {
    return <div className="p-12 text-center text-xs text-slate-500 font-mono">Loading Tech Park data...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in font-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-[#0a192f] p-5 border border-slate-800 rounded-xl">
        <div>
          <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-secondary" />
            Ravan Tech Park Infrastructure CMS
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage 120,000+ sq ft campus specifications, Tier-4 datacenter details, testing facilities, and physical testbeds.
          </p>
        </div>

        <button
          onClick={() => handleSave()}
          disabled={isSaving}
          className="px-6 py-2.5 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors flex items-center justify-center gap-1.5 shadow"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'SAVING...' : 'SAVE TECH PARK'}</span>
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
          Facilities & Specs
        </button>
        <button
          onClick={() => setActiveTab('features')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'features' ? 'border-secondary text-secondary' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Architectural Features ({techPark.features?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'gallery' ? 'border-secondary text-secondary' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Media & Imagery
        </button>
      </div>

      {/* Tab Contents */}
      <div className="bg-[#0a192f] border border-slate-800 rounded-xl p-6 space-y-6 max-w-5xl">
        {activeTab === 'general' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Campus Name *</label>
                <input
                  type="text"
                  value={techPark.name}
                  onChange={e => setTechPark({ ...techPark, name: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-secondary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Status Badge</label>
                <input
                  type="text"
                  value={techPark.status_badge || 'OPERATIONAL'}
                  onChange={e => setTechPark({ ...techPark, status_badge: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Tagline</label>
              <input
                type="text"
                value={techPark.tagline}
                onChange={e => setTechPark({ ...techPark, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
              />
            </div>

            {/* Metrics */}
            <div className="p-4 bg-[#07111e] rounded-xl border border-slate-800 space-y-3">
              <span className="text-[10px] font-bold uppercase text-secondary tracking-wider block">Primary Key Metric</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Value</label>
                  <input
                    type="text"
                    value={techPark.metrics?.value || ''}
                    onChange={e => setTechPark({
                      ...techPark,
                      metrics: { ...(techPark.metrics || { value: '', label: '' }), value: e.target.value }
                    })}
                    placeholder="e.g. 120,000+ SQ FT"
                    className="w-full px-3 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Metric Label</label>
                  <input
                    type="text"
                    value={techPark.metrics?.label || ''}
                    onChange={e => setTechPark({
                      ...techPark,
                      metrics: { ...(techPark.metrics || { value: '', label: '' }), label: e.target.value }
                    })}
                    placeholder="e.g. Physical R&D Footprint"
                    className="w-full px-3 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Sublabel / Spec</label>
                  <input
                    type="text"
                    value={techPark.metrics?.sublabel || ''}
                    onChange={e => setTechPark({
                      ...techPark,
                      metrics: { ...(techPark.metrics || { value: '', label: '' }), sublabel: e.target.value }
                    })}
                    placeholder="e.g. Tier-4 Architecture"
                    className="w-full px-3 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Campus Location / Address</label>
                <input
                  type="text"
                  value={techPark.address || techPark.location || ''}
                  onChange={e => setTechPark({ ...techPark, address: e.target.value, location: e.target.value })}
                  placeholder="Thiruvannamalai, Tamil Nadu, India"
                  className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Contact / Leasing Directive</label>
                <input
                  type="text"
                  value={techPark.contact_info || ''}
                  onChange={e => setTechPark({ ...techPark, contact_info: e.target.value })}
                  placeholder="techpark@ravantechnologies.com"
                  className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Executive Summary Description</label>
              <textarea
                rows={3}
                value={techPark.description}
                onChange={e => setTechPark({ ...techPark, description: e.target.value })}
                className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed focus:outline-none focus:border-secondary"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Comprehensive Campus Overview</label>
              <textarea
                rows={5}
                value={techPark.overview || ''}
                onChange={e => setTechPark({ ...techPark, overview: e.target.value })}
                placeholder="Detailed technical overview of facilities, redundant utility grids, sovereign data center tiers..."
                className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed focus:outline-none focus:border-secondary"
              />
            </div>
          </div>
        )}

        {activeTab === 'facilities' && (
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Campus Facilities (One per line)
              </label>
              <textarea
                rows={5}
                value={(techPark.facilities || []).join('\n')}
                onChange={e => setTechPark({
                  ...techPark,
                  facilities: e.target.value.split('\n').filter(Boolean)
                })}
                placeholder="Tier-4 Sovereign Data Center&#10;Hardware Testing & Prototyping Labs&#10;Autonomous Drone Test Corridor&#10;500-Seat Engineering Amphitheatre"
                className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-mono leading-relaxed focus:outline-none focus:border-secondary"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Engineering Specifications (One per line)
              </label>
              <textarea
                rows={5}
                value={(techPark.specifications || []).join('\n')}
                onChange={e => setTechPark({
                  ...techPark,
                  specifications: e.target.value.split('\n').filter(Boolean)
                })}
                placeholder="Redundant 10Gbps dedicated fiber backbones&#10;N+1 diesel generator backup with 72-hour fuel reserves&#10;Biometric multi-factor security zones&#10;Solar power generation array"
                className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-mono leading-relaxed focus:outline-none focus:border-secondary"
              />
            </div>
          </div>
        )}

        {activeTab === 'features' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">Architectural modules and engineering hubs within the Tech Park.</p>
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
              {(techPark.features || []).map((feat, idx) => (
                <div key={idx} className="p-4 bg-[#07111e] border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="text"
                      value={feat.title}
                      onChange={e => {
                        const copy = [...techPark.features];
                        copy[idx].title = e.target.value;
                        setTechPark({ ...techPark, features: copy });
                      }}
                      placeholder="Feature Title"
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
                      const copy = [...techPark.features];
                      copy[idx].description = e.target.value;
                      setTechPark({ ...techPark, features: copy });
                    }}
                    placeholder="Feature description and technical parameters..."
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
                  value={techPark.image_url}
                  onChange={e => setTechPark({ ...techPark, image_url: e.target.value })}
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

            {techPark.image_url && (
              <div className="h-48 rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                <img src={techPark.image_url} alt="Campus preview" className="w-full h-full object-cover" />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Campus Gallery Image URLs (One URL per line)
              </label>
              <textarea
                rows={4}
                value={(techPark.gallery || []).join('\n')}
                onChange={e => setTechPark({
                  ...techPark,
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
        targetFolder="tech-park"
      />
    </div>
  );
};
