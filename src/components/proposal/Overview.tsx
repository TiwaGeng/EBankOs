import Section from "./Section";
import { Building2, Users, Briefcase } from "lucide-react";

const items = [
  { icon: Building2, title: "Single Business System", text: "One unified platform for the whole organization — owner and employees on the same page." },
  { icon: Users, title: "Admin & Employees", text: "Owners hold full control while employees get scoped, role-based access." },
  { icon: Briefcase, title: "End-to-End Operations", text: "Clients, loans, payments, reports and accounting handled in one place." },
];

const Overview = () => (
  <Section
    id="overview"
    eyebrow="01 · System Overview"
    title="One platform for your entire lending business"
    description="A modern bank management system designed for owners and their teams to handle clients, loans, payments, reports and accounting efficiently."
  >
    <div className="grid md:grid-cols-3 gap-6">
      {items.map(({ icon: Icon, title, text }) => (
        <div key={title} className="group bg-gradient-card p-8 rounded-2xl border border-border shadow-soft hover:shadow-elegant hover:-translate-y-1 transition-all duration-300">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-gold mb-5 group-hover:bg-gradient-gold group-hover:text-gold-foreground transition">
            <Icon className="h-6 w-6" />
          </div>
          <h3 className="font-display text-xl font-bold mb-2">{title}</h3>
          <p className="text-muted-foreground leading-relaxed">{text}</p>
        </div>
      ))}
    </div>
  </Section>
);

export default Overview;