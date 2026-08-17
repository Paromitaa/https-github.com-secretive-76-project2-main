import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/auth/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      setSent(true);
      toast.success('Reset link sent', {
        description: 'Check your inbox for password reset instructions.',
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to send reset link. Please try again.';
      toast.error('Something went wrong', { description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a link to reset your password."
    >
      {sent ? (
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-3 rounded-xl border border-success/20 bg-success/5 p-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-success" />
            <div>
              <p className="font-medium text-foreground">Check your email</p>
              <p className="mt-1 text-sm text-muted-foreground">
                We sent a reset link to <span className="font-medium text-foreground">{email}</span>.
                It may take a minute to arrive.
              </p>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={() => setSent(false)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Try a different email
          </Button>
        </div>
      ) : (
        <>
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending link…
                </>
              ) : (
                <>
                  Send reset link
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <Link
            to="/login"
            className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </>
      )}
    </AuthLayout>
  );
}
