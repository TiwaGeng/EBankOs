import Section from "./Section";
import { CheckCircle2 } from "lucide-react";

const reports = [
  "Daily Report",
  "Clients Not Paid",
  "Clients With Loans",
  "Clients Without Loans",
  "All Loans",
  "Complicated Loans",
  "Renewed Loans",
];

const Reports = () => (
  <Section
    id="reports"
    eyebrow="05 · Reports"
    title="Every report you need to run a healthy book"
    description="Built-in reports give the owner total visibility — from daily activity to risky loans."
  >
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl">
      {reports.map((r) => (
        <div key={r} className="flex items-center gap-3 p-4 rounded-xl bg-gradient-card border border-border shadow-soft hover:bg-primary hover:text-primary-foreground transition group">
          <CheckCircle2 className="h-5 w-5 text-gold group-hover:text-gold" />
          <span className="font-medium">{r}</span>
        </div>
      ))}
    </div>
  </Section>
);

export default Reports;