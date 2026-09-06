import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { useToast } from '../../context/ToastContext';
import { BlogPost } from '../../types';
import { initialBlogPosts } from '../../data/initialData';
import { DeleteConfirmationModal } from '../../components/admin/DeleteConfirmationModal';
import { ImageCropModal, CropResult } from '../../components/admin/ImageCropModal';
import {
  Newspaper,
  Plus,
  Trash2,
  Edit2,
  Save,
  Search,
  Calendar,
  Clock,
  User,
  Upload,
  X,
  FileText,
  Tag
} from 'lucide-react';

const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

export const AdminBlog: React.FC = () => {
  const { showToast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [editingItem, setEditingItem] = useState<BlogPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'metadata'>('content');

  // Crop Modal
  const [isCropOpen, setIsCropOpen] = useState(false);

  // Delete Modal
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Saving state
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await dataService.getBlogPosts();
      setPosts(data && data.length > 0 ? data : initialBlogPosts);
    } catch (e) {
      console.error(e);
      showToast('Failed to load articles from database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('ravan_data_updated', loadData);
    return () => window.removeEventListener('ravan_data_updated', loadData);
  }, []);

  const handleOpenCreate = () => {
    const newItem: BlogPost = {
      id: 'blog-' + Date.now(),
      slug: 'enterprise-distributed-systems-architecture',
      title: 'Distributed Transaction Processing in Sovereign Multi-Cloud',
      excerpt: 'Architectural blueprints for achieving zero-latency consistency across isolated cloud enclaves.',
      content: `## Executive Overview\n\nModern enterprise workloads require fault-tolerant data pipelines capable of operating across sovereign infrastructure.\n\n### Core Architectural Directives\n\n1. **Deterministic State Synchronization**: Leveraging hybrid consensus engines to guarantee ACID semantics under partition.\n2. **Zero-Trust Memory Boundaries**: Enforcing hardware-level isolation for cryptographic credentials.\n\n\`\`\`typescript\n// Autonomous State Machine Replication\ninterface StateReplicator {\n  commit(term: number, logIndex: number): Promise<boolean>;\n}\n\`\`\`\n\n### Conclusion\n\nDeploying on-premise compute nodes adjacent to sovereign data centers ensures full compliance and sub-millisecond execution.`,
      cover_image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200',
      author_name: 'Ravan Systems Architecture Council',
      tags: ['Enterprise Architecture', 'Distributed Systems', 'Cloud Sovereignty'],
      read_time_minutes: 6,
      status: 'published',
      published_at: new Date().toISOString()
    };
    setEditingItem(newItem);
    setActiveTab('content');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: BlogPost) => {
    setEditingItem(JSON.parse(JSON.stringify(p)));
    setActiveTab('content');
    setIsModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    if (!editingItem) return;
    const isNew = editingItem.id.startsWith('blog-');
    setEditingItem({
      ...editingItem,
      title: val,
      slug: isNew ? slugify(val) : editingItem.slug
    });
  };

  const handleSaveModal = async () => {
    if (!editingItem) return;
    if (!editingItem.title.trim()) {
      showToast('Article title is required.', 'info');
      return;
    }

    if (!editingItem.slug.trim()) {
      editingItem.slug = slugify(editingItem.title);
    }

    setIsSaving(true);
    try {
      const exists = posts.some(p => p.id === editingItem.id);
      const updated = exists
        ? posts.map(p => (p.id === editingItem.id ? editingItem : p))
        : [editingItem, ...posts];

      setPosts(updated);
      await dataService.saveBlogPosts(updated);
      showToast('Article saved successfully.', 'success');
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (e) {
      console.error(e);
      showToast('Error saving article.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const updated = posts.filter(p => p.id !== deleteTarget.id);
      setPosts(updated);
      await dataService.deleteBlogPost(deleteTarget.id);
      showToast(`Deleted whitepaper "${deleteTarget.title}".`, 'success');
      setDeleteTarget(null);
    } catch (e) {
      console.error(e);
      showToast('Failed to delete article.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCropResult = (res: CropResult) => {
    if (!editingItem) return;
    setEditingItem({
      ...editingItem,
      cover_image_url: res.url
    });
    showToast('Cover image updated.', 'success');
  };

  const filteredPosts = posts.filter(p => {
    const matchesSearch = (p.title || '').toLowerCase().includes(search.toLowerCase()) ||
                          (p.excerpt || '').toLowerCase().includes(search.toLowerCase()) ||
                          (p.author_name || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in font-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-[#0a192f] p-5 border border-slate-800 rounded-xl">
        <div>
          <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-secondary" />
            Engineering Whitepapers & Intelligence CMS
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Publish architectural whitepapers, benchmark studies, and enterprise directives.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Create Article</span>
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search articles by title, author, or excerpt..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-secondary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 font-mono">Loading whitepapers from Supabase...</div>
      ) : filteredPosts.length === 0 ? (
        <div className="p-12 bg-[#0a192f] border border-slate-800 rounded-xl text-center space-y-3">
          <Newspaper className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm text-slate-400 font-semibold">No whitepapers found.</p>
          <button
            onClick={handleOpenCreate}
            className="px-3 py-1.5 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase"
          >
            Publish First Article
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPosts.map(p => (
            <div
              key={p.id}
              className="bg-[#0a192f] border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg group"
            >
              <div>
                {p.cover_image_url && (
                  <div className="h-40 relative overflow-hidden bg-slate-900">
                    <img
                      src={p.cover_image_url}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f] via-transparent to-black/40" />
                    <span
                      className={`absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        p.status === 'published'
                          ? 'bg-emerald-950 border-emerald-500/40 text-emerald-400'
                          : 'bg-amber-950 border-amber-500/40 text-amber-400'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                )}

                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-secondary" />
                      {p.read_time_minutes || 5} min read
                    </span>
                    <span>•</span>
                    <span className="truncate">{p.author_name}</span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">{p.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{p.excerpt}</p>

                  {p.tags && p.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {p.tags.slice(0, 3).map((t, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 bg-[#07111e] border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="text-[10px] text-slate-500 font-mono truncate max-w-[200px]">
                  /{p.slug}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setDeleteTarget(p)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                    title="Delete Article"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-4xl bg-[#0a192f] border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          >
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#07111e]">
              <div>
                <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-secondary" />
                  {editingItem.id.startsWith('blog-') ? 'Draft Engineering Whitepaper' : 'Edit Whitepaper'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 px-6 pt-3 border-b border-slate-800 bg-[#07111e]/50 text-xs font-bold uppercase">
              <button
                onClick={() => setActiveTab('content')}
                className={`pb-3 border-b-2 transition-colors ${
                  activeTab === 'content' ? 'border-secondary text-secondary' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Article Content
              </button>
              <button
                onClick={() => setActiveTab('metadata')}
                className={`pb-3 border-b-2 transition-colors ${
                  activeTab === 'metadata' ? 'border-secondary text-secondary' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Metadata & Imagery
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {activeTab === 'content' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Article Headline *
                    </label>
                    <input
                      type="text"
                      value={editingItem.title}
                      onChange={e => handleTitleChange(e.target.value)}
                      className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-secondary"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">URL Slug</label>
                      <input
                        type="text"
                        value={editingItem.slug}
                        onChange={e => setEditingItem({ ...editingItem, slug: slugify(e.target.value) })}
                        className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-secondary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Author Name</label>
                      <input
                        type="text"
                        value={editingItem.author_name}
                        onChange={e => setEditingItem({ ...editingItem, author_name: e.target.value })}
                        className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Executive Summary / Excerpt</label>
                    <textarea
                      rows={2}
                      value={editingItem.excerpt}
                      onChange={e => setEditingItem({ ...editingItem, excerpt: e.target.value })}
                      className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed focus:outline-none focus:border-secondary"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Full Whitepaper Content (Markdown)
                    </label>
                    <textarea
                      rows={10}
                      value={editingItem.content}
                      onChange={e => setEditingItem({ ...editingItem, content: e.target.value })}
                      className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-mono leading-relaxed focus:outline-none focus:border-secondary"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'metadata' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Publish Status</label>
                      <select
                        value={editingItem.status}
                        onChange={e => setEditingItem({ ...editingItem, status: e.target.value as any })}
                        className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Read Time (Minutes)</label>
                      <input
                        type="number"
                        value={editingItem.read_time_minutes ?? 5}
                        onChange={e => setEditingItem({ ...editingItem, read_time_minutes: parseInt(e.target.value) || 5 })}
                        className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Publish Date</label>
                      <input
                        type="text"
                        value={editingItem.published_at || new Date().toISOString()}
                        onChange={e => setEditingItem({ ...editingItem, published_at: e.target.value })}
                        className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-secondary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Cover Image URL</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingItem.cover_image_url}
                        onChange={e => setEditingItem({ ...editingItem, cover_image_url: e.target.value })}
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

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Tags (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={(editingItem.tags || []).join(', ')}
                      onChange={e => setEditingItem({
                        ...editingItem,
                        tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      })}
                      placeholder="Enterprise, Architecture, AI Infrastructure"
                      className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:outline-none focus:border-secondary"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-[#07111e] border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                disabled={isSaving}
                className="px-5 py-2 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors flex items-center gap-1.5 shadow"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Article'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={isCropOpen}
        onClose={() => setIsCropOpen(false)}
        onConfirm={handleCropResult}
        aspectRatioLabel="16:9 (Landscape)"
        targetBucket="media"
        targetFolder="blog"
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deleteTarget}
        itemTitle={deleteTarget?.title}
        itemType="Engineering Whitepaper"
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
