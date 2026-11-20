const items = [
  ["overview", "Overview", `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true"><rect x="2.5" y="2.5" width="6" height="6" rx="1.5"/><rect x="11.5" y="2.5" width="6" height="6" rx="1.5"/><rect x="2.5" y="11.5" width="6" height="6" rx="1.5"/><rect x="11.5" y="11.5" width="6" height="6" rx="1.5"/></svg>`],
  ["links", "Links", `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true"><path d="M8 12a4 4 0 0 0 5.7 0l2.3-2.3a4 4 0 0 0-5.7-5.7L9 5.3"/><path d="M12 8a4 4 0 0 0-5.7 0L4 10.3A4 4 0 0 0 9.7 16L11 14.7"/></svg>`],
  ["flow", "Flow", `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true"><rect x="2" y="7" width="4" height="6" rx="1"/><rect x="14" y="7" width="4" height="6" rx="1"/><path d="M6 10h8"/></svg>`],
  ["health", "Health", `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true"><path d="M2 10h4l2-5 3 10 2-5h5"/></svg>`],
];

export const sidebar = (active) => `
  <aside class="sidebar" id="sidebar">
    <div class="brand">
      <svg class="brand-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
        <rect x="2.5" y="9" width="9" height="6" rx="2.2"/>
        <rect x="12.5" y="9" width="9" height="6" rx="2.2"/>
        <path d="M11.5 12h1" stroke-linecap="round"/>
      </svg>
      <span class="brand-name">snap</span>
    </div>
    <nav aria-label="Main">
      <div class="group-label">Workspace</div>
      ${items.map(([id, label, icon]) => `
        <a class="nav-item" href="#/${id}" data-nav="${id}" ${active === id ? 'aria-current="page"' : ""}>
          ${icon}${label}
        </a>`).join("")}
    </nav>
    <div class="bottom">
      <div class="account">
        <span class="avatar" id="avatar"></span>
        <span class="who"><strong id="account-name"></strong><span id="account-email"></span></span>
      </div>
      <button class="btn ghost" type="button" data-action="auth-toggle" id="auth-toggle"></button>
      <button class="btn ghost" type="button" data-action="signout" id="signout" hidden>Sign out</button>
    </div>
  </aside>`;
