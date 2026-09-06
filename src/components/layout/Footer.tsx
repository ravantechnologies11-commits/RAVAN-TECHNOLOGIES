import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Linkedin, 
  Youtube, 
  Instagram, 
  Twitter, 
  Github, 
  Facebook, 
  MessageCircle, 
  Globe 
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { dataService } from '../../lib/dataService';
import { isDisplayableSocialUrl } from '../../lib/socialUtils';
import { SiteSettings } from '../../types';

interface CompanySocialItem {
  id: string;
  name: string;
  icon: React.FC<{ className?: string }>;
  ariaLabel: string;
  url?: string;
  colorClass: string;
}

export const Footer: React.FC = () => {
  const [site, setSite] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    dataService.getSiteSettings().then(st => {
      if (isMounted && st) {
        setSite(st);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    const handleUpdate = (e: any) => {
      if (isMounted && e.detail) setSite(e.detail);
    };
    window.addEventListener('ravan_site_settings_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('ravan_site_settings_updated', handleUpdate);
    };
  }, []);

  const companySocialItems: CompanySocialItem[] = [
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      ariaLabel: 'Visit Ravan Technologies on LinkedIn',
      url: site?.social_links?.linkedin,
      colorClass: 'hover:text-[#0a66c2] hover:border-[#0a66c2]/50 hover:bg-[#0a66c2]/10'
    },
    {
      id: 'twitter',
      name: 'Twitter / X',
      icon: Twitter,
      ariaLabel: 'Follow Ravan Technologies on X',
      url: site?.social_links?.twitter,
      colorClass: 'hover:text-white hover:border-slate-500 hover:bg-slate-800/60'
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: Github,
      ariaLabel: 'Explore Ravan Technologies GitHub repositories',
      url: site?.social_links?.github,
      colorClass: 'hover:text-white hover:border-slate-500 hover:bg-slate-800/60'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: Youtube,
      ariaLabel: 'Watch Ravan Technologies on YouTube',
      url: site?.social_links?.youtube,
      colorClass: 'hover:text-[#ff0000] hover:border-[#ff0000]/50 hover:bg-[#ff0000]/10'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      ariaLabel: 'Follow Ravan Technologies on Instagram',
      url: site?.social_links?.instagram,
      colorClass: 'hover:text-[#e4405f] hover:border-[#e4405f]/50 hover:bg-[#e4405f]/10'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      ariaLabel: 'Connect with Ravan Technologies on Facebook',
      url: site?.social_links?.facebook,
      colorClass: 'hover:text-[#1877f2] hover:border-[#1877f2]/50 hover:bg-[#1877f2]/10'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageCircle,
      ariaLabel: 'Message Ravan Technologies on WhatsApp',
      url: site?.social_links?.whatsapp || (site?.whatsapp_number ? `https://wa.me/${site.whatsapp_number.replace(/\D/g, '')}` : undefined),
      colorClass: 'hover:text-[#25d366] hover:border-[#25d366]/50 hover:bg-[#25d366]/10'
    },
    {
      id: 'website',
      name: 'Official Website',
      icon: Globe,
      ariaLabel: 'Visit Ravan Technologies corporate portal',
      url: site?.social_links?.website,
      colorClass: 'hover:text-secondary hover:border-secondary/50 hover:bg-secondary/10'
    }
  ];

  // Strictly filter only displayable URLs - NO placeholders, NO hashes, NO empty strings
  const displayableSocials = companySocialItems.filter(item => isDisplayableSocialUrl(item.url));

  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant py-16 text-on-surface-variant text-sm">
      <div className="max-w-container-max mx-auto px-gutter grid grid-cols-1 md:grid-cols-5 gap-10">
        {/* Brand Column */}
        <div className="md:col-span-2 flex flex-col items-start">
          <Link to="/" className="inline-block">
            <BrandLogo variant="footer" />
          </Link>
          <p className="text-xs text-on-surface-variant max-w-sm mb-6 leading-relaxed">
            {site?.description || (loading ? 'Loading sovereign architecture specifications...' : 'Architecting sovereign software systems, enterprise intelligence, and physical computing infrastructure for institutional scale.')}
          </p>
          <div className="text-[11px] text-on-surface-variant space-y-1">
            <p><strong>HQ:</strong> {site?.hq_location || site?.office_address || (loading ? 'Loading...' : 'Thiruvannamalai, Tamil Nadu, India')}</p>
            <p><strong>Inquiries:</strong> {site?.contact_email || (loading ? 'Loading...' : 'contact@ravantechnologies.com')}</p>
          </div>

          {/* Dynamic Corporate Social Channels (strictly database-driven) */}
          {displayableSocials.length > 0 && (
            <div className="mt-6 pt-4 border-t border-outline-variant/40 w-full">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70 block mb-2.5">
                Official Channels
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {displayableSocials.map(item => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.ariaLabel}
                    title={item.name}
                    className={`w-8 h-8 rounded-lg bg-surface-container border border-outline-variant/60 flex items-center justify-center text-on-surface-variant transition-all shadow-sm ${item.colorClass}`}
                  >
                    <item.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Core Pillars */}
        <div>
          <h4 className="font-bold text-xs uppercase tracking-widest text-primary mb-4">Core Systems</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/services" className="hover:text-primary transition-colors">Enterprise Engineering</Link></li>
            <li><Link to="/solutions" className="hover:text-primary transition-colors">Applied AI & ML</Link></li>
            <li><Link to="/projects" className="hover:text-primary transition-colors">Case Studies</Link></li>
            <li><Link to="/learning" className="hover:text-primary transition-colors">Engineering Tracks</Link></li>
          </ul>
        </div>

        {/* Innovation & Ecosystem */}
        <div>
          <h4 className="font-bold text-xs uppercase tracking-widest text-primary mb-4">Ecosystem</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/hackathons" className="hover:text-primary transition-colors">Hackathon Series</Link></li>
            <li><Link to="/ecosystem#tech-park" className="hover:text-primary transition-colors">Ravan Tech Park</Link></li>
            <li><Link to="/ecosystem#film-studio" className="hover:text-primary transition-colors">Ravan Film Studio</Link></li>
            <li><Link to="/gallery" className="hover:text-primary transition-colors">Visual Archives</Link></li>
          </ul>
        </div>

        {/* Institutional */}
        <div>
          <h4 className="font-bold text-xs uppercase tracking-widest text-primary mb-4">Institutional</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/about" className="hover:text-primary transition-colors">Company Axioms</Link></li>
            <li><Link to="/founder" className="hover:text-primary transition-colors">Meet the Founder</Link></li>
            <li><Link to="/team" className="hover:text-primary transition-colors">Governance & Team</Link></li>
            <li><Link to="/contact" className="hover:text-primary transition-colors">Initiate Contact</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-container-max mx-auto px-gutter mt-12 pt-8 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center text-[11px] text-on-surface-variant gap-4">
        <p>© {new Date().getFullYear()} {site?.site_name || 'Ravan Technologies Private Limited'}. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <span>Sovereign Intelligence Architecture</span>
          <span>•</span>
          <span>{site?.hq_location || site?.office_address || 'Thiruvannamalai, Tamil Nadu, India'}</span>
        </div>
      </div>
    </footer>
  );
};
