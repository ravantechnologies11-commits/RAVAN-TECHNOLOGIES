import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { RoleItem } from '../../types';
import { initialRoles } from '../../data/initialData';
import { Lock } from 'lucide-react';

export const AdminRoles: React.FC = () => {
  const [roles, setRoles] = useState<RoleItem[]>(initialRoles);

  useEffect(() => {
    dataService.getRoles().then(setRoles);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-6 max-w-4xl">
        <p className="text-xs text-slate-400">Database-enforced Row Level Security (RLS) role definitions.</p>
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
      </div>
    </div>
  );
};
