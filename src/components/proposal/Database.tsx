import Section from "./Section";
import { Database as DbIcon } from "lucide-react";

const tables = ["Users", "Roles", "Clients", "Loans", "Payments", "Transactions", "Expenses", "SMS Logs", "Audit Logs"];

const Database = () => (
  <Section
    id="database"
    eyebrow="07 · Database"
    title="A clean, normalized data model"
    description="Nine tables that capture every entity in the business — designed for clarity and growth."
  >
    <div className="flex flex-wrap gap-3">
      {tables.map((t) => (
        <div key={t} className="flex items-center gap-2 rounded-full border-2 border-primary/15 bg-gradient-card px-5 py-2.5 shadow-soft hover:border-gold hover:bg-primary hover:text-primary-foreground transition">
          <DbIcon className="h-4 w-4 text-gold" />
          <span className="font-medium">{t}</span>
        </div>
      ))}
    </div>
  </Section>
);

export default Database;