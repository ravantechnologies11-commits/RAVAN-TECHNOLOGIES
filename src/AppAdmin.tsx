import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { RouteLoadingSkeleton } from './components/common/RouteLoadingSkeleton';
import { ScrollToTop } from './components/common/ScrollToTop';

// Persistent Admin Layout Shell
import { AdminLayout } from './pages/admin/AdminLayout';

// Admin CMS Components
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminAbout = lazy(() => import('./pages/admin/AdminAbout').then(m => ({ default: m.AdminAbout })));
const AdminFounder = lazy(() => import('./pages/admin/AdminFounder').then(m => ({ default: m.AdminFounder })));
const AdminLeadership = lazy(() => import('./pages/admin/AdminLeadership').then(m => ({ default: m.AdminLeadership })));
const AdminServices = lazy(() => import('./pages/admin/AdminServices').then(m => ({ default: m.AdminServices })));
const AdminSolutions = lazy(() => import('./pages/admin/AdminSolutions').then(m => ({ default: m.AdminSolutions })));
const AdminProjects = lazy(() => import('./pages/admin/AdminProjects').then(m => ({ default: m.AdminProjects })));
const AdminHackathons = lazy(() => import('./pages/admin/AdminHackathons').then(m => ({ default: m.AdminHackathons })));
const AdminLearning = lazy(() => import('./pages/admin/AdminLearning').then(m => ({ default: m.AdminLearning })));
const AdminAIML = lazy(() => import('./pages/admin/AdminAIML').then(m => ({ default: m.AdminAIML })));
const AdminTechPark = lazy(() => import('./pages/admin/AdminTechPark').then(m => ({ default: m.AdminTechPark })));
const AdminFilmStudio = lazy(() => import('./pages/admin/AdminFilmStudio').then(m => ({ default: m.AdminFilmStudio })));
const AdminMedia = lazy(() => import('./pages/admin/AdminMedia').then(m => ({ default: m.AdminMedia })));
const AdminGallery = lazy(() => import('./pages/admin/AdminGallery').then(m => ({ default: m.AdminGallery })));
const AdminVideos = lazy(() => import('./pages/admin/AdminVideos').then(m => ({ default: m.AdminVideos })));
const AdminEnquiries = lazy(() => import('./pages/admin/AdminEnquiries').then(m => ({ default: m.AdminEnquiries })));
const AdminBlog = lazy(() => import('./pages/admin/AdminBlog').then(m => ({ default: m.AdminBlog })));
const AdminEvents = lazy(() => import('./pages/admin/AdminEvents').then(m => ({ default: m.AdminEvents })));
const AdminTestimonials = lazy(() => import('./pages/admin/AdminTestimonials').then(m => ({ default: m.AdminTestimonials })));
const AdminPartners = lazy(() => import('./pages/admin/AdminPartners').then(m => ({ default: m.AdminPartners })));
const AdminClients = lazy(() => import('./pages/admin/AdminClients').then(m => ({ default: m.AdminClients })));
const AdminNavigation = lazy(() => import('./pages/admin/AdminNavigation').then(m => ({ default: m.AdminNavigation })));
const AdminSEO = lazy(() => import('./pages/admin/AdminSEO').then(m => ({ default: m.AdminSEO })));
const AdminSiteSettings = lazy(() => import('./pages/admin/AdminSiteSettings').then(m => ({ default: m.AdminSiteSettings })));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers').then(m => ({ default: m.AdminUsers })));
const AdminRoles = lazy(() => import('./pages/admin/AdminRoles').then(m => ({ default: m.AdminRoles })));
const AdminAuditLogs = lazy(() => import('./pages/admin/AdminAuditLogs').then(m => ({ default: m.AdminAuditLogs })));

// Production Protected Route Guard (Strict Authorization Gate)
export const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#07111e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-secondary border-t-transparent animate-spin" />
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Verifying Security Session...
          </div>
        </div>
      </div>
    );
  }

  // Strict check: Must be authenticated AND have verified administrative role
  if (!isAuthenticated || !user || !['super_admin', 'admin'].includes(user.role)) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

/**
 * AppAdmin — Dedicated Admin CMS Control Panel Application
 * 
 * Deployment Rules:
 * 1. Used when deployed to dedicated Admin Vercel project or cms.ravantechnologies.com.
 * 2. Root / automatically redirects to /admin dashboard (or /admin/login if unauthenticated).
 * 3. Sets noindex/nofollow to prevent crawler indexing.
 * 4. Strictly protects all administrative mutation consoles.
 */
export const AppAdmin: React.FC = () => {
  useEffect(() => {
    // Shield Admin CMS from search crawlers
    document.title = 'Ravan Technologies — Enterprise Control Panel';
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'noindex, nofollow, noarchive');
  }, []);

  return (
    <Suspense fallback={<RouteLoadingSkeleton />}>
      <ScrollToTop />
      <Routes>
        {/* On dedicated Admin CMS deployment: Root / redirects straight to /admin */}
        <Route path="/" element={<Navigate to="/admin" replace />} />

        {/* Dedicated Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Persistent Protected Admin Shell & Nested Child Consoles */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="about" element={<AdminAbout />} />
          <Route path="founder" element={<AdminFounder />} />
          <Route path="leadership" element={<AdminLeadership />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="solutions" element={<AdminSolutions />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="hackathons" element={<AdminHackathons />} />
          <Route path="learning" element={<AdminLearning />} />
          <Route path="aiml" element={<AdminAIML />} />
          <Route path="tech-park" element={<AdminTechPark />} />
          <Route path="film-studio" element={<AdminFilmStudio />} />
          <Route path="media" element={<AdminMedia />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="videos" element={<AdminVideos />} />
          <Route path="enquiries" element={<AdminEnquiries />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="testimonials" element={<AdminTestimonials />} />
          <Route path="partners" element={<AdminPartners />} />
          <Route path="clients" element={<AdminClients />} />
          <Route path="navigation" element={<AdminNavigation />} />
          <Route path="seo" element={<AdminSEO />} />
          <Route path="settings" element={<AdminSiteSettings />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="roles" element={<AdminRoles />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
        </Route>

        {/* Catch-all on Admin domain redirects back to /admin */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Suspense>
  );
};
