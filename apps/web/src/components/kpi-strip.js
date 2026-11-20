export const kpiStrip = ({ total, active, expired }) => `
  <div class="kpis">
    <div class="kpi"><div class="kpi-label">Links</div><div class="kpi-value num">${total}</div><div class="kpi-note">in this workspace</div></div>
    <div class="kpi"><div class="kpi-label">Active</div><div class="kpi-value num">${active}</div><div class="kpi-note">resolve with a redirect</div></div>
    <div class="kpi"><div class="kpi-label">Expired</div><div class="kpi-value num">${expired}</div><div class="kpi-note">answer with 410</div></div>
    <div class="kpi"><div class="kpi-label">Redirects</div><div class="kpi-value num">-</div><div class="kpi-note">not tracked by the API</div></div>
  </div>`;
