import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { useToast } from '../../context/ToastContext';
import { NavigationItem } from '../../types';
import { initialNavigation } from '../../data/initialData';
import { Plus, Trash2, Save, MoveUp, MoveDown, Check, X } from 'lucide-react';

export const AdminNavigation: React.FC = () => {
  const { showToast } = useToast();
  const [navItems, setNavItems] = useState<NavigationItem[]>(initialNavigation);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    dataService.getNavigation().then(setNavItems);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await dataService.saveNavigation(navItems);
      showToast('Navigation links updated and synced.', 'success');
    } catch {
      showToast('Failed to save navigation.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= navItems.length) return;

    const copy = [...navItems];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    copy.forEach((item, idx) => {
      item.display_order = idx + 1;
    });

    setNavItems(copy);
  };

  const addItem = () => {
    const newItem: NavigationItem = {
      id: 'nav-' + Date.now(),
      title: 'New Page',
      path: '/new-page',
      position: 'header',
      display_order: navItems.length + 1,
      is_active: true
    };
    setNavItems([...navItems, newItem]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-6 max-w-4xl">
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-400">Control public header links, order, badges, and active visibility without editing code.</p>
          <div className="flex gap-3">
            <button
              onClick={addItem}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-bold uppercase flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Link</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase hover:bg-secondary-fixed transition-colors flex items-center gap-1.5 shadow"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'SAVING...' : 'SAVE NAVIGATION'}</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {navItems.map((item, idx) => (
            <div key={item.id} className="p-4 bg-[#0a192f] border border-slate-800 rounded-xl flex items-center gap-3">
              <span className="font-mono text-xs text-slate-500 w-6">#{idx + 1}</span>
              <input
                type="text"
                value={item.title}
                onChange={e => {
                  const copy = [...navItems];
                  copy[idx].title = e.target.value;
                  setNavItems(copy);
                }}
                className="w-36 px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-bold"
              />
              <input
                type="text"
                value={item.path}
                onChange={e => {
                  const copy = [...navItems];
                  copy[idx].path = e.target.value;
                  setNavItems(copy);
                }}
                className="flex-1 px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => {
                  const copy = [...navItems];
                  copy[idx].is_active = !copy[idx].is_active;
                  setNavItems(copy);
                }}
                className={`px-3 py-1 rounded text-xs font-bold uppercase ${
                  item.is_active ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
                }`}
              >
                {item.is_active ? 'Active' : 'Disabled'}
              </button>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveItem(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1.5 text-slate-400 hover:text-white disabled:opacity-20 transition-colors"
                  title="Move Up"
                >
                  <MoveUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(idx, 'down')}
                  disabled={idx === navItems.length - 1}
                  className="p-1.5 text-slate-400 hover:text-white disabled:opacity-20 transition-colors"
                  title="Move Down"
                >
                  <MoveDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setNavItems(navItems.filter(n => n.id !== item.id))}
                  className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                  title="Delete Link"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
