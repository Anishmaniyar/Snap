interface PanelProps {
  title: string;
  meta?: string;
  action?: React.ReactNode;
  body?: React.ReactNode;
  children?: React.ReactNode;
  classes?: string;
}

export const Panel: React.FC<PanelProps> = ({ title, meta = "", action = "", body, children, classes = "" }) => (
  <section className={`panel bg-surface rounded-card p-5.5 min-w-0 ${classes}`}>
    <header className="flex items-baseline justify-between gap-3 mb-4.5">
      <h2 className="text-section leading-1.3 font-600">{title}</h2>
      {meta ? <span className="meta text-faint text-xs">{meta}</span> : null}
      {action ? <span className="action">{action}</span> : null}
    </header>
    {body ?? children}
  </section>
);
