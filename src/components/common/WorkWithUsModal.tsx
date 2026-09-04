import React, { useState } from 'react';
import { X, Send, CheckCircle2, ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import { dataService } from '../../lib/dataService';
import { useToast } from '../../context/ToastContext';

interface WorkWithUsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultInquiryType?: string;
}

export const WorkWithUsModal: React.FC<WorkWithUsModalProps> = ({
  isOpen,
  onClose,
  defaultInquiryType = 'Enterprise Engineering'
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    phone: '',
    inquiry_type: defaultInquiryType as any,
    budget_range: '$50k - $100k',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await dataService.submitEnquiry(formData);
      setSubmittedRef(res.reference_id);
      showToast(`Inquiry registered successfully. Reference: ${res.reference_id}`, 'success');
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
      showToast('Submission failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmittedRef(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-body">
      <div 
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-surface border border-outline-variant rounded-2xl shadow-2xl p-6 md:p-8 overflow-y-auto max-h-[90vh]"
      >
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant hover:text-primary"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedRef ? (
          <div className="py-8 flex flex-col items-center text-center gap-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-secondary/10 border-2 border-secondary flex items-center justify-center text-secondary">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold font-display text-primary tracking-tight">
              Inquiry Registered Successfully
            </h3>
            <p className="text-sm text-on-surface-variant max-w-md leading-relaxed">
              Thank you for contacting Ravan Technologies. Your specifications have been routed to our enterprise engineering team.
            </p>

            <div className="p-4 bg-surface-container-lowest rounded-xl border border-secondary/40 text-center max-w-sm w-full shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                Official Reference ID
              </div>
              <div className="text-xl font-bold font-mono text-secondary">
                {submittedRef}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-on-surface-variant bg-surface-container px-4 py-2 rounded-lg">
              <Mail className="w-4 h-4 text-secondary shrink-0" />
              <span>A confirmation email has been dispatched to your address.</span>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="mt-4 px-8 py-3 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-primary-container transition-colors shadow"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span className="text-xs font-semibold uppercase tracking-widest text-secondary">INITIATE ENGAGEMENT</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold font-display text-primary mb-2 tracking-tight">
              Work With Ravan Technologies
            </h3>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              Connect with our enterprise engineering and AI architects to discuss project requirements, partnerships, or ecosystem access.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                    Your Full Name <span className="text-secondary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Executive Contact"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-primary text-sm focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                    Official Work Email <span className="text-secondary">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. partner@enterprise.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-primary text-sm focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                    Organization / Company
                  </label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={e => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="e.g. Sovereign Global Labs"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-primary text-sm focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                    Direct Telephone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 019-2834"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-primary text-sm focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                    Engagement Scope <span className="text-secondary">*</span>
                  </label>
                  <select
                    value={formData.inquiry_type}
                    onChange={e => setFormData({ ...formData, inquiry_type: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-primary text-sm focus:border-secondary outline-none transition-all"
                  >
                    <option value="Enterprise Engineering">Enterprise Engineering</option>
                    <option value="Applied AI & ML">Applied AI & ML</option>
                    <option value="Tech Park Lease">Ravan Tech Park Lease</option>
                    <option value="Film Studio">Ravan Film Studio</option>
                    <option value="Hackathon Partnership">Hackathon Partnership</option>
                    <option value="Other">Other Strategic Initiative</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                    Anticipated Budget / Scale
                  </label>
                  <select
                    value={formData.budget_range}
                    onChange={e => setFormData({ ...formData, budget_range: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-primary text-sm focus:border-secondary outline-none transition-all"
                  >
                    <option value="Under $50k">Under $50,000</option>
                    <option value="$50k - $100k">$50,000 – $100,000</option>
                    <option value="$100k - $250k">$100,000 – $250,000</option>
                    <option value="$250k+">$250,000+ (Enterprise Custom)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                  Project Specifications & Requirements <span className="text-secondary">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Outline key deliverables, concurrency expectations, and target timeline..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-primary text-sm focus:border-secondary outline-none transition-all leading-relaxed"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-secondary" />
                  <span>{isSubmitting ? 'SUBMITTING INQUIRY...' : 'SUBMIT DIRECTIVE SPECIFICATIONS'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
