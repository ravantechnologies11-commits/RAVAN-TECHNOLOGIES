import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { Link } from 'react-router-dom';
import {
  FolderGit2,
  Briefcase,
  Trophy,
  Users,
  Image,
  Inbox,
  ArrowRight,
  TrendingUp,
  Clock,
  Plus
} from 'lucide-react';
import { AuditLog } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    projectsCount: 0,
    servicesCount: 0,
    hackathonTitle: '',
    leadershipCount: 0,
    mediaCount: 0,
    enquiriesCount: 0,
    newEnquiriesCount: 0
  });
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    async function loadData() {
      const [projects, services, hackathon, leadership, media, enquiries, logs] = await Promise.all([
        dataService.getProjects(),
        dataService.getServices(),
        dataService.getHackathon(),
        dataService.getLeadership(),
        dataService.getMedia(),
        dataService.getEnquiries(),
        dataService.getAuditLogs()
      ]);

      setStats({
        projectsCount: projects.length,
        servicesCount: services.length,
        hackathonTitle: hackathon.title,
        leadershipCount: leadership.length + 1, // + Founder
        mediaCount: media.length,
        enquiriesCount: enquiries.length,
        newEnquiriesCount: enquiries.filter(e => e.status === 'new').length
      });
      setRecentLogs(logs.slice(0, 5));
    }
    loadData();
  }, []);

  const cards = [
    { title: 'Published Projects', count: stats.projectsCount, path: '/admin/projects', icon: FolderGit2, color: 'text-sky-400' },
    { title: 'Active Services', count: stats.servicesCount, path: '/admin/services', icon: Briefcase, color: 'text-amber-400' },
    { title: 'Leadership Profiles', count: stats.leadershipCount, path: '/admin/leadership', icon: Users, color: 'text-emerald-400' },
    { title: 'Media Library Files', count: stats.mediaCount, path: '/admin/media', icon: Image, color: 'text-indigo-400' },
    { title: 'Contact Inquiries', count: stats.enquiriesCount, badge: stats.newEnquiriesCount > 0 ? `${stats.newEnquiriesCount} New` : undefined, path: '/admin/enquiries', icon: Inbox, color: 'text-rose-400' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <Link
              key={i}
              to={c.path}
              className="p-6 bg-[#0a192f] border border-slate-800 rounded-xl hover:border-slate-700 transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{c.title}</span>
                <Icon className={`w-5 h-5 ${c.color}`} />
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold font-display text-white">{c.count}</div>
                {c.badge && (
                  <span className="px-2 py-0.5 bg-rose-950 border border-rose-500/40 text-rose-400 text-[10px] font-bold rounded">
                    {c.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-4 bg-[#0a192f] border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
            Quick Actions
          </h3>
          <div className="space-y-2.5">
            <Link
              to="/admin/founder"
              className="w-full py-2.5 px-4 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded flex items-center justify-between transition-colors"
            >
              <span>Manage Founders & Architecture</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/admin/projects"
              className="w-full py-2.5 px-4 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded flex items-center justify-between transition-colors"
            >
              <span>Add New Case Study Project</span>
              <Plus className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/admin/hackathons"
              className="w-full py-2.5 px-4 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded flex items-center justify-between transition-colors"
            >
              <span>Manage Hackathon Vol. IV Tracks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/admin/media"
              className="w-full py-2.5 px-4 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded flex items-center justify-between transition-colors"
            >
              <span>Upload New Media Assets</span>
              <Plus className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/admin/enquiries"
              className="w-full py-2.5 px-4 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded flex items-center justify-between transition-colors"
            >
              <span>Review Incoming Inquiries ({stats.newEnquiriesCount})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Live Activity Audit Feed */}
        <div className="lg:col-span-8 bg-[#0a192f] border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Recent System Activity
            </h3>
            <Link to="/admin/audit-logs" className="text-xs text-secondary hover:underline">
              View All Logs →
            </Link>
          </div>

          <div className="divide-y divide-slate-800">
            {recentLogs.map(log => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-bold uppercase rounded">
                      {log.action}
                    </span>
                    <span className="text-xs font-semibold text-white">{log.entity}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{log.details}</p>
                </div>
                <div className="text-[10px] font-mono text-slate-500 flex-shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
