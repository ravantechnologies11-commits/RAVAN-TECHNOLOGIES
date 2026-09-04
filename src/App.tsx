import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { RouteLoadingSkeleton } from './components/common/RouteLoadingSkeleton';
import { ScrollToTop } from './components/common/ScrollToTop';

// Public Pages (Code-Split for 100k+ High Traffic Performance)
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const FounderPage = lazy(() => import('./pages/FounderPage').then(m => ({ default: m.FounderPage })));
const ServicesPage = lazy(() => import('./pages/ServicesPage').then(m => ({ default: m.ServicesPage })));
const SolutionsPage = lazy(() => import('./pages/SolutionsPage').then(m => ({ default: m.SolutionsPage })));
const HackathonsPage = lazy(() => import('./pages/HackathonsPage').then(m => ({ default: m.HackathonsPage })));
const LearningPage = lazy(() => import('./pages/LearningPage').then(m => ({ default: m.LearningPage })));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage').then(m => ({ default: m.ProjectsPage })));
const EcosystemPage = lazy(() => import('./pages/EcosystemPage').then(m => ({ default: m.EcosystemPage })));
const TeamPage = lazy(() => import('./pages/TeamPage').then(m => ({ default: m.TeamPage })));
const TeamMemberProfilePage = lazy(() => import('./pages/TeamMemberProfilePage').then(m => ({ default: m.TeamMemberProfilePage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const GalleryPage = lazy(() => import('./pages/GalleryPage').then(m => ({ default: m.GalleryPage })));
const BlogPage = lazy(() => import('./pages/BlogPage').then(m => ({ default: m.BlogPage })));
const EventsPage = lazy(() => import('./pages/EventsPage').then(m => ({ default: m.EventsPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Admin Layout Shell (Persistent Shell Component)
import { AdminLayout } from './pages/admin/AdminLayout';

// Admin CMS Child Pages (Loaded Smoothly Inside Persistent Admin Layout)
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
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

export const App: React.FC = () => {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.localhost');
  const isCmsSubdomain = hostname === 'cms.ravantechnologies.com' || hostname.startsWith('cms.');
  const isExplicitAdminEnv = import.meta.env.VITE_APP_MODE === 'admin';
  const isPublicProductionDomain = !isLocalhost && !isCmsSubdomain && !isExplicitAdminEnv;

  return (
    <Suspense fallback={<RouteLoadingSkeleton />}>
      <ScrollToTop />
      <Routes>
        {/* Dedicated CMS Subdomain: root / navigates directly into admin dashboard */}
        {isCmsSubdomain ? (
          <Route path="/" element={<Navigate to="/admin" replace />} />
        ) : (
          <Route path="/" element={<HomePage />} />
        )}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/founder" element={<FounderPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/solutions" element={<SolutionsPage />} />
        <Route path="/hackathons" element={<HackathonsPage />} />
        <Route path="/learning" element={<LearningPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/ecosystem" element={<EcosystemPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/team/:slug" element={<TeamMemberProfilePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/events" element={<EventsPage />} />

        {/* Public Production Domain Gating: On the public production domain, /admin is completely shielded and renders 404 */}
        {isPublicProductionDomain ? (
          <>
            <Route path="/admin" element={<NotFoundPage />} />
            <Route path="/admin/*" element={<NotFoundPage />} />
          </>
        ) : (
          <>
            {/* Admin CMS Authentication */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Persistent Protected Admin Shell & Nested Child Routes */}
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
          </>
        )}

        {/* Fallback Catch-all Route: Clean 404 for unknown URLs */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};
