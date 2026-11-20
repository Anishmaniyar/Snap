export const topbar = (title) => `
  <header class="topbar">
    <button class="menu-toggle" type="button" data-action="menu" aria-label="Open navigation" aria-expanded="false">
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 6h14M3 10h14M3 14h14"/></svg>
    </button>
    <div class="crumb">snap / <strong id="crumb">${title}</strong></div>
    <div class="spacer"></div>
    <span class="mode-chip" id="mode-chip"></span>
    <button class="btn ghost" type="button" data-action="connection" id="connection" hidden></button>
    <div class="scope"><span class="scope-dot" id="scope-dot"></span><span id="scope-label">local</span></div>
  </header>`;
