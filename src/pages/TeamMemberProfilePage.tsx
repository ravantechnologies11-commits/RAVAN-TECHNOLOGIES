import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { SEOHead } from '../components/common/SEOHead';
import { SmartImage } from '../components/common/SmartImage';
import { SocialProfilesList } from '../components/team/SocialProfilesList';
import { ProfileEducationSection } from '../components/team/ProfileEducationSection';
import { ProfileExperienceSection } from '../components/team/ProfileExperienceSection';
import { ProfileProjectsSection } from '../components/team/ProfileProjectsSection';
import { ProfileSkillsSection } from '../components/team/ProfileSkillsSection';
import { WorkWithUsModal } from '../components/common/WorkWithUsModal';
import { dataService, generateSlug } from '../lib/dataService';
import { buildTeamMemberPersonSchema, buildFounderPersonSchema } from '../lib/seoService';
import { LeadershipMember, Founder } from '../types';
import { 
  ArrowLeft, 
  Linkedin, 
  Twitter, 
  Github, 
  Mail, 
  Phone, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  Award, 
  Briefcase, 
  Target, 
  Layers, 
  UserX,
  Sparkles
} from 'lucide-react';

type ProfileData = 
  | { type: 'leadership'; member: LeadershipMember }
  | { type: 'founder'; member: Founder };

export const TeamMemberProfilePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      if (!slug) {
        if (isMounted) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      const cleanSlug = slug.toLowerCase().trim();

      try {
        // 1. Check if slug matches Founder profiles (published only)
        const founder = await dataService.getFounderBySlug(cleanSlug);
        if (founder && isMounted) {
          setProfile({ type: 'founder', member: founder });
          setLoading(false);
          return;
        }

        // 2. Check if slug matches leadership members (published only)
        const leader = await dataService.getLeadershipMemberBySlug(cleanSlug);
        if (leader && isMounted) {
          setProfile({ type: 'leadership', member: leader });
          setLoading(false);
          return;
        }

        if (isMounted) {
          setProfile(null);
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setProfile(null);
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Loading State
  if (loading) {
    return (
      <Layout>
        <div className="w-full max-w-container-max mx-auto px-gutter pt-24 pb-28">
          <div className="h-4 w-40 bg-slate-800 rounded animate-pulse mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-4 space-y-4">
              <div className="aspect-[4/5] bg-slate-900 rounded-2xl animate-pulse border border-slate-800" />
              <div className="h-6 w-32 bg-slate-800 rounded animate-pulse" />
            </div>
            <div className="lg:col-span-8 space-y-6">
              <div className="h-10 w-3/4 bg-slate-800 rounded animate-pulse" />
              <div className="h-5 w-1/2 bg-slate-800 rounded animate-pulse" />
              <div className="h-24 w-full bg-slate-800/60 rounded-xl animate-pulse" />
              <div className="h-36 w-full bg-slate-800/40 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Not Found State
  if (!profile) {
    return (
      <Layout>
        <SEOHead 
          title="Executive Profile Not Found — Ravan Technologies"
          description="The requested executive profile could not be located."
          noindex={true}
        />
        <div className="min-h-[70vh] flex items-center justify-center px-gutter py-24">
          <div className="max-w-md w-full p-8 md:p-12 rounded-2xl bg-surface border border-outline-variant text-center shadow-xl">
            <div className="w-16 h-16 rounded-full bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary mx-auto mb-6">
              <UserX className="w-8 h-8" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-display text-primary mb-3">
              Executive Profile Not Found
            </h1>
            <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed mb-8">
              The requested executive profile is either unpublished, does not exist, or has been archived from the corporate directory.
            </p>
            <Link
              to="/team"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-primary-container transition-colors shadow"
            >
              <ArrowLeft className="w-4 h-4 text-secondary" />
              <span>RETURN TO TEAM DIRECTORY</span>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Render Founder Profile
  if (profile.type === 'founder') {
    const { member } = profile;
    return (
      <Layout>
        <SEOHead 
          title={member.seo_title || `${member.name} — ${member.designation} | Ravan Technologies`}
          description={member.seo_description || member.short_intro || member.bio || member.vision || `Executive leadership profile for ${member.name}.`}
          ogImage={member.og_image || member.image_url}
          ogType="profile"
          canonical={member.canonical_url || `/team/${slug}`}
          noindex={member.status !== 'published'}
          breadcrumbs={[
            { name: 'Home', path: '/' },
            { name: 'Team Directory', path: '/team' },
            { name: member.name, path: `/team/${slug}` }
          ]}
          mainEntity={buildFounderPersonSchema(member)}
        />

        <div className="w-full max-w-container-max mx-auto px-gutter pt-20 pb-28">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant mb-8">
            <Link to="/team" className="hover:text-secondary flex items-center gap-1.5 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>TEAM DIRECTORY</span>
            </Link>
            <span className="opacity-40">/</span>
            <span className="text-secondary uppercase tracking-wider">{member.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Portrait & Meta */}
            <div className="lg:col-span-5 space-y-4">
              {/* Executive Role Badge - Cleanly positioned above portrait, zero corner obstruction */}
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1 bg-secondary/15 text-secondary border border-secondary/35 rounded-lg text-[11px] font-bold uppercase tracking-widest shadow-sm">
                  FOUNDER & CHIEF ARCHITECT
                </span>
              </div>

              {/* Clean Unobstructed Portrait Container with Premium Motion */}
              <div 
                style={{ touchAction: 'manipulation' }}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-lg shadow-slate-900/10 hover:shadow-2xl hover:shadow-slate-900/15 border border-outline-variant/80 hover:border-secondary/50 transition-all duration-500 ease-out cursor-pointer select-none motion-reduce:transform-none"
              >
                {member.image_url ? (
                  <SmartImage
                    src={member.image_url}
                    alt={member.name}
                    priority={true}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] group-active:scale-[1.02] motion-reduce:transform-none will-change-transform"
                    containerClassName="w-full h-full bg-transparent overflow-hidden"
                    fallbackText={member.name}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container text-slate-500">
                    <span className="text-4xl font-bold font-display text-secondary tracking-widest group-hover:scale-105 transition-transform duration-500 motion-reduce:transform-none">
                      {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                    <span className="text-xs uppercase tracking-widest text-slate-400 mt-2">Executive Profile</span>
                  </div>
                )}
              </div>

              {/* Social Links & Official Actions */}
              <div className="p-6 rounded-xl bg-surface border border-outline-variant space-y-4">
                <SocialProfilesList
                  socialLinks={member.social_links}
                  memberName={member.name}
                  publicEmail={member.public_email || member.social_links?.email}
                />

                {/* Public Phone ONLY if intentionally stored and marked as public */}
                {member.public_phone && (
                  <div className="pt-3 border-t border-outline-variant/60 flex items-center gap-2 text-xs text-on-surface-variant">
                    <Phone className="w-4 h-4 text-secondary shrink-0" />
                    <a
                      href={`tel:${member.public_phone}`}
                      className="font-mono text-primary hover:text-secondary transition-colors truncate"
                    >
                      {member.public_phone}
                    </a>
                  </div>
                )}

                <div className="pt-2 border-t border-outline-variant/60 flex flex-col gap-2.5">
                  <Link
                    to="/founder"
                    className="w-full py-2.5 px-4 bg-primary text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-primary-container transition-colors flex items-center justify-center gap-2 shadow"
                  >
                    <span>VIEW FULL ARCHITECT ADDRESS</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsWorkModalOpen(true)}
                    className="w-full py-2.5 px-4 border border-secondary/50 text-secondary hover:bg-secondary/10 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>WORK WITH US / ENGAGE</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Bio, Vision & Credentials */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-widest text-secondary">
                    EXECUTIVE LEADERSHIP
                  </span>
                  <div className="h-px w-8 bg-secondary" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold font-display text-primary tracking-tight mb-2">
                  {member.name}
                </h1>
                <p className="text-base font-semibold text-secondary uppercase tracking-wider">
                  {member.designation} {member.tenure_years && <span className="text-on-surface-variant font-normal normal-case">· {member.tenure_years}</span>}
                </p>
              </div>

              {/* Vision Lead */}
              {member.vision && (
                <div className="p-6 rounded-2xl bg-surface-container border-l-4 border-l-secondary border border-outline-variant shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-secondary block mb-1">
                    Institutional Mandate
                  </span>
                  <p className="text-base font-body text-primary italic leading-relaxed">
                    &ldquo;{member.vision}&rdquo;
                  </p>
                </div>
              )}

              {/* Biography */}
              {member.bio && (
                <div className="space-y-3">
                  <h2 className="text-lg font-bold font-display text-primary flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-secondary" />
                    <span>Executive Biography</span>
                  </h2>
                  <p className="text-sm md:text-base text-on-surface-variant leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              )}

              {/* Focus Areas */}
              {member.focus_areas && member.focus_areas.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-lg font-bold font-display text-primary flex items-center gap-2">
                    <Target className="w-4 h-4 text-secondary" />
                    <span>Core Architectural Focus</span>
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {member.focus_areas.map((area, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-lg bg-surface border border-outline-variant text-xs font-semibold text-primary shadow-sm"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Achievements */}
              {member.achievements && member.achievements.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold font-display text-primary flex items-center gap-2">
                    <Award className="w-4 h-4 text-secondary" />
                    <span>Institutional Achievements</span>
                  </h2>
                  <div className="space-y-2.5">
                    {member.achievements.map((ach, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-surface border border-outline-variant flex items-start gap-3 shadow-sm"
                      >
                        <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                        <span className="text-sm text-on-surface-variant leading-relaxed">{ach}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ============================================================ */}
          {/* STRUCTURED CORPORATE PROFILE SECTIONS                        */}
          {/* ============================================================ */}
          <div className="mt-12 space-y-12">
            {/* 2. EDUCATION / QUALIFICATIONS */}
            <ProfileEducationSection education={member.education} />

            {/* 3. EXPERIENCE */}
            <ProfileExperienceSection experiences={member.experience_records} />

            {/* 4. PROJECTS (2-column responsive card grid) */}
            <ProfileProjectsSection projects={member.projects} />

            {/* 5. SKILLS / TECHNICAL EXPERTISE (Grouped by Category) */}
            <ProfileSkillsSection skills={member.structured_skills} />
          </div>
        </div>
        <WorkWithUsModal 
          isOpen={isWorkModalOpen} 
          onClose={() => setIsWorkModalOpen(false)} 
          defaultInquiryType="Executive Consultation"
        />
      </Layout>
    );
  }

  // Render Leadership Member Profile
  const { member } = profile;
  const initials = member.name
    ? member.name
        .split(' ')
        .filter(Boolean)
        .map(part => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'RT';

  return (
    <Layout>
      <SEOHead 
        title={`${member.name} — ${member.designation} | Ravan Technologies`}
        description={member.short_intro || member.bio || `Executive profile of ${member.name}, ${member.designation} at Ravan Technologies.`}
        ogImage={member.image_url}
        ogType="profile"
        canonical={`/team/${slug}`}
        noindex={member.status !== 'published'}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Team Directory', path: '/team' },
          { name: member.name, path: `/team/${slug}` }
        ]}
        mainEntity={buildTeamMemberPersonSchema(member, slug || '')}
      />

      <div className="w-full max-w-container-max mx-auto px-gutter pt-20 pb-28">
        {/* Breadcrumbs Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant mb-8">
          <Link to="/team" className="hover:text-secondary flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>TEAM DIRECTORY</span>
          </Link>
          <span className="opacity-40">/</span>
          <span className="text-secondary uppercase tracking-wider">{member.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Portrait, Branch Badge & Official Contact */}
          <div className="lg:col-span-5 space-y-4">
            {/* Division / Branch Badge - Positioned cleanly above portrait, zero corner obstruction */}
            {member.company_branch && (
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1 bg-surface-container text-primary border border-outline-variant rounded-lg text-[11px] font-bold uppercase tracking-wider shadow-sm">
                  {member.company_branch}
                </span>
              </div>
            )}

            {/* Clean Unobstructed Portrait Container with Premium Motion */}
            <div 
              style={{ touchAction: 'manipulation' }}
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-lg shadow-slate-900/10 hover:shadow-2xl hover:shadow-slate-900/15 border border-outline-variant/80 hover:border-secondary/50 transition-all duration-500 ease-out cursor-pointer select-none motion-reduce:transform-none"
            >
              {member.image_url ? (
                <SmartImage
                  src={member.image_url}
                  alt={member.name}
                  priority={true}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] group-active:scale-[1.02] motion-reduce:transform-none will-change-transform"
                  containerClassName="w-full h-full bg-transparent overflow-hidden"
                  fallbackText={member.name}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-surface-container text-center">
                  <div className="w-24 h-24 rounded-2xl bg-secondary/10 border-2 border-secondary/40 flex items-center justify-center text-secondary font-display text-3xl font-bold mb-3 shadow-sm group-hover:scale-105 transition-transform duration-500 motion-reduce:transform-none">
                    {initials}
                  </div>
                  <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
                    Executive Profile
                  </span>
                </div>
              )}
            </div>

            {/* Official External Links / Contact */}
            <div className="p-6 rounded-xl bg-surface border border-outline-variant space-y-4">
              <SocialProfilesList
                socialLinks={member.social_links}
                memberName={member.name}
                publicEmail={member.public_email}
              />

              {/* Public Phone ONLY if intentionally stored and marked as public */}
              {member.public_phone && (
                <div className="pt-3 border-t border-outline-variant/60 flex items-center gap-2 text-xs text-on-surface-variant">
                  <Phone className="w-4 h-4 text-secondary shrink-0" />
                  <a
                    href={`tel:${member.public_phone}`}
                    className="font-mono text-primary hover:text-secondary transition-colors truncate"
                  >
                    {member.public_phone}
                  </a>
                </div>
              )}

              <div className="pt-2 border-t border-outline-variant/60">
                <button
                  type="button"
                  onClick={() => setIsWorkModalOpen(true)}
                  className="w-full py-2.5 px-4 bg-primary text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-primary-container transition-colors flex items-center justify-center gap-2 shadow"
                >
                  <span>WORK WITH US / ENGAGE</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Profile Header, Short Intro & Bio */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-secondary">
                  GOVERNANCE & LEADERSHIP
                </span>
                <div className="h-px w-8 bg-secondary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-display text-primary tracking-tight mb-2">
                {member.name}
              </h1>
              <p className="text-base font-semibold text-secondary uppercase tracking-wider">
                {member.designation}
              </p>
            </div>

            {/* 1. SHORT INTRODUCTION */}
            {member.short_intro && (
              <div className="p-6 rounded-2xl bg-surface-container border-l-4 border-l-secondary border border-outline-variant shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-widest text-secondary block mb-1">
                  EXECUTIVE MANDATE
                </span>
                <p className="text-base md:text-lg font-body text-primary italic leading-relaxed">
                  &ldquo;{member.short_intro}&rdquo;
                </p>
              </div>
            )}

            {/* Executive Biography */}
            {member.bio && (
              <div className="space-y-3">
                <h2 className="text-lg font-bold font-display text-primary flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-secondary" />
                  <span>Executive Biography</span>
                </h2>
                <p className="text-sm md:text-base text-on-surface-variant leading-relaxed">
                  {member.bio}
                </p>
              </div>
            )}

            {/* Institutional Achievements / Milestones */}
            {member.achievements && member.achievements.length > 0 && (
              <div className="space-y-3 pt-2">
                <h2 className="text-base font-bold font-display text-primary flex items-center gap-2">
                  <Award className="w-4 h-4 text-secondary" />
                  <span>Key Milestones & Recognition</span>
                </h2>
                <div className="space-y-2">
                  {member.achievements.map((ach, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-surface border border-outline-variant flex items-start gap-3 shadow-xs"
                    >
                      <Award className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                      <span className="text-xs md:text-sm text-on-surface-variant leading-relaxed">{ach}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* STRUCTURED CORPORATE PROFILE SECTIONS                        */}
        {/* ============================================================ */}
        <div className="mt-12 space-y-12">
          {/* 2. EDUCATION / QUALIFICATIONS */}
          <ProfileEducationSection education={member.education} />

          {/* 3. EXPERIENCE */}
          <ProfileExperienceSection experiences={member.experience_records} />

          {/* 4. PROJECTS (2-column responsive card grid) */}
          <ProfileProjectsSection projects={member.projects} />

          {/* 5. SKILLS / TECHNICAL EXPERTISE (Grouped by Category) */}
          <ProfileSkillsSection skills={member.structured_skills} />
        </div>
      </div>
      <WorkWithUsModal 
        isOpen={isWorkModalOpen} 
        onClose={() => setIsWorkModalOpen(false)} 
        defaultInquiryType={`Leadership Consultation: ${member.name}`}
      />
    </Layout>
  );
};
