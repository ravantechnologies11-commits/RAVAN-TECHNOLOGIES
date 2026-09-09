import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { RoleItem } from '../../types';
import { Lock, Loader2, Shield } from 'lucide-react';

export const AdminRoles: React.FC = () => {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    dataService.getRoles().then(data => {
      setRoles(data || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
    window.addEventListener('ravan_data_updated', loadData);
    return () => window.removeEventListener('ravan_data_updated', loadData);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-6 max-w-4xl">
        <p className="text-xs text-slate-400">Database-enforced Row Level Security (RLS) role definitions.</p>
        
        {loading ? (
          <div className="p-16 text-center text-slate-400 bg-[#0a192f] border border-slate-800 rounded-xl">
            <Loader2 className="w-8 h-8 text-secondary animate-spin mx-auto mb-3" />
            <p className="text-xs">Loading roles from database...</p>
          </div>
        ) : roles.length === 0 ? (
          <div className="p-16 rounded-xl bg-[#0a192f] border border-slate-800 text-center">
            <Shield className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">No Roles Defined</h3>
            <p className="text-xs text-slate-400">No RLS roles are currently configured.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {roles.map(r => (
              <div key={r.id} className="p-6 bg-[#0a192f] border border-slate-800 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-secondary" />
                    {r.name}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">Permissions: {r.permissions.join(', ')}</span>
                </div>
                <p className="text-xs text-slate-400">{r.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
