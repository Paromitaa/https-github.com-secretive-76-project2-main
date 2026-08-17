import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Loader as Loader2, Mail, Lock, ArrowRight, Eye, EyeOff, GraduationCap, Users, ShieldCheck, Sparkles, Check, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/auth/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useAuth, roleDashboardPath } from '@/components/providers/auth-provider';
import { getRoleFromDomain, roleAccent } from '@/utils/domain';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';

const roleConfig: {
  key: UserRole;
  label: string;
  description: string;
  icon: typeof GraduationCap;
  email: string;
}[] = [
  {
    key: 'student',
    label: 'Student',
    description: 'Access courses, labs, and your AI coach',
    icon: GraduationCap,
    email: 'student@akademia.com',
  },
  {
    key: 'instructor',
    label: 'Instructor',
    description: 'Manage courses, track student progress',
    icon: Users,
    email: 'instructor@akademia.com',
  },
  {
    key: 'admin',
    label: 'Admin',
    description: 'Oversee the platform and manage users',
    icon: ShieldCheck,
    email: 'admin@akademia.com',
  },
];

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const domainRole = getRoleFromDomain();
  const accent = roleAccent(domainRole);
  const activeConfig = roleConfig.find((r) => r.key === domainRole)!;

  const [email, setEmail] = useState(activeConfig.email);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  const from = (location.state as { from?: string })?.from;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setAccessDenied(false);
    try {
      const user = await signIn(email, password, domainRole);
      if (user.role !== domainRole) {
        setAccessDenied(true);
        toast.error('Access Denied', {
          description: `This portal is strictly for ${activeConfig.label}s.`,
        });
        setLoading(false);
        return;
      }
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      const dest = from ?? roleDashboardPath[user.role];
      navigate(dest, { replace: true });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to sign in. Please try again.';
      toast.error('Sign-in failed', { description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={`Sign in to the ${activeConfig.label} Portal`}
      subtitle={`This portal is reserved for ${activeConfig.label.toLowerCase()}s. Use your ${activeConfig.label} credentials to continue.`}
    >
      <div className="space-y-4">
        {/* Domain role badge */}
        <div className="flex items-center justify-center">
          <div
            className={cn(
              'flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium',
              accent.border,
              accent.bg,
              accent.text
            )}
          >
            <activeConfig.icon className="h-4 w-4" />
            {activeConfig.label} Portal
          </div>
        </div>

        {/* Access denied banner */}
        {accessDenied && (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-semibold text-foreground">Access Denied</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                These credentials belong to a different role. This portal is strictly for{' '}
                {activeConfig.label.toLowerCase()}s.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(v) => setRemember(v === true)}
              />
              <Label htmlFor="remember" className="text-sm text-muted-foreground">
                Remember me
              </Label>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                Sign in as {activeConfig.label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Demo credentials hint */}
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3">
          <Sparkles className={cn('h-4 w-4 shrink-0', accent.text)} />
          <p className="text-xs text-muted-foreground">
            Demo credentials are pre-filled. Just enter the password and sign in.
          </p>
        </div>

        {/* Other portals */}
        <div className="space-y-2">
          <p className="text-center text-xs font-medium text-muted-foreground">
            Looking for a different portal?
          </p>
          <div className="flex items-center justify-center gap-2">
            {roleConfig
              .filter((r) => r.key !== domainRole)
              .map((r) => {
                const Icon = r.icon;
                return (
                  <Badge
                    key={r.key}
                    variant="outline"
                    className="gap-1.5 px-2.5 py-1 text-xs font-medium text-muted-foreground"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {r.label}
                  </Badge>
                );
              })}
          </div>
          <p className="text-center text-[11px] text-muted-foreground/70">
            Switch subdomain or use the dev toggle to preview other portals.
          </p>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
