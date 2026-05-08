import Section from "./Section";
import { KeyRound, Timer, ShieldCheck, ScrollText } from "lucide-react";

const items = [
  { icon: KeyRound, title: "Password Hashing", text: "Industry-standard hashing — credentials are never stored in plain text." },
  { icon: Timer, title: "Session Timeout", text: "Idle sessions automatically expire to keep accounts safe." },
  { icon: ShieldCheck, title: "Role-Based Access", text: "Every action is gated by the user's role and permissions." },
  { icon: ScrollText, title: "Audit Logs", text: "A complete trail of who did what, and when." },
];

const Security = () => (
  <Section
    id="security"
    eyebrow="06 · Security"
    title="Bank-grade security from day one"
    alt
  >
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {items.map(({ icon: Icon, title, text }) => (
        <div key={title} className="p-6 rounded-2xl bg-primary text-primary-foreground shadow-elegant hover:scale-[1.02] transition">
          <Icon className="h-7 w-7 text-gold mb-4" />
          <h3 className="font-display text-lg font-bold mb-2">{title}</h3>
          <p className="text-sm text-primary-foreground/75 leading-relaxed">{text}</p>
        </div>
      ))}
    </div>
  </Section>
);

export default Security;