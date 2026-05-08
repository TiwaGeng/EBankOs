import Section from "./Section";
import { Crown, Calculator, FileSearch, Eye } from "lucide-react";

const roles = [
  { icon: Crown, name: "Admin (Owner)", access: "Full access", desc: "Complete control over every module, employee and configuration." },
  { icon: FileSearch, name: "Loan Officer", access: "Restricted", desc: "Manage loans: give, renew, collect payments, add fines." },
  { icon: Calculator, name: "Accountant", access: "Restricted", desc: "Handle transactions, expenses, reports and reconciliation." },
  { icon: Eye, name: "Viewer", access: "Read-only", desc: "Browse data and reports without making any changes." },
];

const Roles = () => (
  <Section
    id="roles"
    eyebrow="02 · User Roles"
    title="Role-based access for every team member"
    description="The system separates duties cleanly so every employee sees only what they need."
    alt
  >
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {roles.map(({ icon: Icon, name, access, desc }) => (
        <div key={name} className="bg-card p-6 rounded-2xl border border-border shadow-soft hover:border-gold transition">
          <Icon className="h-7 w-7 text-gold mb-4" />
          <h3 className="font-display text-lg font-bold">{name}</h3>
          <p className="text-xs uppercase tracking-wider text-primary mb-3 font-semibold">{access}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
        </div>
      ))}
    </div>
  </Section>
);

export default Roles;