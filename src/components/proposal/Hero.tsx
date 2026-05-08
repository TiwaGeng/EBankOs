import heroImg from "@/assets/hero-bank.jpg";
import Nav from "./Nav";
import { ArrowRight, ShieldCheck } from "lucide-react";

const Hero = () => (
  <header id="top" className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
    <Nav />
    <div className="container relative grid lg:grid-cols-2 gap-12 items-center pt-32 pb-24 lg:pt-40 lg:pb-32">
      <div className="space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-medium text-gold">
          <ShieldCheck className="h-3.5 w-3.5" /> Business Proposal · 2026
        </div>
        <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight">
          Modern Bank <span className="text-gold">Management</span> System
        </h1>
        <p className="text-lg text-primary-foreground/80 max-w-xl leading-relaxed">
          A complete, secure, and intelligent platform to manage clients, loans,
          payments, reports and accounting — built for owners and their teams.
        </p>
        <div className="flex flex-wrap gap-4">
          <a href="#overview" className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-7 py-3 font-semibold text-gold-foreground shadow-gold hover:scale-105 transition-transform">
            Explore the Design <ArrowRight className="h-4 w-4" />
          </a>
          <a href="#modules" className="inline-flex items-center rounded-full border border-primary-foreground/30 px-7 py-3 font-medium text-primary-foreground hover:bg-primary-foreground/10 transition">
            View Modules
          </a>
        </div>
        <dl className="grid grid-cols-3 gap-6 pt-6 max-w-md">
          {[
            { k: "12", v: "Sections" },
            { k: "9", v: "Core Modules" },
            { k: "100%", v: "Role-based" },
          ].map((s) => (
            <div key={s.v}>
              <dt className="font-display text-3xl font-bold text-gold">{s.k}</dt>
              <dd className="text-xs uppercase tracking-wider text-primary-foreground/60">{s.v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="relative">
        <div className="absolute -inset-6 bg-gradient-gold opacity-20 blur-3xl rounded-full" />
        <img
          src={heroImg}
          alt="Bank management dashboard preview"
          width={1536}
          height={1024}
          className="relative rounded-2xl shadow-elegant border border-primary-glow/30"
        />
      </div>
    </div>
  </header>
);

export default Hero;