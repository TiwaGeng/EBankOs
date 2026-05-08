import { Landmark } from "lucide-react";

const links = [
  { href: "#overview", label: "Overview" },
  { href: "#roles", label: "Roles" },
  { href: "#modules", label: "Modules" },
  { href: "#features", label: "Features" },
  { href: "#reports", label: "Reports" },
  { href: "#security", label: "Security" },
  { href: "#database", label: "Database" },
  { href: "#future", label: "Future" },
];

const Nav = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-primary/80 border-b border-primary-glow/30">
    <div className="container flex h-16 items-center justify-between">
      <a href="#top" className="flex items-center gap-2 text-primary-foreground">
        <Landmark className="h-6 w-6 text-gold" />
        <span className="font-display text-lg font-bold tracking-wide">BankOS</span>
      </a>
      <ul className="hidden lg:flex items-center gap-7 text-sm text-primary-foreground/80">
        {links.map((l) => (
          <li key={l.href}>
            <a href={l.href} className="hover:text-gold transition-colors">{l.label}</a>
          </li>
        ))}
      </ul>
      <a href="#contact" className="hidden md:inline-flex items-center rounded-full bg-gradient-gold px-5 py-2 text-sm font-semibold text-gold-foreground shadow-gold hover:opacity-90 transition">
        Get Started
      </a>
    </div>
  </nav>
);

export default Nav;