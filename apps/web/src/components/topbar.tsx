interface TopbarProps {
  title: string;
  connectionLabel: string;
  connectionTitle: string;
  apiOnline: boolean;
  scopeLabel: string;
  scopeDotBg: string;
  onConnection: () => void;
  onMenu: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  title,
  connectionLabel,
  connectionTitle,
  apiOnline,
  scopeLabel,
  scopeDotBg,
  onConnection,
  onMenu,
  sidebarOpen,
  setSidebarOpen,
}) => (
  <header className="topbar h-16 flex items-center gap-4 border-b border-border mb-7 px-6 lg:px-7.25">
    <button
      className="menu-toggle hidden md:hidden inline-flex items-center justify-center w-11 h-11 rounded-md bg-transparent text-white cursor-pointer p-0"
      onClick={onMenu}
      aria-expanded={sidebarOpen}
    >
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 6h14M3 10h14M3 14h14"/></svg>
    </button>
    <div className="crumb text-faint">snap / <strong className="text-white font-500">{title}</strong></div>
    <div className="spacer flex-1"></div>
    <button
      className="btn ghost h-7 text-xs"
      type="button"
      id="connection"
      onClick={onConnection}
      title={connectionTitle}
    >
      {connectionLabel}
    </button>
    <div className="scope self-stretch flex items-center gap-2 pl-5 ml-1 border-l border-border text-muted text-xs">
      <span className="scope-dot w-1.75 h-1.75 rounded-full bg-accent" style={{ backgroundColor: scopeDotBg }}></span>
      <span id="scope-label">{scopeLabel}</span>
    </div>
  </header>
);
