import { Landmark, Mail, Phone } from "lucide-react";

const Footer = () => (
  <footer id="contact" className="bg-gradient-hero text-primary-foreground">
    <div className="container py-20 grid md:grid-cols-3 gap-10">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Landmark className="h-6 w-6 text-gold" />
          <span className="font-display text-xl font-bold">BankOS</span>
        </div>
        <p className="text-primary-foreground/70 text-sm leading-relaxed max-w-xs">
          A modern bank management system — built for owners who want clarity, control, and growth.
        </p>
      </div>
      <div>
        <h4 className="font-display text-lg font-bold mb-4 text-gold">Get in touch</h4>
        <ul className="space-y-3 text-sm text-primary-foreground/80">
          <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-gold" /> contact@bankos.app</li>
          <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-gold" /> +000 000 000</li>
        </ul>
      </div>
      <div className="md:text-right">
        <a href="#top" className="inline-flex items-center rounded-full bg-gradient-gold px-6 py-3 font-semibold text-gold-foreground shadow-gold hover:scale-105 transition">
          Back to top
        </a>
      </div>
    </div>
    <div className="border-t border-primary-foreground/10 py-5">
      <p className="container text-xs text-primary-foreground/50">© 2026 BankOS · Modern Bank Management System Proposal</p>
    </div>
  </footer>
);

export default Footer;