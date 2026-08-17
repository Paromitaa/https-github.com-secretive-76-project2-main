import { useState } from 'react';
import {
  User,
  Bell,
  Palette,
  CreditCard,
  Shield,
  LogOut,
  Camera,
  Check,
  Sun,
  Moon,
  Monitor,
  Sparkles,
  Crown,
  Trash2,
} from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/components/providers/auth-provider';
import { useTheme } from 'next-themes';
import { initials } from '@/lib/format';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Tab = 'profile' | 'notifications' | 'appearance' | 'subscription' | 'security';

const tabs: { key: Tab; label: string; icon: typeof User }[] = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'appearance', label: 'Appearance', icon: Palette },
  { key: 'subscription', label: 'Subscription', icon: CreditCard },
  { key: 'security', label: 'Security', icon: Shield },
];

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const currentTheme = (theme ?? 'dark') as 'light' | 'dark' | 'system';
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const displayName = user?.name ?? 'Learner';
  const email = user?.email ?? '';
  const avatarUrl = user?.avatarUrl ??
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop&crop=faces&q=80';

  return (
    <div className="space-y-6 animate-in-slide">
      <PageHeader title="Settings" description="Manage your profile, preferences, and subscription." />

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Sidebar tabs */}
        <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  activeTab === tab.key
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
          <button
            onClick={() => signOut()}
            className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </nav>

        {/* Tab content */}
        <div className="min-w-0">
          {activeTab === 'profile' && (
            <ProfileTab displayName={displayName} email={email} avatarUrl={avatarUrl} />
          )}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'appearance' && (
            <AppearanceTab theme={currentTheme} setTheme={setTheme} />
          )}
          {activeTab === 'subscription' && <SubscriptionTab />}
          {activeTab === 'security' && <SecurityTab />}
        </div>
      </div>
    </div>
  );
}

function ProfileTab({
  displayName,
  email,
  avatarUrl,
}: {
  displayName: string;
  email: string;
  avatarUrl: string;
}) {
  const [name, setName] = useState(displayName);
  const [bio, setBio] = useState('ML engineer in training. Currently deep-diving into transformers and RAG systems.');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Profile</CardTitle>
        <CardDescription>Update your personal information and bio</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="text-lg">{initials(displayName)}</AvatarFallback>
          </Avatar>
          <div>
            <Button variant="outline" size="sm">
              <Camera className="mr-2 h-4 w-4" />
              Change photo
            </Button>
            <p className="mt-1.5 text-xs text-muted-foreground">JPG, PNG, or GIF. Max 5MB.</p>
          </div>
        </div>

        <Separator />

        {/* Form fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled className="bg-muted/50" />
            <p className="text-xs text-muted-foreground">Email changes require verification</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <p className="text-xs text-muted-foreground">{bio.length}/200 characters</p>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" size="sm">Cancel</Button>
          <Button
            size="sm"
            onClick={() => toast.success('Profile updated successfully')}
          >
            <Check className="mr-2 h-4 w-4" />
            Save changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationsTab() {
  const [settings, setSettings] = useState({
    courseUpdates: true,
    newContent: true,
    quizReminders: true,
    weeklyProgress: true,
    achievements: true,
    aiCoach: false,
    marketing: false,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const notificationItems: { key: keyof typeof settings; label: string; description: string }[] = [
    { key: 'courseUpdates', label: 'Course updates', description: 'New lessons, modules, and course announcements' },
    { key: 'newContent', label: 'New content', description: 'When new courses or paths matching your interests are added' },
    { key: 'quizReminders', label: 'Quiz reminders', description: 'Reminders to practice with weekly quizzes' },
    { key: 'weeklyProgress', label: 'Weekly progress report', description: 'A summary of your learning activity every Sunday' },
    { key: 'achievements', label: 'Achievement unlocked', description: 'Celebrate when you earn a new badge' },
    { key: 'aiCoach', label: 'AI Coach suggestions', description: 'Proactive study suggestions from your AI coach' },
    { key: 'marketing', label: 'Product updates', description: 'New features and special offers' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Notifications</CardTitle>
        <CardDescription>Choose what you want to be notified about</CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        {notificationItems.map((item) => (
          <div key={item.key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
            <div className="min-w-0 pr-4">
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
            <Switch checked={settings[item.key]} onCheckedChange={() => toggle(item.key)} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function AppearanceTab({
  theme,
  setTheme,
}: {
  theme: 'light' | 'dark' | 'system';
  setTheme: (t: string) => void;
}) {
  const options: { key: 'light' | 'dark' | 'system'; label: string; icon: typeof Sun; description: string }[] = [
    { key: 'light', label: 'Light', icon: Sun, description: 'Bright and clean' },
    { key: 'dark', label: 'Dark', icon: Moon, description: 'Easy on the eyes' },
    { key: 'system', label: 'System', icon: Monitor, description: 'Follow your device' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Appearance</CardTitle>
        <CardDescription>Customize how Lumina looks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="mb-3 block">Theme</Label>
          <div className="grid gap-3 sm:grid-cols-3">
            {options.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.key}
                  onClick={() => setTheme(option.key)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
                    theme === option.key
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30'
                  )}
                >
                  <Icon
                    className={cn('h-6 w-6', theme === option.key ? 'text-primary' : 'text-muted-foreground')}
                  />
                  <span className={cn('text-sm font-medium', theme === option.key ? 'text-primary' : 'text-foreground')}>
                    {option.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Reduce motion</p>
            <p className="text-xs text-muted-foreground">Minimize animations and transitions</p>
          </div>
          <Switch />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Compact mode</p>
            <p className="text-xs text-muted-foreground">Tighter spacing for more content per screen</p>
          </div>
          <Switch />
        </div>
      </CardContent>
    </Card>
  );
}

function SubscriptionTab() {
  return (
    <div className="space-y-4">
      {/* Current plan */}
      <Card className="overflow-hidden border-indigo/20">
        <div className="bg-gradient-to-r from-indigo/10 via-card to-teal/10 p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-indigo/10">
                <Crown className="h-6 w-6 text-indigo" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-foreground">Pro Plan</h3>
                  <Badge className="bg-indigo/10 text-indigo border-indigo/20">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground">$19/month · Renews on Sep 12, 2026</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Manage billing</Button>
          </div>
        </div>
        <CardContent className="p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              'Unlimited course access',
              'AI Coach with 1000 msgs/month',
              'All hands-on labs',
              'Learning paths + AI curation',
              'Certificates of completion',
              'Priority support',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 shrink-0 text-success" />
                {feature}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Plans comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Available plans</CardTitle>
          <CardDescription>Upgrade or downgrade anytime</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {[
            { name: 'Free', price: '$0', features: ['5 courses', '10 AI msgs/month', 'Community access'], current: false },
            { name: 'Pro', price: '$19/mo', features: ['Everything in Free', 'Unlimited courses', 'All labs + paths'], current: true },
            { name: 'Team', price: '$49/mo', features: ['Everything in Pro', 'Team analytics', 'SSO + admin panel'], current: false },
          ].map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'rounded-xl border-2 p-4',
                plan.current ? 'border-primary bg-primary/5' : 'border-border'
              )}
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-foreground">{plan.name}</p>
                {plan.current && <Badge className="bg-primary/10 text-primary">Current</Badge>}
              </div>
              <p className="mt-1 text-2xl font-bold text-foreground">{plan.price}</p>
              <ul className="mt-3 space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Check className="h-3 w-3 text-success" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.current ? 'outline' : 'default'}
                size="sm"
                className="mt-4 w-full"
                disabled={plan.current}
              >
                {plan.current ? 'Current plan' : `Switch to ${plan.name}`}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function SecurityTab() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Password</CardTitle>
          <CardDescription>Change your account password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-pw">Current password</Label>
            <Input id="current-pw" type="password" placeholder="••••••••" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-pw">New password</Label>
              <Input id="new-pw" type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-pw">Confirm password</Label>
              <Input id="confirm-pw" type="password" placeholder="••••••••" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={() => toast.success('Password updated')}>
              Update password
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sessions</CardTitle>
          <CardDescription>Manage your active sessions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="flex items-center gap-3">
              <Monitor className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Current session</p>
                <p className="text-xs text-muted-foreground">Chrome · Linux · Active now</p>
              </div>
            </div>
            <Badge className="bg-success/10 text-success border-success/20">Active</Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="flex items-center gap-3">
              <Monitor className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">MacBook Pro</p>
                <p className="text-xs text-muted-foreground">Safari · Last active 2d ago</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-destructive">Revoke</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-destructive">
            <Trash2 className="h-4 w-4" />
            Danger zone
          </CardTitle>
          <CardDescription>Irreversible account actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Delete account</p>
              <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive" size="sm">
              Delete account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
