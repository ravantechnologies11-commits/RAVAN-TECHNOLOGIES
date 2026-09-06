import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { HeroSection } from '../components/home/HeroSection';
import { FounderSpotlight } from '../components/home/FounderSpotlight';
import { CoreCompetencies } from '../components/home/CoreCompetencies';
import { HackathonEngine } from '../components/home/HackathonEngine';
import { LearningMethodology } from '../components/home/LearningMethodology';
import { SelectedProjectsPreview } from '../components/home/SelectedProjectsPreview';
import { EcosystemTeaser } from '../components/home/EcosystemTeaser';
import { CTASection } from '../components/home/CTASection';
import { WorkWithUsModal } from '../components/common/WorkWithUsModal';
import { SEOHead } from '../components/common/SEOHead';
import { dataService } from '../lib/dataService';
import { useFounder } from '../hooks/useFounder';
import { ServiceItem, HackathonItem, ProjectItem, EcosystemItem, SiteSettings } from '../types';

export const HomePage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [services, setServices] = useState<ServiceItem[]>(() => dataService.getServicesSync());
  const [hackathon, setHackathon] = useState<HackathonItem | null>(() => dataService.getHackathonSync());
  const [projects, setProjects] = useState<ProjectItem[]>(() => dataService.getProjectsSync());
  const [ecosystem, setEcosystem] = useState<EcosystemItem[]>(() => dataService.getEcosystemSync());
  const [site, setSite] = useState<SiteSettings>(() => dataService.getSiteSettingsSync());
  const [siteLoading, setSiteLoading] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);

  const { founder, loading: founderLoading } = useFounder();

  // 1. Critical Above-the-fold Hero & Site Settings (Fast path)
  const loadSiteSettings = async (forceRefresh = false) => {
    try {
      const st = await dataService.getSiteSettings(forceRefresh);
      if (st) setSite(st);
    } catch {
      // Clean fallback
    }
  };

  // 2. Secondary Below-the-fold Content (Progressive path, non-blocking)
  const loadSecondaryContent = async (forceRefresh = false) => {
    try {
      const [s, h, p, e] = await Promise.all([
        dataService.getServices(forceRefresh),
        dataService.getHackathon(forceRefresh),
        dataService.getProjects(forceRefresh),
        dataService.getEcosystem(forceRefresh)
      ]);
      setServices(s);
      setHackathon(h);
      setProjects(p);
      setEcosystem(e);
    } catch {
      // Clean fallback
    } finally {
      setContentLoading(false);
    }
  };

  useEffect(() => {
    // Fire critical hero fetch immediately
    loadSiteSettings();
    // Fire secondary below-the-fold queries in parallel
    loadSecondaryContent();

    // Listen for live CMS updates across tabs/windows
    const unsubscribe = dataService.subscribeToUpdates((entity, data) => {
      if (!entity || entity === 'site_settings' || entity === 'site') {
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          setSite(data);
        } else {
          loadSiteSettings(true);
        }
      }
      if (!entity || (entity !== 'site_settings' && entity !== 'site')) {
        loadSecondaryContent(true);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <Layout>
      <SEOHead />
      <HeroSection 
        onOpenModal={() => setIsModalOpen(true)}
        heroImageUrl={site?.hero_image_url}
        heroImageAlt={site?.hero_image_alt}
        focalX={site?.hero_image_focal_x}
        focalY={site?.hero_image_focal_y}
        heroBadge={site?.hero_badge_text}
        heroTitle={site?.hero_title}
        heroSubtitle={site?.hero_subtitle}
        isLoading={siteLoading}
      />
      <FounderSpotlight founder={founder} isLoading={founderLoading} />
      {(contentLoading || (services && services.length > 0)) && (
        <CoreCompetencies services={services || []} isLoading={contentLoading} />
      )}
      {(contentLoading || hackathon) && (
        <HackathonEngine hackathon={hackathon} isLoading={contentLoading} />
      )}
      <LearningMethodology />
      {(contentLoading || (projects && projects.length > 0)) && (
        <SelectedProjectsPreview projects={projects || []} isLoading={contentLoading} />
      )}
      {(contentLoading || (ecosystem && ecosystem.length > 0)) && (
        <EcosystemTeaser ecosystem={ecosystem || []} isLoading={contentLoading} />
      )}
      <CTASection onOpenModal={() => setIsModalOpen(true)} />
      <WorkWithUsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </Layout>
  );
};
