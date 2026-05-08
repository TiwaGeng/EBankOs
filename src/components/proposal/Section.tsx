import { ReactNode } from "react";

interface Props {
  id: string;
  eyebrow: string;
  title: ReactNode;
  description?: string;
  children: ReactNode;
  alt?: boolean;
}

const Section = ({ id, eyebrow, title, description, children, alt }: Props) => (
  <section id={id} className={alt ? "bg-muted/40 py-24" : "bg-background py-24"}>
    <div className="container">
      <div className="max-w-2xl mb-14">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold mb-3">{eyebrow}</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight">{title}</h2>
        {description && <p className="mt-4 text-muted-foreground text-lg leading-relaxed">{description}</p>}
      </div>
      {children}
    </div>
  </section>
);

export default Section;