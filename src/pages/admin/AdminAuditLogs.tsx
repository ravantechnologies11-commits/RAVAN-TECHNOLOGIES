import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { AuditLog } from '../../types';
import { initialAuditLogs } from '../../data/initialData';
import { ShieldCheck, Clock, User } from 'lucide-react';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>(initialAuditLogs);

  useEffect(() => {
    dataService.getAuditLogs().then(setLogs);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-6 max-w-5xl">
        <p className="text-xs text-slate-400">
          Chronological record of all updates, creates, and publishing actions executed across the CMS.
        </p>

        <div className="bg-[#0a192f] border border-slate-800 rounded-xl overflow-hidden">
          <div className="divide-y divide-slate-800">
            {logs.map(log => (
              <div key={log.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-900/40 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-secondary text-[#0a192f] text-[10px] font-bold uppercase rounded">
                      {log.action}
                    </span>
                    <span className="text-xs font-bold text-white">{log.entity}</span>
                    <span className="text-xs text-slate-400">by {log.user_name}</span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono">{log.details}</p>
                </div>
                <div className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
