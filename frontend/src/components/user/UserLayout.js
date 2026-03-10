import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', path: '/user/dashboard' },
  { label: 'Sessions', path: '/user/sessions' },
  { label: 'Videos', path: '/user/videos' },
  { label: 'Shop', path: '/user/shop' },
  { label: 'Cart', path: '/user/cart' },
  { label: 'Support', path: '/user/chat' },
  { label: 'Reviews', path: '/user/testimonials' }
];

export const UserLayout = ({
  children,
  title,
  subtitle,
  actions,
  activePath,
  hidePageHeader = false,
  pageWrapperClassName
}) => {
  const navigate = useNavigate();

  return (
    <div className={cn('min-h-screen saas-aurora text-zinc-100', pageWrapperClassName)} data-testid="user-layout-root">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-20 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute top-16 right-0 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl" data-testid="user-layout-header">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-8">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition-colors hover:bg-white/10"
            data-testid="user-layout-brand-btn"
          >
            <span className="rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 p-2">
              <Dumbbell className="h-5 w-5 text-zinc-950" />
            </span>
            <span className="saas-title text-2xl font-bold text-white">FitSphere</span>
          </button>

          <nav className="hidden items-center gap-2 lg:flex" data-testid="user-layout-nav">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                data-testid={`user-layout-nav-${item.label.toLowerCase()}`}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                  activePath === item.path
                    ? 'bg-cyan-500 text-zinc-950'
                    : 'border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2" data-testid="user-layout-actions">
            {actions}
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10" data-testid="user-layout-main">
        {!hidePageHeader && (
          <section className="mb-8 md:mb-10" data-testid="user-layout-page-header">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">FitSphere Experience</p>
            <h1 className="saas-title text-4xl font-bold text-white md:text-6xl" data-testid="user-layout-page-title">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-3 max-w-3xl text-sm text-zinc-300 md:text-base" data-testid="user-layout-page-subtitle">
                {subtitle}
              </p>
            )}
          </section>
        )}

        {children}
      </main>
    </div>
  );
};
