import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Mail, Lock, User as UserIcon, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/auth/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface SignupPageProps {
  portalRole?: 'student' | 'instructor' | 'admin';
}

export function SignupPage({ portalRole = 'student' }: SignupPageProps) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const roleTitle = portalRole.charAt(0).toUpperCase() + portalRole.slice(1);
  const loginPath = portalRole === 'student' ? '/login' : `/${portalRole}/login`;

  const passwordChecks = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One number', met: /\d/.test(password) },
  ];

  const canSubmit = passwordChecks.every((c) => c.met) && agreed && name && email;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      toast.success(`${roleTitle} account created`, {
        description: `Welcome to Akademia — your ${portalRole} journey starts now.`,
      });
      navigate(loginPath, { replace: true });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to create account. Please try again.';
      toast.error('Sign-up failed', { description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={`Create your ${portalRole} account`}
      subtitle={
        portalRole === 'instructor'
          ? 'Share your knowledge and empower thousands of learners.'
          : portalRole === 'admin'
          ? 'Manage users, content, and platform operations.'
          : 'Start learning with an AI coach that adapts to you.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <div className="relative">
            <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder="Alex Rivera"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder={`${portalRole}@example.com`}
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              autoComplete="new-password"
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
          {password && (
            <ul className="mt-2 space-y-1">
              {passwordChecks.map((c) => (
                <li
                  key={c.label}
                  className={`flex items-center gap-1.5 text-xs transition-colors ${
                    c.met ? 'text-success' : 'text-muted-foreground'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {c.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="terms"
            checked={agreed}
            onCheckedChange={(v) => setAgreed(v === true)}
            className="mt-0.5"
          />
          <Label htmlFor="terms" className="text-sm text-muted-foreground">
            I agree to the{' '}
            <span className="font-medium text-foreground">Terms of Service</span> and{' '}
            <span className="font-medium text-foreground">Privacy Policy</span>
          </Label>
        </div>

        <Button type="submit" className="w-full" disabled={loading || !canSubmit}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account…
            </>
          ) : (
            <>
              Create {roleTitle} account
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to={loginPath} className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}