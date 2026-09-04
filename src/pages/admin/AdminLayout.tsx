import React, { useState, useRef, useLayoutEffect, useEffect, Suspense } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../lib/dataService';
import { isSupabaseConfigured } from '../../lib/supabase';
import { AdminFloatingWidget } from '../../components/admin/AdminFloatingWidget';
import { AdminContentSkeleton } from '../../components/admin/AdminContentSkeleton';
import { BrandLogo } from '../../components/common/BrandLogo';
import {
  LayoutDashboard,
  Info,
  UserCheck,
  Users,
  Briefcase,
  Layers,
  FolderGit2,
  Trophy,
  GraduationCap,
  Sparkles,
  Building2,
  Clapperboard,
  Image,
  Images,
  Video,
  Inbox,
  Newspaper,
  Calendar,
  Quote,
  Handshake,
  Building,
  Navigation,
  Search,
  Settings,
  ShieldCheck,
  Lock,
  Activity,
  LogOut,
  ChevronRight,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';

interface AdminLayoutProps {
  children?: React.ReactNode;
  title?: string;
}

// Module-level persistent scroll memory for Admin sidebar across all route transitions
let globalAdminSidebarScroll = 0;

const ROUTE_TITLES: Record<string, string> = {
  '/admin': 'Enterprise CMS Dashboard',
  '/admin/about': 'About Us & Mandate CMS',
  '/admin/founder': 'Founder & Chief Architect Profile',
  '/admin/leadership': 'Leadership & Executive Team',
  '/admin/services': 'Enterprise Services & Offerings',
  '/admin/solutions': 'Solution Blueprints & Systems',
  '/admin/projects': 'Case Studies & Strategic Deliveries',
  '/admin/hackathons': 'Ravan Hackathon Engine & Challenges',
  '/admin/learning': 'Learning Programs & Academic Tracks',
  '/admin/aiml': 'Sovereign AI & ML Architectures',
  '/admin/tech-park': 'Ravan Tech Park Infrastructure',
  '/admin/film-studio': 'Ravan Film Studio & Virtual Production',
  '/admin/media': 'Centralized Media & Assets Library',
  '/admin/gallery': 'Gallery Albums & Campus Imagery',
  '/admin/videos': 'High-Definition Video Reels & Media',
  '/admin/enquiries': 'Contact Directives & Client Inquiries',
  '/admin/blog': 'Engineering Whitepapers & Intelligence',
  '/admin/events': 'Summits, Keynotes & Global Events',
  '/admin/testimonials': 'Client Endorsements & Testimonials',
  '/admin/partners': 'Strategic Alliances & Ecosystem Partners',
  '/admin/clients': 'Institutional Client Portfolio',
  '/admin/navigation': 'Navigation Hierarchy CMS',
  '/admin/seo': 'Search Engine Optimization & Metadata',
  '/admin/settings': 'Site Settings & Logo Management',
  '/admin/users': 'User Accounts & Access Control',
  '/admin/roles': 'Role-Based Access Control (RBAC)',
  '/admin/audit-logs': 'System Activity & Compliance Audit Logs'
};

import { useBrandLogo } from '../../hooks/useBrandLogo';
import { useHealthCheck } from '../../hooks/useHealthCheck';
import { HealthGuardModal } from '../../components/admin/HealthGuardModal';

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useBrandLogo(); // Initialize brand settings reactivity for BrandLogo component
  const sidebarNavRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLElement>(null);
  const health = useHealthCheck();

  // Strict SEO Guard: Never allow search engines to index the private Admin CMS
  useEffect(() => {
    let robotsMeta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.name = 'robots';
      document.head.appendChild(robotsMeta);
    }
    const previousContent = robotsMeta.content;
    robotsMeta.content = 'noindex, nofollow, noarchive';

    return () => {
      if (robotsMeta) {
        robotsMeta.content = previousContent || 'index, follow';
      }
    };
  }, []);

  // Restore exact sidebar scroll position immediately on mount and after route transitions
  useLayoutEffect(() => {
    if (sidebarNavRef.current) {
      sidebarNavRef.current.scrollTop = globalAdminSidebarScroll;
    }
  }, [location.pathname]);

  // Track sidebar scroll in real-time
  const handleSidebarScroll = (e: React.UIEvent<HTMLDivElement>) => {
    globalAdminSidebarScroll = e.currentTarget.scrollTop;
  };

  const currentTitle = title || ROUTE_TITLES[location.pathname] || 'Ravan CMS Control Panel';

  const navGroups = [
    {
      label: 'OVERVIEW',
      items: [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard }
      ]
    },
    {
      label: 'CONTENT',
      items: [
        { name: 'About Us', path: '/admin/about', icon: Info },
        { name: 'Founder Profile', path: '/admin/founder', icon: UserCheck },
        { name: 'Leadership Team', path: '/admin/leadership', icon: Users },
        { name: 'Services', path: '/admin/services', icon: Briefcase },
        { name: 'Solutions', path: '/admin/solutions', icon: Layers },
        { name: 'Projects', path: '/admin/projects', icon: FolderGit2 }
      ]
    },
    {
      label: 'INNOVATION',
      items: [
        { name: 'Hackathons', path: '/admin/hackathons', icon: Trophy },
        { name: 'Learning', path: '/admin/learning', icon: GraduationCap },
        { name: 'AI / ML Models', path: '/admin/aiml', icon: Sparkles }
      ]
    },
    {
      label: 'ECOSYSTEM',
      items: [
        { name: 'Ravan Tech Park', path: '/admin/tech-park', icon: Building2 },
        { name: 'Ravan Film Studio', path: '/admin/film-studio', icon: Clapperboard }
      ]
    },
    {
      label: 'MEDIA',
      items: [
        { name: 'Media Library', path: '/admin/media', icon: Image },
        { name: 'Gallery Albums', path: '/admin/gallery', icon: Images },
        { name: 'Videos & Reels', path: '/admin/videos', icon: Video }
      ]
    },
    {
      label: 'COMMUNICATION',
      items: [
        { name: 'Contact Enquiries', path: '/admin/enquiries', icon: Inbox }
      ]
    },
    {
      label: 'GROWTH',
      items: [
        { name: 'Blog / News', path: '/admin/blog', icon: Newspaper },
        { name: 'Events & Summits', path: '/admin/events', icon: Calendar },
        { name: 'Testimonials', path: '/admin/testimonials', icon: Quote },
        { name: 'Partners', path: '/admin/partners', icon: Handshake },
        { name: 'Clients', path: '/admin/clients', icon: Building }
      ]
    },
    {
      label: 'WEBSITE',
      items: [
        { name: 'Navigation CMS', path: '/admin/navigation', icon: Navigation },
        { name: 'SEO & Health', path: '/admin/seo', icon: Search },
        { name: 'Site Settings & Logo', path: '/admin/settings', icon: Settings }
      ]
    },
    {
      label: 'SYSTEM',
      items: [
        { name: 'User Accounts', path: '/admin/users', icon: ShieldCheck },
        { name: 'Roles & Permissions', path: '/admin/roles', icon: Lock },
        { name: 'Activity Logs', path: '/admin/audit-logs', icon: Activity }
      ]
    }
  ];

  // Prevent browser back button from re-revealing cached CMS DOM after logout
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        window.location.reload();
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      // Hard replace browser URL to purge CMS views from history stack
      window.location.replace('/admin/login');
    }
  };

  return (
    <div className="h-screen w-screen max-w-full overflow-hidden flex flex-col bg-[#07111e] text-slate-100 font-body antialiased relative">
      <HealthGuardModal health={health} />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Menu Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden animate-fade-in"
        />
      )}

      {/* LEFT SIDEBAR: Completely Fixed to Viewport with Independent Nav Scroll */}
      <aside
        className={`fixed lg:static top-0 left-0 z-50 h-screen w-72 shrink-0 bg-[#0a192f] border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 overflow-hidden ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header (Always pinned at top of sidebar) */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-[#0a192f]">
          <Link to="/admin" className="flex items-center gap-2 group">
            <BrandLogo variant="sidebar" />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-white lg:hidden"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Items (Scrolls independently & strictly preserves scroll position) */}
        <div
          ref={sidebarNavRef}
          onScroll={handleSidebarScroll}
          className="flex-1 min-h-0 overflow-y-auto p-3 space-y-5"
        >
          {navGroups.map((group, gi) => (
            <div key={gi}>
              <div className="px-3 text-[9px] font-bold tracking-widest uppercase text-slate-400 mb-1.5">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const active = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-colors ${
                        active
                          ? 'bg-secondary text-[#0a192f] font-bold shadow'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {active && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Footer (Always pinned at bottom of sidebar) */}
        <div className="p-4 border-t border-slate-800 bg-[#07111e]/90 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-secondary text-[#0a192f] font-bold flex items-center justify-center text-xs shrink-0">
                {user?.name?.[0] || 'A'}
              </div>
              <div className="overflow-hidden min-w-0">
                <div className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</div>
                <div className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@ravantechnologies.com'}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Log Out of Ravan CMS"
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <Link
            to="/"
            target="_blank"
            className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>View Public Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT AREA: Independent Scroll & Fixed Topbar */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Fixed Top Bar (Never scrolls with content) */}
        <header className="h-16 shrink-0 border-b border-slate-800 bg-[#0a192f]/95 backdrop-blur-md px-6 flex items-center justify-between z-30">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded hover:bg-slate-800 text-slate-300 lg:hidden shrink-0"
              aria-label="Open Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base font-bold font-display text-white tracking-tight truncate">
              {currentTitle}
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://ravan-technologies-i99k.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded text-xs font-semibold transition-colors"
              title="Open public website in a new tab"
            >
              <span>Public Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            {isSupabaseConfigured ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-950/60 border border-emerald-500/30 rounded text-emerald-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="hidden sm:inline">SUPABASE LIVE</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-950/60 border border-amber-500/30 rounded text-amber-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <span className="hidden sm:inline">LOCAL MODE</span>
              </div>
            )}
          </div>
        </header>

        {/* Scrollable Page Content (ONLY this container scrolls vertically) */}
        <main
          ref={mainContentRef}
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-8"
        >
          <div className="max-w-7xl mx-auto w-full">
            <Suspense fallback={<AdminContentSkeleton />}>
              {children || <Outlet />}
            </Suspense>
          </div>
        </main>
      </div>

      {/* Self-Contained Independent Draggable Widget */}
      <AdminFloatingWidget />
      </div>
    </div>
  );
};
