import React from 'react';
import { ArrowRight } from 'lucide-react';

interface CTASectionProps {
  onOpenModal: () => void;
}

export const CTASection: React.FC<CTASectionProps> = ({ onOpenModal }) => {
  return (
    <section className="py-28 bg-surface text-center border-t border-outline-variant/60 relative overflow-hidden">
      <div className="max-w-3xl mx-auto px-gutter relative z-10">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-secondary" />
          <span className="text-xs font-semibold uppercase tracking-widest text-secondary">
            INITIATE ENGAGEMENT
          </span>
        </div>

        <h2 className="text-4xl md:text-6xl font-bold font-display text-primary mb-6 tracking-tight">
          Ready to architect the future?
        </h2>

        <p className="text-base md:text-lg font-body text-on-surface-variant mb-10 leading-relaxed max-w-2xl mx-auto">
          Engage with our engineering team to discuss enterprise architecture, sovereign AI deployment, or partnership opportunities within the Ravan ecosystem.
        </p>

        <button
          onClick={onOpenModal}
          className="inline-flex items-center justify-center px-10 py-5 bg-primary text-white rounded font-semibold text-xs tracking-widest uppercase hover:bg-primary-container hover:shadow-2xl transition-all duration-300 shadow-md gap-3 group"
        >
          <span>INITIATE CONTACT</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  );
};
