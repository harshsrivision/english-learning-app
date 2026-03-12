type SectionTitleProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionTitle({ eyebrow, title, description }: SectionTitleProps) {
  return (
    <div className="max-w-2xl space-y-3">
      <p className="text-xs font-bold uppercase tracking-[0.35em] text-teal">{eyebrow}</p>
      <h2 className="font-display text-3xl leading-tight text-ink sm:text-4xl">{title}</h2>
      <p className="text-base leading-7 text-ink/70">{description}</p>
    </div>
  );
}
