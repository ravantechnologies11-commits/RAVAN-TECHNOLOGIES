/**
 * RAVAN TECHNOLOGIES — CORE SECURITY & SANITIZATION UTILITIES
 * 
 * Provides defense-in-depth sanitization for:
 * 1. URLs (anti-XSS, anti-open-redirect, dangerous protocol filtering)
 * 2. Text / HTML inputs (escaping dangerous markup)
 * 3. Form input validation (anti-spam, length boundaries, header injection defense)
 */

const DANGEROUS_PROTOCOLS = [
  'javascript:',
  'data:',
  'vbscript:',
  'file:',
  'about:',
  'blob:'
];

/**
 * Validates and sanitizes a URL before rendering in href or passing to navigation.
 * Disallows dangerous script/data protocols, backslash bypasses, and placeholder '#' links.
 * Returns empty string '' if URL is dangerous or invalid.
 */
export function sanitizeUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Prevent placeholder links
  if (trimmed === '#' || trimmed.startsWith('#')) return '';

  // Prevent backslash open redirect bypass (e.g. \example.com or /\example.com)
  if (trimmed.startsWith('\\') || trimmed.includes('/\\') || trimmed.includes('\\/')) {
    return '';
  }

  // Remove whitespace and control characters from protocol check
  const normalized = trimmed.replace(/[\x00-\x1F\x7F\s]+/g, '').toLowerCase();

  for (const protocol of DANGEROUS_PROTOCOLS) {
    if (normalized.startsWith(protocol)) {
      return '';
    }
  }

  // Allow safe mailto: links with basic email validation
  if (trimmed.toLowerCase().startsWith('mailto:')) {
    const emailPart = trimmed.substring(7).trim();
    if (/^[^\s@<>'"\\]+@[^\s@<>'"\\]+\.[^\s@<>'"\\]+/.test(emailPart)) {
      return trimmed;
    }
    return '';
  }

  // Allow safe tel: links with phone number validation
  if (trimmed.toLowerCase().startsWith('tel:')) {
    const phonePart = trimmed.substring(4).trim();
    if (/^[+0-9\s()-]{5,25}$/.test(phonePart)) {
      return trimmed;
    }
    return '';
  }

  // Allow relative paths (e.g. /about, /team/v-abishek)
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  // Check HTTP / HTTPS URLs
  let testUrl = trimmed;
  if (!/^https?:\/\//i.test(testUrl)) {
    testUrl = `https://${testUrl}`;
  }

  try {
    const parsed = new URL(testUrl);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return '';
    }
    // Must have a valid hostname containing a domain dot
    if (!parsed.hostname || !parsed.hostname.includes('.')) {
      return '';
    }
    return parsed.href;
  } catch {
    return '';
  }
}

/**
 * Checks whether a URL is strictly safe to open in a new tab.
 */
export function isSafeUrl(url?: string | null): boolean {
  return sanitizeUrl(url) !== '';
}

/**
 * Escapes HTML entities in untrusted text to prevent raw HTML execution.
 */
export function escapeHtml(str?: string | null): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Payload validation for Contact Inquiries
 */
export interface ContactSubmissionPayload {
  name: string;
  email: string;
  organization?: string;
  phone?: string;
  inquiry_type?: string;
  budget_range?: string;
  message: string;
}

export function validateContactPayload(payload: ContactSubmissionPayload): { valid: boolean; error?: string } {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'Invalid submission data.' };
  }

  const name = (payload.name || '').trim();
  const email = (payload.email || '').trim().toLowerCase();
  const message = (payload.message || '').trim();
  const organization = (payload.organization || '').trim();
  const phone = (payload.phone || '').trim();

  if (!name) return { valid: false, error: 'Name is required.' };
  if (name.length > 100) return { valid: false, error: 'Name exceeds maximum allowed length (100 characters).' };

  if (!email) return { valid: false, error: 'Email is required.' };
  if (email.length > 120) return { valid: false, error: 'Email exceeds maximum allowed length.' };

  // Strict email regex without control characters / CRLF
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(email) || email.includes('\r') || email.includes('\n')) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }

  if (!message) return { valid: false, error: 'Message is required.' };
  if (message.length > 5000) return { valid: false, error: 'Message exceeds maximum allowed length (5000 characters).' };
  if (message.length < 10) return { valid: false, error: 'Message must be at least 10 characters long.' };

  if (organization && organization.length > 120) {
    return { valid: false, error: 'Organization name exceeds maximum allowed length.' };
  }

  if (phone && phone.length > 30) {
    return { valid: false, error: 'Phone number exceeds maximum allowed length.' };
  }

  return { valid: true };
}
