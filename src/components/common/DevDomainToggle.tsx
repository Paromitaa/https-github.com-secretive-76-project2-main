import { useEffect, useState } from 'react';
import { GraduationCap, Users, ShieldCheck, Globe, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DEV_DOMAIN_STORAGE_KEY } from '@/utils/domain';
import type { UserRole } from '@/types';

const options: { role: UserRole; label: string; icon: typeof GraduationCap }[] = [
  { role: 'student', label: 'Student', icon: GraduationCap },
  { role: 'instructor', label: 'Instructor', icon: Users },
  { role: 'admin', label: 'Admin', icon: ShieldCheck },
];

/**
 * Floating dev-only switcher that overrides the simulated domain role.
 * Visible only on localhost / 127.0.0.1 so it never leaks into production.
 * Writes to localStorage under DEV_DOMAIN_STORAGE_KEY; getRoleFromDomain()
 * reads that key first, so changing it re-themes the login page instantly.
 */
export function DevDomainToggle() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<UserRole>('student');

  useEffect(() => {
    const hostname = window.location.hostname;
    const isDev =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.endsWith('.local');
    if (!isDev) return;

    setMounted(true);
    try {
      const stored = window.localStorage.getItem(DEV_DOMAIN_STORAGE_KEY);
      if (stored === 'student' || stored === 'instructor' || stored === 'admin') {
        setRole(stored);
      } else {
        // initialize from current hostname inference
        const inferred: UserRole = hostname.includes('admin')
          ? 'admin'
          : hostname.includes('instructor')
            ? 'instructor'
            : 'student';
        setRole(inferred);
      }
    } catch {
      // ignore
    }
  }, []);

  const apply = (next: UserRole) => {
    setRole(next);
    try {
      window.localStorage.setItem(DEV_DOMAIN_STORAGE_KEY, next);
    } catch {
      // ignore
    }
    // Reload so every component reading getRoleFromDomain() re-evaluates.
    window.location.reload();
  };

  const clear = () => {
    try {
      window.localStorage.removeItem(DEV_DOMAIN_STORAGE_KEY);
    } catch {
      // ignore
    }
    window.location.reload();
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col items-end gap-2">
      {open && (
        <div className="w-64 rounded-xl border border-border bg-popover p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Dev domain</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Close dev toggle"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mb-2.5 text-[11px] text-muted-foreground">
            Simulate which subdomain portal you're viewing. Reloads the page to re-theme the login.
          </p>
          <div className="space-y-1.5">
            {options.map((opt) => {
              const Icon = opt.icon;
              const isActive = role === opt.role;
              return (
                <button
                  key={opt.role}
                  onClick={() => apply(opt.role)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                    isActive
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{opt.label}</span>
                  {isActive && <span className="text-xs">active</span>}
                </button>
              );
            })}
          </div>
          <button
            onClick={clear}
            className="mt-2 w-full rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Reset to hostname
          </button>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-border bg-background/90 px-3 py-2 text-xs font-medium text-foreground shadow-lg backdrop-blur transition-colors hover:bg-accent"
        aria-label="Toggle dev domain switcher"
      >
        <Globe className="h-3.5 w-3.5 text-primary" />
        <span className="capitalize">{role}</span>
      </button>
    </div>
  );
}
