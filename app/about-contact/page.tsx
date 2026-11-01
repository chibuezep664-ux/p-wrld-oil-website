import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ArrowUpRight, BriefcaseBusiness, Globe2, Mail, Phone } from 'lucide-react';
import { EnquiryForm } from '@/components/enquiry-form';
import { WhatsAppButton } from '@/components/whatsapp-button';
import { CONTACT_EMAIL } from '@/lib/company';

export const metadata: Metadata = {
  title: 'About & Contact',
  description: 'Learn about P-WRLD OIL and submit a petroleum, industrial products or automotive parts quotation enquiry.',
};

export default function AboutContact() {
  return (
    <>
      <section className="page-hero about-hero">
        <div className="section-label">P-WRLD OIL / ABOUT & CONTACT</div>
        <h1>Experience meets<br /><em>your next enquiry.</em></h1>
        <p>Seven years of business experience in petroleum, industrial product, and automotive parts enquiries.</p>
        <div className="market-pills">
          <span><Globe2 size={16} /> Chicago</span>
          <span><Globe2 size={16} /> International European markets</span>
        </div>
      </section>

      <section className="about-story section-wrap">
        <div>
          <span className="section-label">OUR BUSINESS</span>
          <h2>Built around<br /><em>the conversation.</em></h2>
        </div>
        <div>
          <p>P-WRLD OIL works with enquiries related to petroleum and transportation fuels, industrial petroleum products, and automotive spare parts. Each request is reviewed individually before quotation requirements are discussed.</p>
          <p>Our business markets include Chicago and international European markets, as provided by the company. Product scope, destination, specifications, and arrangements depend on each enquiry and are confirmed directly.</p>
          <p>We do not publish unverified prices, inventory, delivery timelines, addresses, certifications, or infrastructure claims.</p>
          <div className="about-facts">
            <div><strong>7</strong><span>Years of business experience</span></div>
            <div><strong>3</strong><span>Product enquiry areas</span></div>
          </div>
        </div>
      </section>

      <section className="contact-details">
        <div className="section-wrap contact-details-inner">
          <div>
            <span className="section-label">DIRECT CONTACT</span>
            <h2>Reach out<br /><em>your way.</em></h2>
            <p>For quotation requests, include the product category, quantity if known, destination, and any relevant requirements.</p>
          </div>
          <div className="contact-card">
            <a href="tel:+2347089889525"><Phone /><span><small>TELEPHONE & WHATSAPP</small><strong>+2347089889525</strong></span><ArrowUpRight /></a>
            <a href={`mailto:${CONTACT_EMAIL}`}><Mail /><span><small>EMAIL</small><strong>{CONTACT_EMAIL}</strong></span><ArrowUpRight /></a>
            <WhatsAppButton message="Hello P-WRLD OIL, I would like to make a product or quotation enquiry." label="Start WhatsApp enquiry" />
          </div>
        </div>
      </section>

      <section className="quote-section section-wrap" id="quote">
        <div className="quote-heading">
          <span className="section-label">START AN ENQUIRY</span>
          <h2>Tell us what<br /><em>you have in mind.</em></h2>
          <p>Fields marked with * are required. If exact product specifications are not available, share what you know.</p>
          <div className="quote-help">
            <BriefcaseBusiness />
            <p>For parts, include vehicle make, model, year, and part requirements. For bulk fuel, include volume and destination.</p>
          </div>
        </div>
        <div className="quote-form-wrap">
          <Suspense fallback={<p>Loading enquiry form…</p>}>
            <EnquiryForm />
          </Suspense>
        </div>
      </section>
    </>
  );
}
