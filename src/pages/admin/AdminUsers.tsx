import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../lib/dataService';
import { UserProfile } from '../../types';
import { ShieldCheck, User as UserIcon, ShieldAlert, KeyRound, CheckCircle2 } from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfiles() {
      setLoading(true);
      const data = await dataService.getProfiles();
      if (data && data.length > 0) {
        setProfiles(data);
      } else if (currentUser) {
        // Display current active session administrator
        setProfiles([
          {
            id: currentUser.id,
            email: currentUser.email,
            full_name: currentUser.name,
            role: currentUser.role,
            avatar_url: currentUser.avatar_url,
            created_at: new Date().toISOString()
          }
        ]);
      }
      setLoading(false);
    }
    loadProfiles();
  }, [currentUser]);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400';
      case 'admin':
        return 'bg-secondary/15 border-secondary/40 text-secondary';
      case 'editor':
        return 'bg-amber-950/80 border-amber-500/40 text-amber-400';
      case 'media_manager':
        return 'bg-indigo-950/80 border-indigo-500/40 text-indigo-400';
      default:
        return 'bg-slate-800 border-slate-700 text-slate-400';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-secondary" />
            <span>Administrative Accounts & RBAC</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Personnel authorized through Supabase Authentication and verified via PostgreSQL Row Level Security.
          </p>
        </div>
        <div className="px-3 py-1 bg-emerald-950/60 border border-emerald-500/30 rounded text-emerald-400 text-xs font-semibold flex items-center gap-1.5 self-start">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>RLS Enforced</span>
        </div>
      </div>

      {/* Profiles Roster */}
      <div className="bg-[#0a192f] border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800 shadow-xl">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
            Loading administrative accounts...
          </div>
        ) : profiles.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No administrator profiles registered yet.
          </div>
        ) : (
          profiles.map(u => (
            <div key={u.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-secondary text-[#0a192f] font-bold flex items-center justify-center text-xs shrink-0 shadow">
                  {(u.full_name || u.email || 'A')[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white flex items-center gap-2 truncate">
                    <span>{u.full_name || u.email.split('@')[0].toUpperCase()}</span>
                    {currentUser?.id === u.id && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-secondary bg-secondary/10 px-1.5 py-0.2 rounded border border-secondary/20">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono truncate mt-0.5">{u.email}</div>
                </div>
              </div>
              <span className={`px-2.5 py-1 border text-[10px] font-bold uppercase tracking-wider rounded shrink-0 ${getRoleBadge(u.role)}`}>
                {u.role.replace('_', ' ')}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Security Architecture Guide */}
      <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-2">
        <div className="font-bold text-slate-300 flex items-center gap-1.5">
          <KeyRound className="w-4 h-4 text-secondary" />
          <span>Role Provisioning Standard</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Admin access requires both valid credentials in <span className="text-slate-200 font-mono">auth.users</span> and an authorized role (<span className="text-secondary font-mono">super_admin</span>, <span className="text-secondary font-mono">admin</span>, <span className="text-secondary font-mono">editor</span>, or <span className="text-secondary font-mono">media_manager</span>) in <span className="text-slate-200 font-mono">public.profiles</span>. Standard accounts with role <span className="text-rose-400 font-mono">viewer</span> are automatically denied CMS access.
        </p>
      </div>
    </div>
  );
};
