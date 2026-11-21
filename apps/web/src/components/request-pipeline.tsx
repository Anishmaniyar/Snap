import { escapeHtml } from "../lib/dom";

export const CREATE_STEPS = [
  ["POST /api/v1/urls", "browser"],
  ["express.json → requestLogger → metricsMiddleware", "app.ts"],
  ["authenticate: Bearer JWT, then user lookup", "401"],
  ["validateRequest: Zod body schema", "400"],
  ["urlService: code generation and collision retry", "409"],
  ["urlRepository → Prisma → PostgreSQL", "INSERT"],
  ["Response with shortUrl", "201"],
];

export const REDIRECT_STEPS = [
  ["GET /:shortCode", "browser"],
  ["redirectToOriginalUrl", "controller"],
  ["isActive and expiresAt checks", "404 / 410"],
  ["findByShortCode → Prisma → PostgreSQL", "SELECT"],
  ["Location: originalUrl", "302"],
];

interface PipelineProps {
  steps: string[][];
  id: string;
}

export const Pipeline: React.FC<PipelineProps> = ({ steps, id }) => (
  <div className="pipeline grid gap-0" id={id} aria-label="Request steps">
    {steps.map(([name, code]) => (
      <div key={`${id}-${name}`} className="step grid grid-cols-[18px_minmax(0,_1fr)_auto] gap-2.5 items-center min-h-[36px] data-[state=idle]:step-name-faint data-[state=active]:step-mark-accent data-[state=done]:step-mark-accent data-[state=active]:step-name-white" data-state="idle">
        <span className="step-mark w-2.5 h-2.5 rounded-full bg-control"></span>
        <span className="step-name text-faint text-xs leading-[18px]">{escapeHtml(name)}</span>
        <span className="step-code font-mono text-[13px] text-faint whitespace-nowrap">{escapeHtml(code)}</span>
      </div>
    ))}
  </div>
);

interface RenderPipelineProps {
  steps: string[][];
  id: string;
}

export const RenderPipeline: React.FC<RenderPipelineProps> = ({ steps, id }) => {
  return (
    <div className="pipeline grid gap-0" id={id} aria-label="Request steps">
      {steps.map(([name, code]) => (
        <div key={`${id}-${name}`} className="step grid grid-cols-[18px_minmax(0,_1fr)_auto] gap-2.5 items-center min-h-[36px] data-[state=idle]:step-name-faint data-[state=active]:step-mark-accent data-[state=done]:step-mark-accent data-[state=active]:step-name-white" data-state="idle">
          <span className="step-mark w-2.5 h-2.5 rounded-full bg-control"></span>
          <span className="step-name text-faint text-xs leading-[18px]">{escapeHtml(name)}</span>
          <span className="step-code font-mono text-[13px] text-faint whitespace-nowrap">{escapeHtml(code)}</span>
        </div>
      ))}
    </div>
  );
};

export const RunPipeline = async (id: string, work: () => Promise<unknown>): Promise<unknown> => {
  const nodes = Array.from(document.querySelectorAll(`#${id} > *`));
  nodes.forEach((node) => (node as HTMLElement).dataset.state = "idle");
  for (const node of nodes) {
    (node as HTMLElement).dataset.state = "active";
    await new Promise((resolve) => setTimeout(resolve, 90));
    (node as HTMLElement).dataset.state = "done";
  }
  return work();
};
