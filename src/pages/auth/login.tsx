import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Loader2,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  Users,
  ShieldCheck,
  Sparkles,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/auth/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth, roleDashboardPath } from '@/components/providers/auth-provider';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';

const roleConfig: {
  key: UserRole;
  label: string;
  description: string;
  icon: typeof GraduationCap;
  accent: string;
  iconBg: string;
  email: string;
}[] = [
  {
    key: 'student',
    label: 'Student',
    description: 'Access courses, labs, and your AI coach',
    icon: GraduationCap,
    accent: 'text-primary',
    iconBg: 'bg-primary/10',
    email: 'student@akademia.com',
  },
  {
    key: 'instructor',
    label: 'Instructor',
    description: 'Manage courses, track student progress',
    icon: Users,
    accent: 'text-teal',
    iconBg: 'bg-teal/10',
    email: 'instructor@akademia.com',
  },
  {
    key: 'admin',
    label: 'Admin',
    description: 'Oversee the platform and manage users',
    icon: ShieldCheck,
    accent: 'text-warning',
    iconBg: 'bg-warning/10',
    email: 'admin@akademia.com',
  },
];

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string })?.from;

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    const cfg = roleConfig.find((r) => r.key === role)!;
    setEmail(cfg.email);
    setPassword('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password || !selectedRole) return;

    setLoading(true);
    try {
      const user = await signIn(email, password, selectedRole);
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
      title={selectedRole ? 'Sign in to your account' : 'Welcome to Akademia'}
      subtitle={
        selectedRole
          ? `Continue as ${roleConfig.find((r) => r.key === selectedRole)?.label}.`
          : 'AI-Powered Learning Platform — choose how you want to sign in.'
      }
    >
      {!selectedRole ? (
        /* Role selection */
        <div className="space-y-4">
          <p className="text-center text-sm font-medium text-muted-foreground">
            Select your role to continue
          </p>
          <div className="space-y-3">
            {roleConfig.map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.key}
                  onClick={() => handleRoleSelect(role.key)}
                  className={cn(
                    'group flex w-full items-center gap-4 rounded-xl border-2 border-border p-4 text-left transition-all hover:border-primary/40 hover:bg-accent/30'
                  )}
                >
                  <div className={cn('grid h-12 w-12 shrink-0 place-items-center rounded-xl', role.iconBg)}>
                    <Icon className={cn('h-6 w-6', role.accent)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">{role.label}</p>
                    <p className="text-xs text-muted-foreground">{role.description}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3">
            <Sparkles className="h-4 w-4 shrink-0 text-teal" />
            <p className="text-xs text-muted-foreground">
              Demo accounts are pre-filled when you select a role. Just click sign in.
            </p>
          </div>
        </div>
      ) : (
        /* Login form for selected role */
        <div className="space-y-4">
          {/* Role badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {roleConfig.map((r) => {
                const Icon = r.icon;
                const isActive = r.key === selectedRole;
                return (
                  <button
                    key={r.key}
                    onClick={() => handleRoleSelect(r.key)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all',
                      isActive
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {r.label}
                    {isActive && <Check className="h-3 w-3" />}
                  </button>
                );
              })}
            </div>
          </div>

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
                  Sign in as{' '}
                  {roleConfig.find((r) => r.key === selectedRole)?.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <button
            onClick={() => setSelectedRole(null)}
            className="w-full text-center text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Choose a different role
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-primary hover:underline">
              Create one
            </Link>
          </p>
        </div>
      )}
    </AuthLayout>
  );
}
