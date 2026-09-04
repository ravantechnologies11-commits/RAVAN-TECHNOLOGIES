import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { useToast } from '../../context/ToastContext';
import { ProjectItem } from '../../types';
import { initialProjects } from '../../data/initialData';
import { ImageCropModal, CropResult } from '../../components/admin/ImageCropModal';
import { DeleteConfirmationModal } from '../../components/admin/DeleteConfirmationModal';
import { Plus, Trash2, Upload, Save, Check, FolderGit2 } from 'lucide-react';

export const AdminProjects: React.FC = () => {
  const { showToast } = useToast();
  const [projects, setProjects] = useState<ProjectItem[]>(initialProjects);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [activeCropIndex, setActiveCropIndex] = useState<number | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<ProjectItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dataService.getProjects().then(setProjects);
  }, []);

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await dataService.saveProjects(projects);
      setIsSaved(true);
      showToast('All case studies saved to Supabase.', 'success');
      setTimeout(() => setIsSaved(false), 2500);
    } catch {
      showToast('Failed to save case studies.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCropConfirm = (result: CropResult) => {
    if (activeCropIndex === null) return;
    const copy = [...projects];
    copy[activeCropIndex].image_url = result.url;
    setProjects(copy);
    showToast(`Updated cover for ${copy[activeCropIndex].title}.`, 'success');
  };

  const addProject = () => {
    const newProj: ProjectItem = {
      id: 'proj-' + Date.now(),
      slug: 'project-' + Date.now(),
      featured: true,
      project_number: `PROJ // 0${projects.length + 1}`,
      category: 'FINTECH',
      title: 'New Mission-Critical System',
      problem: 'High-volume latency bottleneck under peak concurrency.',
      solution: 'Engineered zero-copy event streaming core with sub-millisecond dispatch.',
      outcome_metric: '99.999%',
      outcome_label: 'Uptime SLA',
      technologies: ['Rust', 'PostgreSQL', 'WebSockets'],
      image_url: '',
      display_order: projects.length + 1,
      status: 'published'
    };
    setProjects([...projects, newProj]);
    showToast('New project created. Click SAVE to persist.', 'info');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await dataService.deleteProject(deleteTarget.id);
      setProjects(prev => prev.filter(p => p.id !== deleteTarget.id));
      showToast(`Permanently deleted "${deleteTarget.title}" from Supabase.`, 'success');
      setDeleteTarget(null);
    } catch {
      showToast('Failed to delete project.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-6 max-w-5xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-xs text-slate-400">
            Manage public portfolio deliverables, metrics, and architecture specs.
          </p>
          <div className="flex gap-3 shrink-0">
            <button
              onClick={addProject}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-bold uppercase flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Case Study</span>
            </button>
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className={`px-6 py-2 rounded text-xs font-bold uppercase transition-all flex items-center gap-1.5 shadow-lg ${
                isSaved
                  ? 'bg-emerald-500 text-white'
                  : 'bg-secondary text-[#0a192f] hover:bg-secondary-fixed'
              }`}
            >
              {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? 'SAVING...' : isSaved ? 'SAVED ✓' : 'SAVE ALL PROJECTS'}</span>
            </button>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="p-16 rounded-2xl bg-[#0a192f] border border-slate-800 text-center">
            <FolderGit2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">No Projects Found</h3>
            <p className="text-xs text-slate-400 mb-4">Click "Add Case Study" to publish an architectural deliverable.</p>
            <button
              onClick={addProject}
              className="px-4 py-2 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase"
            >
              Add Case Study
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {projects.map((p, idx) => (
              <div
                key={p.id}
                className="p-6 bg-[#0a192f] border border-slate-800 rounded-xl space-y-4 shadow-sm"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-3 flex flex-col items-center gap-2">
                    <img
                      src={p.image_url}
                      alt={p.title}
                      onError={(e) => { e.currentTarget.src = '/images/ravan-logo.png'; }}
                      className="w-full h-24 rounded-lg object-cover border border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => setActiveCropIndex(idx)}
                      className="text-[10px] text-secondary hover:underline font-bold uppercase flex items-center gap-1"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Crop 16:9 Cover</span>
                    </button>
                  </div>

                  <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Identifier</label>
                      <input
                        type="text"
                        value={p.project_number}
                        onChange={e => {
                          const copy = [...projects];
                          copy[idx].project_number = e.target.value;
                          setProjects(copy);
                        }}
                        className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Category</label>
                      <input
                        type="text"
                        value={p.category}
                        onChange={e => {
                          const copy = [...projects];
                          copy[idx].category = e.target.value;
                          setProjects(copy);
                        }}
                        className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-bold uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Status</label>
                      <select
                        value={p.status}
                        onChange={e => {
                          const copy = [...projects];
                          copy[idx].status = e.target.value as any;
                          setProjects(copy);
                        }}
                        className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Project Title</label>
                      <input
                        type="text"
                        value={p.title}
                        onChange={e => {
                          const copy = [...projects];
                          copy[idx].title = e.target.value;
                          setProjects(copy);
                        }}
                        className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Problem Statement</label>
                    <textarea
                      rows={2}
                      value={p.problem}
                      onChange={e => {
                        const copy = [...projects];
                        copy[idx].problem = e.target.value;
                        setProjects(copy);
                      }}
                      className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Engineered Solution</label>
                    <textarea
                      rows={2}
                      value={p.solution}
                      onChange={e => {
                        const copy = [...projects];
                        copy[idx].solution = e.target.value;
                        setProjects(copy);
                      }}
                      className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Metric:</span>
                    <input
                      type="text"
                      value={p.outcome_metric}
                      onChange={e => {
                        const copy = [...projects];
                        copy[idx].outcome_metric = e.target.value;
                        setProjects(copy);
                      }}
                      className="w-24 px-2 py-1 rounded bg-[#07111e] border border-slate-700 text-secondary text-xs font-bold font-mono"
                    />
                    <input
                      type="text"
                      value={p.outcome_label}
                      onChange={e => {
                        const copy = [...projects];
                        copy[idx].outcome_label = e.target.value;
                        setProjects(copy);
                      }}
                      placeholder="Label"
                      className="w-32 px-2 py-1 rounded bg-[#07111e] border border-slate-700 text-slate-300 text-xs"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(p)}
                    className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Case Study</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Crop Modal */}
      {activeCropIndex !== null && (
        <ImageCropModal
          isOpen={true}
          onClose={() => setActiveCropIndex(null)}
          onConfirm={handleCropConfirm}
          aspectRatioLabel="16:9 (Landscape)"
          targetBucket="projects"
          targetFolder="covers"
          initialAltText={`Hero image for ${projects[activeCropIndex]?.title}`}
        />
      )}

      {/* Deletion Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteTarget !== null}
        itemTitle={deleteTarget?.title}
        itemType="Case Study Project"
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
