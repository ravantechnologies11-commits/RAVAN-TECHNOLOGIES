import React from 'react';
import { 
  Linkedin, 
  Youtube, 
  Instagram, 
  Twitter, 
  Github, 
  Facebook, 
  Globe, 
  Mail, 
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { SocialLinks } from '../../types';
import { isDisplayableSocialUrl, SupportedPlatformId } from '../../lib/socialUtils';

interface SocialProfilesListProps {
  socialLinks?: SocialLinks;
  memberName: string;
  publicEmail?: string;
  variant?: 'compact' | 'expanded';
  className?: string;
}

interface PlatformItem {
  id: SupportedPlatformId;
  name: string;
  icon: React.FC<{ className?: string }>;
  ariaLabel: (name: string) => string;
  colorClass: string;
}

const PLATFORM_MAP: PlatformItem[] = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    ariaLabel: (name) => `Connect with ${name} on LinkedIn`,
    colorClass: 'hover:text-[#0a66c2] hover:border-[#0a66c2]/40'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    ariaLabel: (name) => `Visit ${name}'s YouTube channel`,
    colorClass: 'hover:text-[#ff0000] hover:border-[#ff0000]/40'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    ariaLabel: (name) => `Follow ${name} on Instagram`,
    colorClass: 'hover:text-[#e4405f] hover:border-[#e4405f]/40'
  },
  {
    id: 'twitter',
    name: 'Twitter / X',
    icon: Twitter,
    ariaLabel: (name) => `Follow ${name} on X (formerly Twitter)`,
    colorClass: 'hover:text-white hover:border-slate-500'
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: Github,
    ariaLabel: (name) => `View ${name}'s GitHub code repository`,
    colorClass: 'hover:text-white hover:border-slate-500'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    ariaLabel: (name) => `Visit ${name}'s Facebook page`,
    colorClass: 'hover:text-[#1877f2] hover:border-[#1877f2]/40'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: MessageCircle,
    ariaLabel: (name) => `Connect with ${name} on WhatsApp`,
    colorClass: 'hover:text-[#25d366] hover:border-[#25d366]/40'
  },
  {
    id: 'website',
    name: 'Official Website',
    icon: Globe,
    ariaLabel: (name) => `Visit ${name}'s official website`,
    colorClass: 'hover:text-secondary hover:border-secondary/40'
  }
];

export const SocialProfilesList: React.FC<SocialProfilesListProps> = ({
  socialLinks,
  memberName,
  publicEmail,
  variant = 'compact',
  className = ''
}) => {
  if (!socialLinks && !publicEmail) return null;

  // Filter only platforms that have a verified, non-empty, non-hash displayable URL
  const activePlatforms = PLATFORM_MAP.filter(platform => {
    const rawUrl = socialLinks?.[platform.id];
    return isDisplayableSocialUrl(rawUrl);
  });

  const hasDisplayableEmail = Boolean(publicEmail && publicEmail.trim().length > 0 && publicEmail.includes('@'));

  if (activePlatforms.length === 0 && !hasDisplayableEmail) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <span className="text-[10px] font-bold uppercase tracking-widest text-secondary block">
        Official Verified Channels
      </span>

      <div className="flex flex-wrap gap-2.5 items-center">
        {activePlatforms.map(platform => {
          const url = (socialLinks?.[platform.id] || '').trim();
          const IconComponent = platform.icon;
          const accessibleLabel = platform.ariaLabel(memberName);

          return (
            <a
              key={platform.id}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2.5 rounded-lg bg-surface-container text-on-surface-variant transition-all duration-200 border border-outline-variant flex items-center gap-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-secondary ${platform.colorClass} shadow-sm group`}
              aria-label={accessibleLabel}
              title={`${platform.name} — ${memberName}`}
            >
              <IconComponent className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
              <span>{platform.name}</span>
              <ExternalLink className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity ml-0.5" />
            </a>
          );
        })}

        {hasDisplayableEmail && (
          <a
            href={`mailto:${publicEmail!.trim()}`}
            className="p-2.5 rounded-lg bg-surface-container hover:bg-secondary hover:text-[#0a192f] text-on-surface-variant transition-colors border border-outline-variant flex items-center gap-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-secondary shadow-sm"
            aria-label={`Send an email to ${memberName}`}
            title={`Email: ${publicEmail}`}
          >
            <Mail className="w-4 h-4 shrink-0" />
            <span>Contact Directly</span>
          </a>
        )}
      </div>
    </div>
  );
};
