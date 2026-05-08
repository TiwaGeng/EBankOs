import Section from "./Section";
import { Smartphone, Wallet, Brain, Palette } from "lucide-react";

const ux = [
  "Responsive design",
  "Sidebar navigation",
  "Modern cards & clean tables",
  "Mobile-friendly experience",
];

const future = [
  { icon: Smartphone, title: "Mobile App", text: "Native experience for officers in the field." },
  { icon: Wallet, title: "Mobile Money", text: "Direct integration with mobile money providers." },
  { icon: Brain, title: "AI Risk Scoring", text: "Smart loan approval with risk prediction." },
];

const Future = () => (
  <Section
    id="future"
    eyebrow="08 · UI/UX & Future"
    title="Beautiful today. Even better tomorrow."
    alt
  >
    <div className="grid lg:grid-cols-2 gap-10">
      <div className="bg-gradient-card p-8 rounded-2xl border border-border shadow-soft">
        <div className="flex items-center gap-3 mb-5">
          <Palette className="h-6 w-6 text-gold" />
          <h3 className="font-display text-2xl font-bold">UI / UX Design</h3>
        </div>
        <ul className="space-y-3">
          {ux.map((u) => (
            <li key={u} className="flex items-center gap-3 text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-gold" /> {u}
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-4">
        <h3 className="font-display text-2xl font-bold mb-3">Future Enhancements</h3>
        {future.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex gap-4 p-5 rounded-2xl bg-card border border-border shadow-soft hover:border-gold transition">
            <div className="shrink-0 h-11 w-11 rounded-xl bg-primary text-gold flex items-center justify-center">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold">{title}</h4>
              <p className="text-sm text-muted-foreground">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </Section>
);

export default Future;