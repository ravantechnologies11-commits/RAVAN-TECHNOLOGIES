import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { RouteLoadingSkeleton } from './components/common/RouteLoadingSkeleton';
import { ScrollToTop } from './components/common/ScrollToTop';

// Public Pages (Code-Split for High-Performance Production Delivery)
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

/**
 * AppPublic — Authoritative Public Website Application Router
 * 
 * Strict Security Rules:
 * 1. Serves all public-facing pages for Ravan Technologies.
 * 2. /admin and /admin/* strictly render NotFoundPage (HTTP 404 equivalent).
 * 3. Does NOT redirect to any CMS login.
 * 4. Does NOT reveal that an Admin CMS exists.
 * 5. Does NOT bundle or evaluate admin components.
 */
export const AppPublic: React.FC = () => {
  return (
    <Suspense fallback={<RouteLoadingSkeleton />}>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
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

        {/* Strict Security: /admin is completely shielded on the public site and renders 404 */}
        <Route path="/admin" element={<NotFoundPage />} />
        <Route path="/admin/*" element={<NotFoundPage />} />

        {/* Clean catch-all fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};
