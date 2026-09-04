import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { WorkWithUsModal } from '../common/WorkWithUsModal';
import { BrandLogo } from '../common/BrandLogo';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [ecosystemDropdownOpen, setEcosystemDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setEcosystemDropdownOpen(false);
  }, [location.pathname]);

  const handleDropdownMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setEcosystemDropdownOpen(true);
  };

  const handleDropdownMouseLeave = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    dropdownTimeoutRef.current = setTimeout(() => {
      setEcosystemDropdownOpen(false);
    }, 200);
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  interface HeaderLink {
    title: string;
    path: string;
    badge?: string;
  }

  const desktopMainLinks: HeaderLink[] = [
    { title: 'Home', path: '/' },
    { title: 'About', path: '/about' },
    { title: 'Services', path: '/services' },
    { title: 'Solutions', path: '/solutions' },
    { title: 'Hackathons', path: '/hackathons', badge: 'VOL IV' },
    { title: 'Learning', path: '/learning' },
    { title: 'Projects', path: '/projects' },
  ];

  const desktopSecondaryLinks: HeaderLink[] = [
    { title: 'Team', path: '/team' },
    { title: 'Contact', path: '/contact' }
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-surface/95 backdrop-blur-xl border-b border-outline-variant shadow-sm py-2.5'
            : 'bg-surface/90 backdrop-blur-md border-b border-outline-variant/60 py-3.5'
        }`}
      >
        <div className="max-w-container-max mx-auto px-gutter flex items-center justify-between gap-4">
          {/* Centralized Dynamic Logo */}
          <Link to="/" className="shrink-0">
            <BrandLogo variant="navbar" />
          </Link>

          {/* Desktop Navigation (Strictly Non-Wrapping & Smooth Dropdown Bridge) */}
          <nav className="hidden xl:flex items-center gap-3.5 2xl:gap-5.5 shrink-0">
            {desktopMainLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-[11px] 2xl:text-xs uppercase tracking-wider font-semibold transition-colors py-2 px-1 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  isActive(link.path)
                    ? 'text-primary border-b-2 border-secondary font-bold'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <span className="whitespace-nowrap">{link.title}</span>
                {link.badge && (
                  <span className="px-1.5 py-0.2 bg-secondary text-[#0a192f] text-[9px] font-extrabold rounded whitespace-nowrap shrink-0">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}

            {/* Robust Ecosystem Dropdown with seamless hover bridge & timeout buffer */}
            <div
              className="relative shrink-0 py-2"
              onMouseEnter={handleDropdownMouseEnter}
              onMouseLeave={handleDropdownMouseLeave}
            >
              <button
                type="button"
                onClick={() => setEcosystemDropdownOpen(prev => !prev)}
                className={`text-[11px] 2xl:text-xs uppercase tracking-wider font-semibold transition-colors flex items-center gap-1 px-1 whitespace-nowrap shrink-0 ${
                  isActive('/ecosystem') || ecosystemDropdownOpen
                    ? 'text-primary font-bold'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <span className="whitespace-nowrap">Ecosystem</span>
                <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${ecosystemDropdownOpen ? 'rotate-180 text-primary' : ''}`} />
              </button>

              {/* Dropdown Container (Directly attached with invisible hover bridge) */}
              {ecosystemDropdownOpen && (
                <div
                  className="absolute top-full left-0 pt-1.5 w-64 z-50"
                  onMouseEnter={handleDropdownMouseEnter}
                  onMouseLeave={handleDropdownMouseLeave}
                >
                  <div className="bg-surface border border-outline-variant rounded-xl shadow-2xl py-2 overflow-hidden backdrop-blur-xl">
                    <Link
                      to="/ecosystem"
                      onClick={() => setEcosystemDropdownOpen(false)}
                      className="block px-4 py-2.5 text-xs font-bold text-primary hover:bg-surface-container transition-colors whitespace-nowrap"
                    >
                      All Ecosystem Overview
                    </Link>
                    <div className="h-px bg-outline-variant/60 my-1"></div>
                    <Link
                      to="/ecosystem#tech-park"
                      onClick={() => setEcosystemDropdownOpen(false)}
                      className="block px-4 py-2 text-xs text-on-surface hover:bg-surface-container hover:text-primary transition-colors whitespace-nowrap"
                    >
                      Ravan Tech Park (R&D)
                    </Link>
                    <Link
                      to="/ecosystem#film-studio"
                      onClick={() => setEcosystemDropdownOpen(false)}
                      className="block px-4 py-2 text-xs text-on-surface hover:bg-surface-container hover:text-primary transition-colors whitespace-nowrap"
                    >
                      Ravan Film Studio (Media)
                    </Link>
                    <Link
                      to="/gallery"
                      onClick={() => setEcosystemDropdownOpen(false)}
                      className="block px-4 py-2 text-xs text-on-surface hover:bg-surface-container hover:text-primary transition-colors whitespace-nowrap"
                    >
                      Campus & Production Gallery
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {desktopSecondaryLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-[11px] 2xl:text-xs uppercase tracking-wider font-semibold transition-colors py-2 px-1 whitespace-nowrap shrink-0 ${
                  isActive(link.path)
                    ? 'text-primary border-b-2 border-primary font-bold'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <span className="whitespace-nowrap">{link.title}</span>
              </Link>
            ))}
          </nav>

          {/* Desktop Right CTA */}
          <div className="hidden xl:flex items-center shrink-0">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 border-[1.5px] border-secondary text-secondary font-semibold text-xs tracking-widest rounded uppercase hover:bg-secondary-container hover:text-on-secondary-container transition-all shadow-sm whitespace-nowrap shrink-0"
            >
              WORK WITH US
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex xl:hidden items-center gap-3 shrink-0">
            <button
              onClick={() => setIsModalOpen(true)}
              className="hidden sm:inline-flex px-3.5 py-1.5 border border-secondary text-secondary font-semibold text-[10px] tracking-wider rounded uppercase hover:bg-secondary-container transition-colors whitespace-nowrap"
            >
              WORK WITH US
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded hover:bg-surface-container transition-colors text-primary shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 shrink-0" /> : <Menu className="w-6 h-6 shrink-0" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-surface border-b border-outline-variant px-gutter py-6 shadow-2xl max-h-[85vh] overflow-y-auto animate-fade-in" style={{ touchAction: 'manipulation' }}>
            <div className="flex flex-col gap-3.5">
              {[...desktopMainLinks, ...desktopSecondaryLinks].map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-semibold uppercase tracking-wider py-1.5 flex items-center justify-between whitespace-nowrap transition-colors ${
                    isActive(link.path)
                      ? 'text-primary font-bold border-l-2 border-secondary pl-2.5'
                      : 'text-on-surface-variant hover:text-primary pl-2.5'
                  }`}
                >
                  <span className="whitespace-nowrap">{link.title}</span>
                  {link.badge && (
                    <span className="px-2 py-0.5 bg-secondary text-[#0a192f] text-[10px] font-extrabold rounded whitespace-nowrap">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}

              <div className="h-px bg-outline-variant my-2"></div>
              
              <Link
                to="/ecosystem"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold uppercase tracking-wider text-on-surface-variant whitespace-nowrap py-1"
              >
                Ecosystem Overview
              </Link>
              <Link
                to="/ecosystem#tech-park"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold uppercase tracking-wider text-on-surface-variant pl-4 whitespace-nowrap py-1"
              >
                • Ravan Tech Park
              </Link>
              <Link
                to="/ecosystem#film-studio"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold uppercase tracking-wider text-on-surface-variant pl-4 whitespace-nowrap py-1"
              >
                • Ravan Film Studio
              </Link>
              <Link
                to="/gallery"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold uppercase tracking-wider text-on-surface-variant pl-4 whitespace-nowrap py-1"
              >
                • Campus Gallery
              </Link>
              <Link
                to="/founder"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold uppercase tracking-wider text-secondary whitespace-nowrap py-1"
              >
                Meet the Founder
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsModalOpen(true);
                }}
                className="w-full mt-4 py-3 bg-primary text-white rounded font-semibold text-xs tracking-widest uppercase text-center shadow whitespace-nowrap"
              >
                WORK WITH US
              </button>
            </div>
          </div>
        )}
      </header>

      <WorkWithUsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
