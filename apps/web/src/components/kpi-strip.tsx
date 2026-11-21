import { statusOf } from "../lib/format";

interface KPIProps {
  total: number;
  active: number;
  expired: number;
}

export const KPIStrip: React.FC<KPIProps> = ({ total, active, expired }) => (
  <div className="kpis">
    <div className="kpi p-5.5 px-5.5">
      <div className="kpi-label text-faint">Links</div>
      <div className="kpi-value num mt-1.5 text-kpi leading-[1.15] font-500 tracking-tight">{total}</div>
      <div className="kpi-note mt-1 text-faint text-xs">in this workspace</div>
    </div>
    <div className="kpi p-5.5 px-5.5 border-l border-border">
      <div className="kpi-label text-faint">Active</div>
      <div className="kpi-value num mt-1.5 text-kpi leading-[1.15] font-500 tracking-tight">{active}</div>
      <div className="kpi-note mt-1 text-faint text-xs">resolve with a redirect</div>
    </div>
    <div className="kpi p-5.5 px-5.5 border-l border-border">
      <div className="kpi-label text-faint">Expired</div>
      <div className="kpi-value num mt-1.5 text-kpi leading-[1.15] font-500 tracking-tight">{expired}</div>
      <div className="kpi-note mt-1 text-faint text-xs">answer with 410</div>
    </div>
    <div className="kpi p-5.5 px-5.5 border-l border-border">
      <div className="kpi-label text-faint">Redirects</div>
      <div className="kpi-value num mt-1.5 text-kpi leading-[1.15] font-500 tracking-text">-</div>
      <div className="kpi-note mt-1 text-faint text-xs">not tracked by the API</div>
    </div>
  </div>
);
