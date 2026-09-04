import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { useToast } from '../../context/ToastContext';
import { BlogPost } from '../../types';
import { initialBlogPosts } from '../../data/initialData';
import { Plus, Trash2, Save, Newspaper } from 'lucide-react';

export const AdminBlog: React.FC = () => {
  const { showToast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>(initialBlogPosts);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    dataService.getBlogPosts().then(setPosts);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await dataService.saveBlogPosts(posts);
      showToast('Articles saved to Supabase.', 'success');
    } catch {
      showToast('Failed to save articles.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const addPost = () => {
    const newPost: BlogPost = {
      id: 'blog-' + Date.now(),
      slug: 'new-article-' + Date.now(),
      title: 'New Engineering Whitepaper',
      excerpt: 'Executive summary of the architectural topic.',
      content: 'Detailed whitepaper content...',
      cover_image_url: '',
      author_name: 'Ravan Systems Architecture Team',
      tags: ['Enterprise', 'Architecture'],
      read_time_minutes: 5,
      status: 'published',
      published_at: new Date().toISOString()
    };
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-6 max-w-5xl">
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-400">Publish engineering whitepapers, technical insights, and company directives.</p>
          <div className="flex gap-3">
            <button
              onClick={addPost}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-bold uppercase flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Article</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors flex items-center gap-1.5 shadow"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'SAVING...' : 'SAVE ARTICLES'}</span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {posts.map((p, idx) => (
            <div key={p.id} className="p-6 bg-[#0a192f] border border-slate-800 rounded-xl space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Article Headline</label>
                  <input
                    type="text"
                    value={p.title}
                    onChange={e => {
                      const copy = [...posts];
                      copy[idx].title = e.target.value;
                      setPosts(copy);
                    }}
                    className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Author</label>
                  <input
                    type="text"
                    value={p.author_name}
                    onChange={e => {
                      const copy = [...posts];
                      copy[idx].author_name = e.target.value;
                      setPosts(copy);
                    }}
                    className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Excerpt</label>
                <textarea
                  rows={2}
                  value={p.excerpt}
                  onChange={e => {
                    const copy = [...posts];
                    copy[idx].excerpt = e.target.value;
                    setPosts(copy);
                  }}
                  className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Full Content (Markdown)</label>
                <textarea
                  rows={6}
                  value={p.content}
                  onChange={e => {
                    const copy = [...posts];
                    copy[idx].content = e.target.value;
                    setPosts(copy);
                  }}
                  className="w-full px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-mono leading-relaxed"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
