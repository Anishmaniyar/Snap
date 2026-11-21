interface PublicHeaderProps {
  onMenu?: () => void;
}

export const PublicHeader: React.FC<PublicHeaderProps> = () => (
  <header className="pub-header">
    <a href="#/landing" className="pub-brand" aria-label="Snap home">
      <svg className="brand-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="2.5" y="9" width="9" height="6" rx="2.2" />
        <rect x="12.5" y="9" width="9" height="6" rx="2.2" />
        <path d="M11.5 12h1" strokeLinecap="round" />
      </svg>
      <span>snap</span>
    </a>
    <nav className="pub-nav" aria-label="Public">
      <a href="#/flow">How it works</a>
      <a href="#/signin">Sign in</a>
      <a href="#/signup" className="btn primary">Create account</a>
    </nav>
  </header>
);
