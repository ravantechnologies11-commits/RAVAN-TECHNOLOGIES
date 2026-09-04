import React from 'react';
import { AlertCircle, Database, HardDrive, ShieldAlert, ArrowRight } from 'lucide-react';
import { HealthStatus } from '../../hooks/useHealthCheck';

interface HealthGuardModalProps {
  health: HealthStatus;
}

export const HealthGuardModal: React.FC<HealthGuardModalProps> = ({ health }) => {
  if (!health.hasErrors) return null;

  return (
    <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 z-50 relative w-full shrink-0">
      <div className="flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
        <div>
          <h2 className="text-sm font-bold text-red-400">Database Infrastructure Missing</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
            {health.errorMessages.map((msg, idx) => (
              <span key={idx} className="text-xs text-red-200/80 flex items-center gap-1">
                {msg.includes('Storage') ? <HardDrive className="w-3 h-3" /> : <Database className="w-3 h-3" />}
                {msg}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-slate-400 hidden lg:inline-block">To enable CMS saves, execute:</span>
        <code className="text-xs bg-[#0a192f] text-secondary px-2 py-1 rounded border border-slate-700">RUN_THIS_SUPABASE_FIX.sql</code>
      </div>
    </div>
  );
};
