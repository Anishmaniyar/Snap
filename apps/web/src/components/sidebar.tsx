import Link from "next/link";

const navItems = [
  { id: "overview", label: "Overview", icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="2.5" y="2.5" width="6" height="6" rx="1.5"/><rect x="11.5" y="2.5" width="6" height="6" rx="1.5"/><rect x="2.5" y="11.5" width="6" height="6" rx="1.5"/><rect x="11.5" y="11.5" width="6" height="6" rx="1.5"/></svg> },
  { id: "links", label: "Links", icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M8 12a4 4 0 0 0 5.7 0l2.3-2.3a4 4 0 0 0-5.7-5.7L9 5.3"/><path d="M12 8a4 4 0 0 0-5.7 0L4 10.3A4 4 0 0 0 9.7 16L11 14.7"/></svg> },
  { id: "flow", label: "Flow", icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="2" y="7" width="4" height="6" rx="1"/><rect x="14" y="7" width="4" height="6" rx="1"/><path d="M6 10h8"/></svg> },
  { id: "health", label: "Health", icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M2 10h4l2-5 3 10 2-5h5"/></svg> },
];

interface SidebarProps {
  active: string;
  userName: string;
  userEmail: string;
  onSignout: () => void;
  signoutHidden: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  active,
  userName,
  userEmail,
  onSignout,
  signoutHidden,
}) => (
  <aside className="sidebar flex flex-col h-full sticky top-0 overflow-auto border-r border-border p-5 md:p-3">
    <div className="flex items-center gap-2.5 px-2 pb-6.5">
      <svg className="brand-mark w-6.5 h-6.5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="2.5" y="9" width="9" height="6" rx="2.2" />
        <rect x="12.5" y="9" width="9" height="6" rx="2.2" />
        <path d="M11.5 12h1" strokeLinecap="round" />
      </svg>
      <span className="brand-name text-sm font-600 tracking-tight">snap</span>
    </div>
    <nav aria-label="Main">
      <div className="group-label my-5.5 mx-2 text-faint text-xs uppercase">Workspace</div>
      {navItems.map((item) => (
        <Link
          key={item.id}
          href={`#/${item.id}`}
          className={`nav-item flex items-center gap-2.5 h-8.5 px-2 rounded-md text-muted transition-all hover:bg-raised hover:text-white ${active === item.id ? "bg-active text-white" : ""}`}
        >
          {item.icon}
          <span className="text-xs">{item.label}</span>
        </Link>
      ))}
    </nav>
    <div className="mt-auto grid gap-1.5">
      <div className="account flex items-center gap-2.5 p-2 border-t border-border">
        <div className="avatar w-7 h-7 grid place-items-center rounded-full bg-raised text-white text-xs font-500">
          {userName.slice(0, 2).toUpperCase()}
        </div>
        <div className="who min-w-0">
          <strong className="block text-xs font-500">{userName}</strong>
          <span className="block text-faint text-xs">{userEmail}</span>
        </div>
      </div>
      <button className="btn ghost" type="button" onClick={onSignout} hidden={signoutHidden}>Sign out</button>
    </div>
  </aside>
);
