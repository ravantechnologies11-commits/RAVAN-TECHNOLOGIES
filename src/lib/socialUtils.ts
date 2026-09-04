export type SupportedPlatformId = 
  | 'linkedin' 
  | 'youtube' 
  | 'instagram' 
  | 'twitter' 
  | 'github' 
  | 'facebook' 
  | 'whatsapp'
  | 'website';

export interface SocialPlatformConfig {
  id: SupportedPlatformId;
  name: string;
  placeholder: string;
  domainHint: string;
}

export const SUPPORTED_SOCIAL_PLATFORMS: SocialPlatformConfig[] = [
  { id: 'instagram', name: 'Instagram', placeholder: 'https://instagram.com/...', domainHint: 'instagram.com' },
  { id: 'linkedin', name: 'LinkedIn', placeholder: 'https://linkedin.com/in/... or /company/...', domainHint: 'linkedin.com' },
  { id: 'youtube', name: 'YouTube', placeholder: 'https://youtube.com/@channel or /c/...', domainHint: 'youtube.com' },
  { id: 'facebook', name: 'Facebook', placeholder: 'https://facebook.com/...', domainHint: 'facebook.com' },
  { id: 'twitter', name: 'Twitter / X', placeholder: 'https://x.com/... or https://twitter.com/...', domainHint: 'x.com / twitter.com' },
  { id: 'github', name: 'GitHub', placeholder: 'https://github.com/...', domainHint: 'github.com' },
  { id: 'whatsapp', name: 'WhatsApp', placeholder: 'https://wa.me/91... or direct phone number', domainHint: 'wa.me or whatsapp.com' },
  { id: 'website', name: 'Official Website', placeholder: 'https://...', domainHint: 'website domain' }
];

/**
 * Validates a social URL for safety and correctness.
 * - Allows empty strings (representing the removal of a social link).
 * - Disallows dangerous protocols (javascript:, data:, vbscript:, file:).
 * - Disallows placeholder '#' links.
 * - Requires valid HTTP/HTTPS protocol and fully-qualified hostname.
 */
export function validateSocialUrl(url?: string): { valid: boolean; error?: string; cleanUrl: string } {
  if (!url || typeof url !== 'string') {
    return { valid: true, cleanUrl: '' };
  }
  
  const trimmed = url.trim();
  if (!trimmed) {
    return { valid: true, cleanUrl: '' };
  }

  // Reject placeholder "#" links
  if (trimmed === '#' || trimmed.startsWith('#')) {
    return {
      valid: false,
      error: 'Placeholder "#" links are not allowed. Please enter a valid URL or leave empty to remove.',
      cleanUrl: ''
    };
  }

  const lower = trimmed.toLowerCase();
  // Reject dangerous protocols
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:') ||
    lower.startsWith('about:')
  ) {
    return {
      valid: false,
      error: 'Security alert: Dangerous script or data URI protocol detected.',
      cleanUrl: ''
    };
  }

  // Handle phone numbers / WhatsApp direct numbers (+91..., 91987...)
  const digitsOnly = trimmed.replace(/\D/g, '');
  if ((trimmed.startsWith('+') || /^\d{7,15}$/.test(digitsOnly)) && !trimmed.includes('.') && !trimmed.includes('/')) {
    return { valid: true, cleanUrl: `https://wa.me/${digitsOnly}` };
  }

  // Check whether protocol is present
  let testUrl = trimmed;
  if (!/^https?:\/\//i.test(testUrl)) {
    testUrl = `https://${testUrl}`;
  }

  try {
    const parsed = new URL(testUrl);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return {
        valid: false,
        error: 'Only HTTP and HTTPS web URLs are permitted.',
        cleanUrl: ''
      };
    }
    if (!parsed.hostname || !parsed.hostname.includes('.')) {
      return {
        valid: false,
        error: 'Please specify a complete domain name (e.g. youtube.com/@channel).',
        cleanUrl: ''
      };
    }
    return { valid: true, cleanUrl: parsed.href };
  } catch {
    return {
      valid: false,
      error: 'Malformed URL syntax. Please enter a valid web URL.',
      cleanUrl: ''
    };
  }
}

/**
 * Helper to check whether a given social URL is valid and displayable.
 */
export function isDisplayableSocialUrl(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed === '#' || trimmed.startsWith('#')) return false;
  const lower = trimmed.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}
