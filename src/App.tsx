import React, { Suspense, lazy } from 'react';
import { RouteLoadingSkeleton } from './components/common/RouteLoadingSkeleton';

// Code-split both applications so public visitors never fetch or evaluate admin bundles
const AppPublic = lazy(() => import('./AppPublic').then(m => ({ default: m.AppPublic })));
const AppAdmin = lazy(() => import('./AppAdmin').then(m => ({ default: m.AppAdmin })));

/**
 * Determines whether the current deployment or window environment should serve
 * the dedicated Admin CMS application or the Public Website.
 * 
 * Rules:
 * 1. Build-time or deployment environment variable (VITE_APP_MODE):
 *    - VITE_APP_MODE === 'admin' -> Dedicated Admin CMS
 *    - VITE_APP_MODE === 'public' -> Public Website
 * 
 * 2. Dedicated Production or Staging CMS domains:
 *    - cms.ravantechnologies.com -> Dedicated Admin CMS
 *    - Any domain starting with 'cms.' or 'admin.' -> Dedicated Admin CMS
 * 
 * 3. Temporary / Staging Vercel Admin deployments:
 *    - Any Vercel deployment domain containing 'admin' (e.g. ravan-technologies-admin.vercel.app) -> Dedicated Admin CMS
 * 
 * 4. Local Development Support:
 *    - On localhost (127.0.0.1 or localhost), if path starts with /admin or query ?mode=admin -> Serves Admin CMS
 * 
 * 5. Default:
 *    - Public Website (e.g. ravan-technologies-i99k.vercel.app or ravantechnologies.com) -> Serves Public Website
 *    - On the public website, /admin strictly renders 404 (NotFoundPage)
 */
export function isAdminDeployment(): boolean {
  // 1. Explicit deployment environment variable
  const appMode = import.meta.env.VITE_APP_MODE;
  if (appMode === 'admin') return true;
  if (appMode === 'public') return false;

  if (typeof window === 'undefined') return false;

  const hostname = window.location.hostname.toLowerCase();

  // 2. Authoritative production CMS subdomains
  if (hostname === 'cms.ravantechnologies.com') return true;
  if (hostname.startsWith('cms.') || hostname.startsWith('admin.')) return true;

  // 3. Vercel deployment domain for admin project (e.g. ravan-technologies-admin.vercel.app)
  if (hostname.includes('admin')) return true;

  // 4. Localhost development: allow testing admin when accessing /admin directly
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.localhost');
  if (isLocalhost && (window.location.pathname.startsWith('/admin') || window.location.search.includes('mode=admin'))) {
    return true;
  }

  // 5. Default to Public Website
  return false;
}

export const App: React.FC = () => {
  const isAdmin = isAdminDeployment();

  return (
    <Suspense fallback={<RouteLoadingSkeleton />}>
      {isAdmin ? <AppAdmin /> : <AppPublic />}
    </Suspense>
  );
};
