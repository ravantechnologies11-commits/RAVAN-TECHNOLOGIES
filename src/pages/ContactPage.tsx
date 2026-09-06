import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { SEOHead } from '../components/common/SEOHead';
import { dataService } from '../lib/dataService';
import { useToast } from '../context/ToastContext';
import { Mail, Phone, MapPin, Send, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';

import { SiteSettings } from '../types';

export const ContactPage: React.FC = () => {
  const { showToast } = useToast();
  const [site, setSite] = useState<SiteSettings>(() => dataService.getSiteSettingsSync());
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    phone: '',
    inquiry_type: 'Enterprise Engineering' as any,
    budget_range: '$50k - $100k',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    dataService.getSiteSettings().then(st => {
      if (isMounted && st) setSite(st);
    }).catch(() => {});

    const unsubscribe = dataService.subscribeToUpdates((entity, data) => {
      if (!isMounted) return;
      if (!entity || entity === 'site_settings' || entity === 'site') {
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          setSite(data);
        } else {
          dataService.getSiteSettings(true).then(st => {
            if (isMounted && st) setSite(st);
          });
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      showToast('Please complete all required fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await dataService.submitEnquiry(formData);
      setSubmittedRef(res.reference_id);
      showToast(`Inquiry successfully submitted. Reference: ${res.reference_id}`, 'success');
      setFormData({
        name: '',
        email: '',
        organization: '',
        phone: '',
        inquiry_type: 'Enterprise Engineering',
        budget_range: '$50k - $100k',
        message: ''
      });
    } catch {
      showToast('Failed to submit. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactEmail = site?.contact_email || 'ravantechnologies11@gmail.com';
  const contactPhone = site?.contact_phone || '';
  const officeAddress = site?.hq_location || site?.office_address || 'Thiruvannamalai, Tamil Nadu, India';

  return (
    <Layout>
      <SEOHead 
        title="Contact Us & Business Inquiries — Ravan Technologies"
        description="Initiate an engagement with our engineering team for enterprise software, AI/ML solutions, and ecosystem partnerships."
        canonical="/contact"
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Contact Us", path: "/contact" }]}
      />

      <section className="max-w-container-max mx-auto px-gutter pt-24 pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Details */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-secondary">
                  INITIATE CONTACT
                </span>
                <div className="h-[1px] w-12 bg-secondary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-display text-primary mb-6 leading-tight">
                Engage With Our Engineering Team.
              </h1>
              <p className="text-base text-on-surface-variant leading-relaxed mb-10">
                Whether you require bespoke enterprise architecture, on-premise AI model deployment, hackathon organization, or campus space at Ravan Tech Park, our team is ready.
              </p>

              <div className="space-y-6 text-sm">
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-secondary flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-bold text-primary">Headquarters & Tech Park</div>
                    <div className="text-on-surface-variant">{officeAddress}</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Mail className="w-5 h-5 text-secondary flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-bold text-primary">Direct Inquiries</div>
                    <a href={`mailto:${contactEmail}`} className="text-on-surface-variant hover:text-primary transition-colors">
                      {contactEmail}
                    </a>
                  </div>
                </div>

                {contactPhone && (
                  <div className="flex items-start gap-4">
                    <Phone className="w-5 h-5 text-secondary flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-bold text-primary">Telephone & Operations</div>
                      <a href={`tel:${contactPhone.replace(/[^0-9+]/g, '')}`} className="text-on-surface-variant hover:text-primary transition-colors">
                        {contactPhone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-surface-container rounded-xl border border-outline-variant mt-10">
              <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                Enterprise Response SLA
              </div>
              <div className="text-xs text-on-surface-variant">
                All submitted directives receive architectural triage and direct acknowledgment within 1 business day.
              </div>
            </div>
          </div>

          {/* Form / Confirmation Column */}
          <div className="lg:col-span-7">
            <div className="p-8 md:p-10 bg-surface rounded-2xl border border-outline-variant shadow-lg">
              {submittedRef ? (
                <div className="py-12 flex flex-col items-center text-center gap-4 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-secondary/10 border-2 border-secondary flex items-center justify-center text-secondary">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-bold font-display text-primary tracking-tight">
                    Inquiry Received
                  </h2>
                  <p className="text-sm text-on-surface-variant max-w-md leading-relaxed">
                    Your inquiry has been successfully stored in our database. An enterprise architect has been notified.
                  </p>

                  <div className="p-5 bg-surface-container-lowest rounded-xl border border-secondary/40 text-center max-w-sm w-full shadow-sm my-2">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                      Official Reference ID
                    </div>
                    <div className="text-2xl font-bold font-mono text-secondary">
                      {submittedRef}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-on-surface-variant bg-surface-container px-4 py-2 rounded-lg">
                    <Mail className="w-4 h-4 text-secondary shrink-0" />
                    <span>A confirmation email has been dispatched with full directive details.</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSubmittedRef(null)}
                    className="mt-6 px-8 py-3 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-primary-container transition-colors shadow"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold font-display text-primary mb-2">
                      Direct Engagement Form
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      Fields marked with <span className="text-secondary">*</span> are required.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                        Full Name <span className="text-secondary">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Executive Contact"
                        className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-primary text-sm focus:border-secondary outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                        Work Email <span className="text-secondary">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. vikram@organization.com"
                        className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-primary text-sm focus:border-secondary outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                        Organization / Entity
                      </label>
                      <input
                        type="text"
                        value={formData.organization}
                        onChange={e => setFormData({ ...formData, organization: e.target.value })}
                        placeholder="e.g. Global Distributed Systems"
                        className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-primary text-sm focus:border-secondary outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                        Direct Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-primary text-sm focus:border-secondary outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                        Inquiry Scope <span className="text-secondary">*</span>
                      </label>
                      <select
                        value={formData.inquiry_type}
                        onChange={e => setFormData({ ...formData, inquiry_type: e.target.value as any })}
                        className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-primary text-sm focus:border-secondary outline-none transition-colors"
                      >
                        <option value="Enterprise Engineering">Enterprise Engineering</option>
                        <option value="Applied AI & ML">Applied AI & ML</option>
                        <option value="Tech Park Lease">Ravan Tech Park Space</option>
                        <option value="Film Studio">Ravan Film Studio</option>
                        <option value="Hackathon Partnership">Hackathon Partnership</option>
                        <option value="Other">Other Strategic Directive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                        Anticipated Capital / Scale
                      </label>
                      <select
                        value={formData.budget_range}
                        onChange={e => setFormData({ ...formData, budget_range: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-primary text-sm focus:border-secondary outline-none transition-colors"
                      >
                        <option value="Under $50k">Under $50,000</option>
                        <option value="$50k - $100k">$50,000 – $100,000</option>
                        <option value="$100k - $250k">$100,000 – $250,000</option>
                        <option value="$250k+">$250,000+ (Enterprise Scale)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                      Directive Requirements & Message <span className="text-secondary">*</span>
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Detail your architecture mandate, required integrations, and timeline..."
                      className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-primary text-sm focus:border-secondary outline-none transition-colors leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    <Send className="w-4 h-4 text-secondary" />
                    <span>{isSubmitting ? 'DISPATCHING DIRECTIVE...' : 'SUBMIT INQUIRY'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};
