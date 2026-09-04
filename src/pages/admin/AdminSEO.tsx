import React, { useState, useEffect } from 'react';
import { dataService, generateSlug } from '../../lib/dataService';
import { useToast } from '../../context/ToastContext';
import { SEOSettings, SiteSettings, Founder, LeadershipMember, SEOHealthIssue } from '../../types';
import { initialSEOSettings, initialSiteSettings } from '../../data/initialData';
import { buildPageJsonLdGraph, buildFounderPersonSchema, buildTeamMemberPersonSchema, PRODUCTION_DOMAIN } from '../../lib/seoService';
import { runSEOAudit } from '../../lib/seoAuditor';
import { ImageCropModal, CropResult } from '../../components/admin/ImageCropModal';
import { 
  Save, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Shield, 
  Globe, 
  FileCode, 
  Building2, 
  User, 
  Users, 
  ExternalLink, 
  Check, 
  Upload, 
  Copy,
  Layers,
  Sparkles,
  Link as LinkIcon,
  Activity,
  Smartphone,
  Monitor,
  RotateCw,
  AlertCircle,
  Eye,
  Share2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminSEO: React.FC = () => {
  const { showToast } = useToast();
  const [seo, setSeo] = useState<SEOSettings>(initialSEOSettings);
  const [site, setSite] = useState<SiteSettings>(initialSiteSettings);
  const [founder, setFounder] = useState<Founder | null>(null);
  const [leadership, setLeadership] = useState<LeadershipMember[]>([]);
  const [healthIssues, setHealthIssues] = useState<SEOHealthIssue[]>([]);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'general' | 'organization' | 'founder' | 'team' | 'schema' | 'sitemap'>('overview');
  const [serpDevice, setSerpDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [auditFilter, setAuditFilter] = useState<'all' | 'error' | 'warning' | 'pass'>('all');
  const [isRefreshingAudit, setIsRefreshingAudit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);

  useEffect(() => {
    dataService.getSEOSettings().then(setSeo);
    dataService.getSiteSettings().then(setSite);
    dataService.getFounder().then(setFounder);
    dataService.getLeadership().then(setLeadership);
    dataService.getSEOHealthReport().then(setHealthIssues);
  }, []);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await dataService.updateSEOSettings(seo);
      setIsSaved(true);
      showToast('General SEO configuration persisted to database.', 'success');
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err: any) {
      showToast(`Failed to save SEO configuration: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await dataService.updateSiteSettings(site);
      setIsSaved(true);
      showToast('Organization Entity metadata updated in database.', 'success');
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err: any) {
      showToast(`Failed to save Organization settings: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCropConfirm = async (result: CropResult) => {
    setShowCropModal(false);
    const updated = { ...seo, og_image: result.url };
    setSeo(updated);
    try {
      await dataService.updateSEOSettings(updated);
      showToast('Default Social / OpenGraph image updated and saved.', 'success');
    } catch (err: any) {
      showToast(`Image uploaded, but saving setting failed: ${err.message}`, 'error');
    }
  };

  // Generate live JSON-LD Schema preview
  const liveSchema = buildPageJsonLdGraph({
    site,
    seo,
    founder,
    currentPath: '/',
    pageTitle: seo.meta_title,
    pageDescription: seo.meta_description
  });

  const copyJsonLd = () => {
    navigator.clipboard.writeText(JSON.stringify(liveSchema, null, 2));
    setCopiedSchema(true);
    showToast('Schema.org JSON-LD copied to clipboard!', 'info');
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const audit = runSEOAudit({ site, seo, founder, leadership });
  const filteredItems = audit.items.filter(item => {
    if (auditFilter === 'all') return true;
    return item.status === auditFilter;
  });

  const handleRefreshAudit = async () => {
    setIsRefreshingAudit(true);
    try {
      const [s, se, f, l] = await Promise.all([
        dataService.getSiteSettings(true),
        dataService.getSEOSettings(true),
        dataService.getFounder(),
        dataService.getLeadership()
      ]);
      setSite(s);
      setSeo(se);
      setFounder(f);
      setLeadership(l);
      showToast('Live SEO audit re-evaluated with latest database state.', 'success');
    } catch {
      showToast('Failed to re-evaluate SEO state.', 'error');
    } finally {
      setIsRefreshingAudit(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-6 max-w-5xl">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded text-xs font-bold uppercase transition-colors flex items-center gap-1.5 ${
              activeTab === 'overview' ? 'bg-secondary text-[#0a192f]' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>SEO Overview & Diagnostics</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
              audit.score >= 80 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
            }`}>
              {audit.score}%
            </span>
          </button>

          <button
            onClick={() => setActiveTab('general')}
            className={`px-3.5 py-2 rounded text-xs font-bold uppercase transition-colors flex items-center gap-1.5 ${
              activeTab === 'general' ? 'bg-secondary text-[#0a192f]' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>General SEO & Meta</span>
          </button>

          <button
            onClick={() => setActiveTab('organization')}
            className={`px-3.5 py-2 rounded text-xs font-bold uppercase transition-colors flex items-center gap-1.5 ${
              activeTab === 'organization' ? 'bg-secondary text-[#0a192f]' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Organization Entity</span>
          </button>

          <button
            onClick={() => setActiveTab('founder')}
            className={`px-3.5 py-2 rounded text-xs font-bold uppercase transition-colors flex items-center gap-1.5 ${
              activeTab === 'founder' ? 'bg-secondary text-[#0a192f]' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Founder Entity (Abhishek)</span>
          </button>

          <button
            onClick={() => setActiveTab('team')}
            className={`px-3.5 py-2 rounded text-xs font-bold uppercase transition-colors flex items-center gap-1.5 ${
              activeTab === 'team' ? 'bg-secondary text-[#0a192f]' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Team Roster SEO</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3.5 py-2 rounded text-xs font-bold uppercase transition-colors flex items-center gap-1.5 ${
              activeTab === 'schema' ? 'bg-secondary text-[#0a192f]' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Structured Data (JSON-LD)</span>
          </button>

          <button
            onClick={() => setActiveTab('sitemap')}
            className={`px-3.5 py-2 rounded text-xs font-bold uppercase transition-colors flex items-center gap-1.5 ${
              activeTab === 'sitemap' ? 'bg-secondary text-[#0a192f]' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Sitemap & Robots</span>
          </button>
        </div>

        {/* 0. OVERVIEW & REAL-TIME DIAGNOSTICS TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Health Score & Audit Executive Summary */}
            <div className="p-6 bg-[#0a192f] border border-slate-800 rounded-xl space-y-6 shadow-xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-secondary/20 text-secondary border border-secondary/30">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase text-white tracking-wider flex items-center gap-2">
                      <span>Real-Time Google Search & SEO Health Audit</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded border font-mono uppercase ${audit.statusColor}`}>
                        {audit.statusText}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Continuously evaluates live database entities, Schema.org graph, robot directives, and image assets.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRefreshAudit}
                  disabled={isRefreshingAudit}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 shadow"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isRefreshingAudit ? 'animate-spin' : ''}`} />
                  <span>{isRefreshingAudit ? 'AUDITING...' : 'RE-RUN AUDIT'}</span>
                </button>
              </div>

              {/* Score Dial & Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Score Card */}
                <div className="p-4 bg-[#07111e] border border-slate-800 rounded-xl flex items-center gap-4 shadow-inner">
                  <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={audit.score >= 80 ? 'text-emerald-400' : audit.score >= 60 ? 'text-amber-400' : 'text-rose-400'}
                        strokeDasharray={`${audit.score}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-sm font-black text-white font-mono">{audit.score}%</span>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">SEO Health Score</div>
                    <div className="text-sm font-bold text-white capitalize">{audit.statusText.replace('_', ' ').toLowerCase()}</div>
                    <div className="text-[10px] text-slate-400">{audit.passedCount} of {audit.totalChecks} passing</div>
                  </div>
                </div>

                {/* Passed Checks */}
                <div className="p-4 bg-[#07111e] border border-emerald-900/30 rounded-xl flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xl font-mono font-black text-emerald-300">{audit.passedCount}</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Passing Checks</div>
                  </div>
                </div>

                {/* Warnings */}
                <div className="p-4 bg-[#07111e] border border-amber-900/30 rounded-xl flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xl font-mono font-black text-amber-300">{audit.warningCount}</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Optimization Notices</div>
                  </div>
                </div>

                {/* Errors */}
                <div className="p-4 bg-[#07111e] border border-rose-900/30 rounded-xl flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xl font-mono font-black text-rose-300">{audit.errorCount}</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Critical Index Errors</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Search Engine Snippet Preview (Desktop & Mobile) */}
            <div className="p-6 bg-[#0a192f] border border-slate-800 rounded-xl space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-sm font-bold uppercase text-white flex items-center gap-2">
                    <Eye className="w-4 h-4 text-secondary" />
                    <span>Live Google Search Result Preview</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Simulates exact snippet rendering in Google Search Results.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-[#07111e] p-1 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSerpDevice('desktop')}
                    className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      serpDevice === 'desktop' ? 'bg-secondary text-[#0a192f]' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Desktop SERP</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSerpDevice('mobile')}
                    className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      serpDevice === 'mobile' ? 'bg-secondary text-[#0a192f]' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile SERP</span>
                  </button>
                </div>
              </div>

              {/* SERP Mock Container */}
              <div className="p-4 sm:p-5 bg-white dark:bg-[#202124] rounded-xl border border-slate-700/80 text-left font-sans max-w-2xl mx-auto shadow-2xl">
                {/* Google Snippet Header */}
                <div className="flex items-center gap-3 mb-1.5">
                  <div className="w-7 h-7 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {site.favicon_url || site.logo_url ? (
                      <img src={site.favicon_url || site.logo_url} alt="Favicon" className="w-4 h-4 object-contain" />
                    ) : (
                      <span className="text-[10px] font-bold text-secondary">R</span>
                    )}
                  </div>
                  <div className="leading-tight">
                    <div className="text-xs font-medium text-slate-900 dark:text-[#dadce0]">{site.site_name || 'Ravan Technologies'}</div>
                    <div className="text-[11px] text-[#4d5156] dark:text-[#bdc1c6] truncate">
                      {seo.canonical_url || PRODUCTION_DOMAIN}
                    </div>
                  </div>
                </div>

                {/* Snippet Title */}
                <h3 className="text-base sm:text-lg font-medium text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer leading-snug line-clamp-1 mb-1">
                  {seo.meta_title || 'Ravan Technologies | Sovereign Engineering & Enterprise Architecture'}
                </h3>

                {/* Snippet Description */}
                <p className="text-xs sm:text-sm text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed line-clamp-2">
                  {seo.meta_description || 'Ravan Technologies engineers high-reliability autonomous systems, deep-tech intelligence platforms, and sovereign digital infrastructure.'}
                </p>
              </div>

              {/* SERP Density Metrics Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-[#07111e] rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Title Tag Length:</span>
                  <span className={`font-mono font-bold ${
                    seo.meta_title.length >= 35 && seo.meta_title.length <= 65 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {seo.meta_title.length} / 60 chars {seo.meta_title.length > 65 ? '(Truncated)' : ''}
                  </span>
                </div>

                <div className="p-2.5 bg-[#07111e] rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Meta Description Length:</span>
                  <span className={`font-mono font-bold ${
                    seo.meta_description.length >= 120 && seo.meta_description.length <= 160 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {seo.meta_description.length} / 160 chars {seo.meta_description.length > 160 ? '(Truncated)' : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Live Social Card Preview (OpenGraph / LinkedIn / Twitter) */}
            <div className="p-6 bg-[#0a192f] border border-slate-800 rounded-xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-sm font-bold uppercase text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-secondary" />
                  <span>Social Share Preview (OpenGraph / LinkedIn / X)</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveTab('general')}
                  className="text-xs text-secondary hover:underline font-semibold"
                >
                  Configure Social Card →
                </button>
              </div>

              <div className="max-w-xl mx-auto rounded-xl overflow-hidden border border-slate-700 bg-[#07111e] shadow-2xl">
                {/* 1.91:1 Banner */}
                <div className="aspect-[1.91/1] bg-slate-900 relative overflow-hidden flex items-center justify-center">
                  {seo.og_image ? (
                    <img src={seo.og_image} alt="OG Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-6 space-y-2">
                      <Globe className="w-8 h-8 text-slate-600 mx-auto" />
                      <span className="text-xs text-slate-500 font-mono">No OpenGraph image configured</span>
                    </div>
                  )}
                </div>
                {/* Metadata card footer */}
                <div className="p-4 bg-[#0a192f] border-t border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    ravantechnologies.com
                  </span>
                  <h4 className="text-sm font-bold text-white line-clamp-1">
                    {seo.og_title || seo.meta_title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {seo.og_description || seo.meta_description}
                  </p>
                </div>
              </div>
            </div>

            {/* Deep Technical Diagnostic Checklist */}
            <div className="p-6 bg-[#0a192f] border border-slate-800 rounded-xl space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-sm font-bold uppercase text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-secondary" />
                    <span>Technical Diagnostic Engine Checklist ({audit.totalChecks} Points)</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Comprehensive evaluation of search engine crawler accessibility, Schema.org compliance, and asset discoverability.
                  </p>
                </div>

                {/* Filter Chips */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAuditFilter('all')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-colors ${
                      auditFilter === 'all' ? 'bg-secondary text-[#0a192f]' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({audit.totalChecks})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuditFilter('error')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-colors ${
                      auditFilter === 'error' ? 'bg-rose-500 text-white' : 'bg-rose-950/40 text-rose-300 border border-rose-800/60'
                    }`}
                  >
                    Errors ({audit.errorCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuditFilter('warning')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-colors ${
                      auditFilter === 'warning' ? 'bg-amber-500 text-[#0a192f]' : 'bg-amber-950/40 text-amber-300 border border-amber-800/60'
                    }`}
                  >
                    Warnings ({audit.warningCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuditFilter('pass')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-colors ${
                      auditFilter === 'pass' ? 'bg-emerald-500 text-white' : 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/60'
                    }`}
                  >
                    Passed ({audit.passedCount})
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {filteredItems.map(item => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all ${
                      item.status === 'pass'
                        ? 'bg-[#07111e]/80 border-slate-800 hover:border-slate-700'
                        : item.status === 'warning'
                        ? 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/50'
                        : 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {item.status === 'pass' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : item.status === 'warning' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-rose-400" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className="text-xs font-bold text-white">{item.title}</h5>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono uppercase">
                              {item.category}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                              item.status === 'pass'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : item.status === 'warning'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {item.value}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">{item.details}</p>
                          <p className="text-[11px] text-slate-400 italic">
                            <span className="font-semibold text-secondary">Guidance: </span>
                            {item.recommendation}
                          </p>
                        </div>
                      </div>

                      {item.actionTab && (
                        <button
                          type="button"
                          onClick={() => setActiveTab(item.actionTab!)}
                          className="self-start sm:self-center px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-secondary border border-slate-700 rounded text-[11px] font-bold uppercase transition-colors whitespace-nowrap"
                        >
                          Configure →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 1. GENERAL SEO TAB */}
        {activeTab === 'general' && (
          <form onSubmit={handleSaveGeneral} className="space-y-6">
            <div className="p-6 bg-[#0a192f] border border-slate-800 rounded-xl space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold uppercase text-white flex items-center gap-2">
                    <Search className="w-4 h-4 text-secondary" />
                    <span>Search Engine Meta Directives</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Controls global title, meta descriptions, canonical domain, and default social cards.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`px-5 py-2 rounded text-xs font-bold uppercase transition-all flex items-center gap-1.5 shadow ${
                    isSaved ? 'bg-emerald-500 text-white' : 'bg-secondary text-[#0a192f] hover:bg-secondary-fixed'
                  }`}
                >
                  {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  <span>{isSaving ? 'SAVING...' : isSaved ? 'SAVED ✓' : 'SAVE GENERAL SEO'}</span>
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Global Meta Title *
                </label>
                <input
                  type="text"
                  required
                  value={seo.meta_title}
                  onChange={e => setSeo({ ...seo, meta_title: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-bold focus:border-secondary outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Recommended length: 50–60 characters (Current: {seo.meta_title.length})
                </span>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Global Meta Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={seo.meta_description}
                  onChange={e => setSeo({ ...seo, meta_description: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed focus:border-secondary outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Recommended length: 120–160 characters (Current: {seo.meta_description.length})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Focus Keyword</label>
                  <input
                    type="text"
                    value={seo.focus_keyword || ''}
                    onChange={e => setSeo({ ...seo, focus_keyword: e.target.value })}
                    className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                    placeholder="e.g. Sovereign Intelligence, Enterprise Engineering"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Canonical Production Domain
                  </label>
                  <input
                    type="text"
                    value={seo.canonical_url || PRODUCTION_DOMAIN}
                    onChange={e => setSeo({ ...seo, canonical_url: e.target.value })}
                    className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-secondary text-xs font-mono focus:border-secondary outline-none"
                  />
                </div>
              </div>

              {/* Indexing Rules */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="robots_index"
                    checked={seo.robots_index}
                    onChange={e => setSeo({ ...seo, robots_index: e.target.checked })}
                    className="w-4 h-4 rounded text-secondary focus:ring-secondary"
                  />
                  <label htmlFor="robots_index" className="text-xs text-slate-300 font-semibold cursor-pointer">
                    Permit Search Engine Indexing (robots index)
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="robots_follow"
                    checked={seo.robots_follow}
                    onChange={e => setSeo({ ...seo, robots_follow: e.target.checked })}
                    className="w-4 h-4 rounded text-secondary focus:ring-secondary"
                  />
                  <label htmlFor="robots_follow" className="text-xs text-slate-300 font-semibold cursor-pointer">
                    Permit Following Hyperlinks (robots follow)
                  </label>
                </div>
              </div>
            </div>

            {/* Social Share / OpenGraph Image Card */}
            <div className="p-6 bg-[#0a192f] border border-slate-800 rounded-xl space-y-4">
              <h3 className="text-sm font-bold uppercase text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-secondary" />
                <span>Default OpenGraph & Social Share Asset</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                <div className="sm:col-span-4 aspect-[1.91/1] bg-[#07111e] rounded-lg border border-slate-700 overflow-hidden flex items-center justify-center relative shadow-inner">
                  {seo.og_image ? (
                    <img
                      src={seo.og_image}
                      alt="OpenGraph Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-slate-500 font-mono">No Image Set</span>
                  )}
                </div>

                <div className="sm:col-span-8 space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      OpenGraph Social Image URL
                    </label>
                    <input
                      type="text"
                      value={seo.og_image}
                      onChange={e => setSeo({ ...seo, og_image: e.target.value })}
                      className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-mono focus:border-secondary outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCropModal(true)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-secondary rounded text-xs font-bold uppercase flex items-center gap-1.5 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload & Crop Social Asset (1.91:1)</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* 2. ORGANIZATION ENTITY TAB */}
        {activeTab === 'organization' && (
          <form onSubmit={handleSaveOrganization} className="space-y-6">
            <div className="p-6 bg-[#0a192f] border border-slate-800 rounded-xl space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold uppercase text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-secondary" />
                    <span>Organization Knowledge Graph Entity</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Authoritative signals that establish Ravan Technologies as a legitimate corporation in Google Knowledge Graph.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`px-5 py-2 rounded text-xs font-bold uppercase transition-all flex items-center gap-1.5 shadow ${
                    isSaved ? 'bg-emerald-500 text-white' : 'bg-secondary text-[#0a192f] hover:bg-secondary-fixed'
                  }`}
                >
                  {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  <span>{isSaving ? 'SAVING...' : isSaved ? 'SAVED ✓' : 'SAVE ORGANIZATION'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Organization Name *</label>
                  <input
                    type="text"
                    required
                    value={site.company_name || site.site_name}
                    onChange={e => setSite({ ...site, company_name: e.target.value, site_name: e.target.value })}
                    className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-bold focus:border-secondary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Legal Corporate Name</label>
                  <input
                    type="text"
                    value="Ravan Technologies Private Limited"
                    readOnly
                    className="w-full px-3 py-1.5 rounded bg-[#07111e]/50 border border-slate-800 text-slate-400 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Official Inquiry Email</label>
                  <input
                    type="email"
                    value={site.inquiry_email || site.contact_email || ''}
                    onChange={e => setSite({ ...site, inquiry_email: e.target.value, contact_email: e.target.value })}
                    className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Official Contact Phone</label>
                  <input
                    type="text"
                    value={site.contact_phone || ''}
                    onChange={e => setSite({ ...site, contact_phone: e.target.value })}
                    className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                    placeholder="+91 80 0000 0000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Physical Campus / Office Address</label>
                <input
                  type="text"
                  value={site.office_address || ''}
                  onChange={e => setSite({ ...site, office_address: e.target.value })}
                  className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                  placeholder="Ravan Tech Park, Outer Ring Road, Bengaluru, Karnataka 560103"
                />
              </div>

              {/* Social Channels for sameAs */}
              <div className="pt-3 border-t border-slate-800">
                <span className="text-xs font-bold uppercase text-white block mb-3">
                  Verified Social Channels (Schema sameAs)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">LinkedIn Page</label>
                    <input
                      type="url"
                      value={site.social_links?.linkedin || ''}
                      onChange={e => setSite({ ...site, social_links: { ...(site.social_links || {}), linkedin: e.target.value } })}
                      className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                      placeholder="https://linkedin.com/company/ravan-technologies"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Twitter / X</label>
                    <input
                      type="url"
                      value={site.social_links?.twitter || ''}
                      onChange={e => setSite({ ...site, social_links: { ...(site.social_links || {}), twitter: e.target.value } })}
                      className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                      placeholder="https://twitter.com/ravantech"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">GitHub Organization</label>
                    <input
                      type="url"
                      value={site.social_links?.github || ''}
                      onChange={e => setSite({ ...site, social_links: { ...(site.social_links || {}), github: e.target.value } })}
                      className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                      placeholder="https://github.com/ravantechnologies"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">YouTube Channel</label>
                    <input
                      type="url"
                      value={site.social_links?.youtube || ''}
                      onChange={e => setSite({ ...site, social_links: { ...(site.social_links || {}), youtube: e.target.value } })}
                      className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:border-secondary outline-none"
                      placeholder="https://youtube.com/@ravantechnologies"
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* 3. FOUNDER ENTITY TAB (ABHISHEK) */}
        {activeTab === 'founder' && (
          <div className="p-6 bg-[#0a192f] border border-slate-800 rounded-xl space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold uppercase text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-secondary" />
                  <span>Authoritative Founder Entity (V ABISHEK)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  The Founder entity is dynamically resolved from the production database and linked to the Ravan Technologies Organization schema.
                </p>
              </div>
              <Link
                to="/admin/founder"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-bold uppercase flex items-center gap-1.5 transition-colors"
              >
                <span>Edit Founder in CMS</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {founder ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start bg-[#07111e] p-5 rounded-xl border border-slate-800">
                <div className="md:col-span-3 aspect-[4/5] rounded-lg overflow-hidden bg-slate-900 border border-slate-700">
                  {founder.image_url ? (
                    <img
                      src={founder.image_url}
                      alt={founder.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-secondary font-bold text-xl">
                      VA
                    </div>
                  )}
                </div>

                <div className="md:col-span-9 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-secondary block">
                      VERIFIED PRODUCTION FOUNDER
                    </span>
                    <h4 className="text-lg font-bold text-white">{founder.name}</h4>
                    <p className="text-xs text-secondary font-medium">{founder.designation}</p>
                  </div>

                  {founder.vision && (
                    <div className="p-3 rounded bg-[#0a192f] border-l-2 border-secondary text-xs text-slate-300 italic">
                      &ldquo;{founder.vision}&rdquo;
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Schema Entity ID</span>
                      <span className="font-mono text-secondary text-[11px] break-all">
                        {PRODUCTION_DOMAIN}/#founder
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Public Canonical Route</span>
                      <a 
                        href="/founder" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-white hover:text-secondary flex items-center gap-1 font-mono text-[11px]"
                      >
                        <span>/founder</span>
                        <ExternalLink className="w-3 h-3 text-secondary" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">Loading authoritative Founder data...</div>
            )}
          </div>
        )}

        {/* 4. TEAM ROSTER SEO TAB */}
        {activeTab === 'team' && (
          <div className="p-6 bg-[#0a192f] border border-slate-800 rounded-xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold uppercase text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-secondary" />
                  <span>Real Published Team Profiles & Crawlability</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Only published members are given indexable canonical routes. Drafts are automatically guarded with noindex.
                </p>
              </div>
              <Link
                to="/admin/leadership"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-bold uppercase flex items-center gap-1.5 transition-colors"
              >
                <span>Manage Team in CMS</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {leadership.map(member => {
                const memberSlug = member.slug || generateSlug(member.name);
                const isLive = member.status === 'published';

                return (
                  <div
                    key={member.id}
                    className="p-4 rounded-lg bg-[#07111e] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                        {member.image_url ? (
                          <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-secondary">
                            {member.name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{member.name}</h4>
                        <p className="text-[11px] text-slate-400">{member.designation}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isLive ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-400' : 'bg-amber-950/60 border border-amber-500/40 text-amber-400'
                      }`}>
                        {isLive ? 'Live / Indexable' : 'Draft / Noindex'}
                      </span>

                      {isLive && (
                        <a
                          href={`/team/${memberSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-secondary hover:underline flex items-center gap-1"
                        >
                          <span>/team/{memberSlug}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. STRUCTURED DATA (JSON-LD) INSPECTOR TAB */}
        {activeTab === 'schema' && (
          <div className="p-6 bg-[#0a192f] border border-slate-800 rounded-xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold uppercase text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-secondary" />
                  <span>Authoritative Schema.org JSON-LD @graph</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  This multi-entity graph is dynamically generated and injected into the website for Google Rich Results.
                </p>
              </div>
              <button
                onClick={copyJsonLd}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-secondary rounded text-xs font-bold uppercase flex items-center gap-1.5 transition-colors"
              >
                {copiedSchema ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSchema ? 'COPIED!' : 'COPY JSON-LD'}</span>
              </button>
            </div>

            <div className="p-4 bg-[#07111e] rounded-lg border border-slate-800 max-h-[480px] overflow-auto">
              <pre className="text-[11px] font-mono text-emerald-400 leading-relaxed whitespace-pre-wrap">
                {JSON.stringify(liveSchema, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* 6. SITEMAP & ROBOTS AUDITOR TAB */}
        {activeTab === 'sitemap' && (
          <div className="p-6 bg-[#0a192f] border border-slate-800 rounded-xl space-y-6">
            <div>
              <h3 className="text-sm font-bold uppercase text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-secondary" />
                <span>Production Sitemap & Crawl Directives</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Authoritative index of legitimate public pages with protection for private CMS routes.
              </p>
            </div>

            {/* Robots.txt Preview */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase text-white block">robots.txt Directives</span>
              <div className="p-4 bg-[#07111e] rounded font-mono text-[11px] text-cyan-400 border border-slate-800 leading-relaxed overflow-x-auto">
                {`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin/\nDisallow: /admin/*\nDisallow: /api/\n\nUser-agent: Googlebot-Image\nAllow: /\nAllow: /images/\n\nSitemap: https://ravantechnologies.com/sitemap.xml`}
              </div>
            </div>

            {/* Sitemap URLs List */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase text-white block">Verified Public Sitemap URLs</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-300">
                <div className="p-2 bg-[#07111e] rounded border border-slate-800 flex items-center justify-between">
                  <span>/</span>
                  <span className="text-secondary text-[10px]">priority 1.0</span>
                </div>
                <div className="p-2 bg-[#07111e] rounded border border-slate-800 flex items-center justify-between">
                  <span>/about</span>
                  <span className="text-secondary text-[10px]">priority 0.8</span>
                </div>
                <div className="p-2 bg-[#07111e] rounded border border-slate-800 flex items-center justify-between">
                  <span>/founder</span>
                  <span className="text-secondary text-[10px]">priority 0.9</span>
                </div>
                <div className="p-2 bg-[#07111e] rounded border border-slate-800 flex items-center justify-between">
                  <span>/team</span>
                  <span className="text-secondary text-[10px]">priority 0.8</span>
                </div>
                <div className="p-2 bg-[#07111e] rounded border border-slate-800 flex items-center justify-between">
                  <span>/team/sibi-raj-u</span>
                  <span className="text-secondary text-[10px]">priority 0.8</span>
                </div>
                <div className="p-2 bg-[#07111e] rounded border border-slate-800 flex items-center justify-between">
                  <span>/services</span>
                  <span className="text-secondary text-[10px]">priority 0.9</span>
                </div>
                <div className="p-2 bg-[#07111e] rounded border border-slate-800 flex items-center justify-between">
                  <span>/solutions</span>
                  <span className="text-secondary text-[10px]">priority 0.8</span>
                </div>
                <div className="p-2 bg-[#07111e] rounded border border-slate-800 flex items-center justify-between">
                  <span>/projects</span>
                  <span className="text-secondary text-[10px]">priority 0.9</span>
                </div>
                <div className="p-2 bg-[#07111e] rounded border border-slate-800 flex items-center justify-between">
                  <span>/hackathons</span>
                  <span className="text-secondary text-[10px]">priority 0.9</span>
                </div>
                <div className="p-2 bg-[#07111e] rounded border border-slate-800 flex items-center justify-between">
                  <span>/learning</span>
                  <span className="text-secondary text-[10px]">priority 0.8</span>
                </div>
                <div className="p-2 bg-[#07111e] rounded border border-slate-800 flex items-center justify-between">
                  <span>/ecosystem</span>
                  <span className="text-secondary text-[10px]">priority 0.8</span>
                </div>
                <div className="p-2 bg-[#07111e] rounded border border-slate-800 flex items-center justify-between">
                  <span>/contact</span>
                  <span className="text-secondary text-[10px]">priority 0.8</span>
                </div>
                <div className="p-2 bg-[#07111e] rounded border border-slate-800 flex items-center justify-between">
                  <span>/gallery</span>
                  <span className="text-secondary text-[10px]">priority 0.7</span>
                </div>
                <div className="p-2 bg-[#07111e] rounded border border-slate-800 flex items-center justify-between">
                  <span>/blog</span>
                  <span className="text-secondary text-[10px]">priority 0.8</span>
                </div>
                <div className="p-2 bg-[#07111e] rounded border border-slate-800 flex items-center justify-between">
                  <span>/events</span>
                  <span className="text-secondary text-[10px]">priority 0.8</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 1.91:1 Aspect Ratio Crop Modal for OpenGraph Asset */}
      {showCropModal && (
        <ImageCropModal
          isOpen={true}
          onClose={() => setShowCropModal(false)}
          onConfirm={handleCropConfirm}
          aspectRatioLabel="16:9 (Landscape)"
          targetBucket="media"
          targetFolder="seo"
          initialAltText="Ravan Technologies OpenGraph Social Card"
        />
      )}
    </div>
  );
};
