import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/components/providers/auth-provider';

interface LoginPageProps {
  portalRole?: 'student' | 'instructor' | 'admin';
}

export function LoginPage({ portalRole = 'student' }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const auth = useAuth() as any;
  const loginFn = auth.signIn || auth.login || auth.signInWithPassword;
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Pass portalRole as 3rd parameter to match signIn(email, password, role)
      await loginFn(email, password, portalRole);
      navigate(`/${portalRole}/dashboard`, { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roleTitle = portalRole.charAt(0).toUpperCase() + portalRole.slice(1);
  const signupPath = portalRole === 'student' ? '/signup' : `/${portalRole}/signup`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl border bg-card p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
            {roleTitle} Portal Login
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to access your {portalRole} dashboard
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive border border-destructive/20">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                placeholder={`${portalRole}@example.com`}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <Link
              to="/forgot-password"
              className="font-medium text-primary hover:text-primary/80"
            >
              Forgot your password?
            </Link>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md bg-primary py-2 px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : `Sign in as ${roleTitle}`}
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to={signupPath} className="font-medium text-primary hover:text-primary/80">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}