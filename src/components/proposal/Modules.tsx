import Section from "./Section";
import { LayoutDashboard, UserPlus, HandCoins, BarChart3, ArrowLeftRight, UsersRound, Settings, BookUser, MessageSquare } from "lucide-react";

const modules = [
  { icon: LayoutDashboard, title: "Dashboard", points: ["Charts & insights", "Overdue alerts", "Quick actions"] },
  { icon: UserPlus, title: "Clients", points: ["Add / Update / Delete", "Client list & book", "Bulk SMS, balance check"] },
  { icon: HandCoins, title: "Loan Actions", points: ["Give Loan", "Loan Payment & Renew", "Add Fine, status tracking"] },
  { icon: BarChart3, title: "Reports", points: ["Daily report", "Clients not paid", "Renewed & complicated loans"] },
  { icon: ArrowLeftRight, title: "Transactions", points: ["Income & expenses", "Categorized entries", "Reconciliation"] },
  { icon: UsersRound, title: "Employees", points: ["Manage staff", "Assign roles", "Audit activity"] },
  { icon: BookUser, title: "Client Book", points: ["Full client profile", "Loan history", "Notes & docs"] },
  { icon: MessageSquare, title: "SMS Center", points: ["Send to all clients", "Automatic reminders", "Balance & receipts"] },
  { icon: Settings, title: "Settings", points: ["Business profile", "Branding & SMS API", "Backups"] },
];

const Modules = () => (
  <Section
    id="modules"
    eyebrow="03 · Core Modules"
    title="Nine powerful modules. One seamless experience."
    description="Every essential operation in a lending business, neatly organized and ready to use."
  >
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {modules.map(({ icon: Icon, title, points }) => (
        <article key={title} className="relative bg-gradient-card p-7 rounded-2xl border border-border shadow-soft hover:shadow-elegant hover:-translate-y-1 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-gold opacity-0 group-hover:opacity-20 blur-2xl transition" />
          <Icon className="h-8 w-8 text-primary mb-4" />
          <h3 className="font-display text-xl font-bold mb-3">{title}</h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {points.map((p) => (
              <li key={p} className="flex gap-2">
                <span className="text-gold">▸</span>{p}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  </Section>
);

export default Modules;