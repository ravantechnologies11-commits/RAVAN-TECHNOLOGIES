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
  const [services, setServices] = useState<ServiceItem[] | null>(null);
  const [hackathon, setHackathon] = useState<HackathonItem | null>(null);
  const [projects, setProjects] = useState<ProjectItem[] | null>(null);
  const [ecosystem, setEcosystem] = useState<EcosystemItem[] | null>(null);
  const [site, setSite] = useState<SiteSettings | null>(null);
  const [siteLoading, setSiteLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(true);

  const { founder, loading: founderLoading } = useFounder();

  // 1. Critical Above-the-fold Hero & Site Settings (Fast path)
  const loadSiteSettings = async () => {
    try {
      const st = await dataService.getSiteSettings();
      if (st) setSite(st);
    } catch {
      // Clean fallback
    } finally {
      setSiteLoading(false);
    }
  };

  // 2. Secondary Below-the-fold Content (Progressive path, non-blocking)
  const loadSecondaryContent = async () => {
    try {
      const [s, h, p, e] = await Promise.all([
        dataService.getServices(),
        dataService.getHackathon(),
        dataService.getProjects(),
        dataService.getEcosystem()
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
    const handleDataUpdate = (e: any) => {
      const entity = e?.detail?.entity;
      if (!entity || entity === 'site_settings') loadSiteSettings();
      if (!entity || entity !== 'site_settings') loadSecondaryContent();
    };

    const handleSiteSettingsUpdate = (e: any) => {
      if (e?.detail) {
        setSite(e.detail);
        setSiteLoading(false);
      } else {
        loadSiteSettings();
      }
    };

    window.addEventListener('ravan_data_updated', handleDataUpdate);
    window.addEventListener('ravan_site_settings_updated' as any, handleSiteSettingsUpdate);
    return () => {
      window.removeEventListener('ravan_data_updated', handleDataUpdate);
      window.removeEventListener('ravan_site_settings_updated' as any, handleSiteSettingsUpdate);
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
