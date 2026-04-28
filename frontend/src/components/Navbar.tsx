'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      suppressHydrationWarning
      style={{
        background: 'rgba(10, 14, 26, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(67, 70, 86, 0.2)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'var(--primary-container)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2"/>
              <path d="M3 12h18M12 3c-3 3-5 5.7-5 9s2 6 5 9M12 3c3 3 5 5.7 5 9s-2 6-5 9"
                stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-sm font-bold" style={{ color: 'var(--on-surface)', letterSpacing: '-0.01em' }}>
            Fuel Price<span style={{ color: 'var(--primary)' }}>Tracker</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          <NavLink href="/" label="Tableau de Bord" active={pathname === '/'} />
          <NavLink href="/countries" label="Pays" active={pathname === '/countries'} />
        </div>

        {/* Live indicator */}
        <a
          href="https://www.globalpetrolprices.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary flex-shrink-0"
          style={{ fontSize: '0.75rem' }}
        >
          <span className="live-dot" />
          Données en Direct
        </a>
      </div>
    </nav>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href} className={`nav-link${active ? ' active' : ''}`}>
      {label}
    </Link>
  );
}
