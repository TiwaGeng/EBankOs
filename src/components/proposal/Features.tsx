import Section from "./Section";
import { CalendarClock, BellRing, FileText, Filter, Download, Sparkles } from "lucide-react";

const features = [
  { icon: CalendarClock, title: "Payment Schedules", text: "Generate clear repayment plans for every loan, automatically." },
  { icon: BellRing, title: "Automatic SMS Reminders", text: "Reach clients on time, every time — reduce overdue payments." },
  { icon: FileText, title: "PDF Receipts", text: "Professional receipts generated instantly for every transaction." },
  { icon: Filter, title: "Advanced Filters", text: "Drill into clients, loans and transactions with powerful filters." },
  { icon: Download, title: "Export to Excel/PDF", text: "Take your data anywhere — clean exports in one click." },
  { icon: Sparkles, title: "Insights & Alerts", text: "Smart dashboard surfaces what needs attention right now." },
];

const Features = () => (
  <Section
    id="features"
    eyebrow="04 · Smart Features"
    title="Designed to save time and grow revenue"
    alt
  >
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map(({ icon: Icon, title, text }) => (
        <div key={title} className="flex gap-4 p-6 rounded-2xl bg-card border border-border shadow-soft hover:border-gold transition">
          <div className="shrink-0 h-11 w-11 rounded-xl bg-gradient-gold flex items-center justify-center text-gold-foreground shadow-gold">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

export default Features;