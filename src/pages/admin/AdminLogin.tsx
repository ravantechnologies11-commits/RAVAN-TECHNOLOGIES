import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { dataService } from '../../lib/dataService';
import { BrandLogo } from '../../components/common/BrandLogo';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

import { useBrandLogo } from '../../hooks/useBrandLogo';
import { SEOHead } from '../../components/common/SEOHead';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { logoUrl } = useBrandLogo();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Load dynamic brand logo and auto-redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      showToast('Authenticated as Executive Administrator.', 'success');
      navigate('/admin', { replace: true });
    } else {
      const err = result.error || 'Authentication failed. Please verify your credentials.';
      setErrorMessage(err);
      showToast(err, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#07111e] flex flex-col items-center justify-center p-4">
      <SEOHead title="Executive Administration Access — Ravan Technologies" noindex={true} />
      <div className="w-full max-w-md bg-[#0a192f] border border-slate-800 rounded-2xl shadow-2xl p-8">
        <BrandLogo variant="login" />

        <div className="text-center mb-8">
          <p className="text-xs font-semibold text-secondary-fixed uppercase tracking-widest -mt-4">
            Enterprise CMS & Control Panel
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3 bg-rose-950/60 border border-rose-500/40 rounded-lg flex items-start gap-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded bg-[#07111e] border border-slate-700 text-white text-sm focus:outline-none focus:border-secondary transition-colors"
                placeholder="admin@ravantechnologies.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
              Security Key / Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded bg-[#07111e] border border-slate-700 text-white text-sm focus:outline-none focus:border-secondary transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-secondary text-[#0a192f] rounded font-bold text-xs tracking-widest uppercase hover:bg-secondary-fixed transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-[#0a192f] border-t-transparent rounded-full animate-spin" />
                <span>AUTHENTICATING WITH SUPABASE...</span>
              </>
            ) : (
              <>
                <span>ACCESS CONTROL PANEL</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <Link to="/" className="hover:text-white transition-colors">
            ← Return to Public Website
          </Link>
          <div className="flex items-center gap-1.5 text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px]">Supabase Auth Guard</span>
          </div>
        </div>
      </div>
    </div>
  );
};
