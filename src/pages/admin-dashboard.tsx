import {
  Users,
  BookOpen,
  DollarSign,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  Activity,
  Server,
  Search,
  MoreVertical,
  Ban,
  CheckCircle,
  Clock,
  Plus,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/common/page-header';
import { StatCard } from '@/components/common/stat-card';
import {
  platformStats,
  userGrowthData,
  categoryDistribution,
  adminUsers,
  adminCourses,
  systemHealth,
} from '@/lib/dashboard-data';
import { formatNumber, initials, relativeTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import type { UserRole } from '@/types';

const platformStatIcons: Record<string, typeof Users> = {
  users: Users,
  book: BookOpen,
  dollar: DollarSign,
  check: CheckCircle2,
};

const userStatusStyles: Record<string, string> = {
  active: 'bg-success/10 text-success border-success/20',
  suspended: 'bg-destructive/10 text-destructive border-destructive/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
};

const courseStatusStyles: Record<string, string> = {
  published: 'bg-success/10 text-success border-success/20',
  draft: 'bg-muted text-muted-foreground border-border',
  'in-review': 'bg-warning/10 text-warning border-warning/20',
  flagged: 'bg-destructive/10 text-destructive border-destructive/20',
};

const healthStyles: Record<string, { dot: string; label: string; badge: string }> = {
  operational: { dot: 'bg-success', label: 'Operational', badge: 'bg-success/10 text-success border-success/20' },
  degraded: { dot: 'bg-warning', label: 'Degraded', badge: 'bg-warning/10 text-warning border-warning/20' },
  down: { dot: 'bg-destructive', label: 'Down', badge: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const roleStyles: Record<UserRole, string> = {
  student: 'bg-info/10 text-info border-info/20',
  instructor: 'bg-primary/10 text-primary border-primary/20',
  admin: 'bg-warning/10 text-warning border-warning/20',
};

export function AdminDashboard() {
  const flaggedCourses = adminCourses.filter((c) => c.status === 'flagged');
  const pendingUsers = adminUsers.filter((u) => u.status === 'pending');
  const degradedServices = systemHealth.filter((s) => s.status !== 'operational');

  return (
    <div className="space-y-8 animate-in-slide">
      <PageHeader
        title="Admin Dashboard"
        description="Platform overview, user management, and system health."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
            <Button size="sm">
              <Shield className="mr-2 h-4 w-4" />
              Audit log
            </Button>
          </>
        }
      />

      {/* Alert banners */}
      {(flaggedCourses.length > 0 || degradedServices.length > 0 || pendingUsers.length > 0) && (
        <div className="grid gap-3 sm:grid-cols-3">
          {flaggedCourses.length > 0 && (
            <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{flaggedCourses.length} course(s) flagged</p>
                <p className="text-xs text-muted-foreground">Review for content violations</p>
              </div>
            </div>
          )}
          {pendingUsers.length > 0 && (
            <div className="flex items-center gap-3 rounded-lg border border-warning/20 bg-warning/5 px-4 py-3">
              <Clock className="h-5 w-5 shrink-0 text-warning" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{pendingUsers.length} user(s) pending</p>
                <p className="text-xs text-muted-foreground">Awaiting account approval</p>
              </div>
            </div>
          )}
          {degradedServices.length > 0 && (
            <div className="flex items-center gap-3 rounded-lg border border-warning/20 bg-warning/5 px-4 py-3">
              <Server className="h-5 w-5 shrink-0 text-warning" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{degradedServices.length} service(s) degraded</p>
                <p className="text-xs text-muted-foreground">Check system health below</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Platform stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {platformStats.map((stat) => {
          const Icon = platformStatIcons[stat.icon] ?? Activity;
          return (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              icon={Icon}
              accent="primary"
              trend={{
                value: `${stat.change > 0 ? '+' : ''}${stat.change}%`,
                positive: stat.change >= 0,
              }}
            />
          );
        })}
      </div>

      {/* User growth + category distribution */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">User growth</CardTitle>
            <CardDescription>Total registered users over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={userGrowthData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--info))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--info))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [formatNumber(value), 'Users']}
                />
                <Area
                  type="monotone"
                  dataKey="students"
                  stroke="hsl(var(--info))"
                  strokeWidth={2}
                  fill="url(#userGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Course categories</CardTitle>
            <CardDescription>Distribution by topic</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={categoryDistribution} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [`${value} courses`, '']}
                />
                <Bar dataKey="courses" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* User management table */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">User management</CardTitle>
            <CardDescription>All registered users on the platform</CardDescription>
          </div>
          <Input placeholder="Search users…" className="max-w-xs" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Courses</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-6 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {adminUsers.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-accent/40">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={user.avatarUrl} alt={user.name} />
                          <AvatarFallback className="text-xs">{initials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{user.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={cn('capitalize', roleStyles[user.role])}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={cn('capitalize', userStatusStyles[user.status])}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {user.coursesEnrolled}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {relativeTime(user.joinedAt)}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {user.status === 'pending' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-success" title="Approve">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {user.status === 'active' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" title="Suspend">
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="More">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Course oversight + System health */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Course oversight</CardTitle>
            <CardDescription>All courses on the platform</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Course</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Students</th>
                    <th className="px-4 py-3 text-right font-medium">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {adminCourses.map((course) => (
                    <tr key={course.id} className="transition-colors hover:bg-accent/40">
                      <td className="px-4 py-3">
                        <p className="truncate font-medium text-foreground">{course.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{course.instructor}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={cn('capitalize', courseStatusStyles[course.status])}>
                          {course.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                        {formatNumber(course.students)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                        {course.rating > 0 ? course.rating.toFixed(1) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-primary" />
              System health
            </CardTitle>
            <CardDescription>Real-time service status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {systemHealth.map((svc) => {
              const cfg = healthStyles[svc.status];
              return (
                <div
                  key={svc.service}
                  className="flex items-center gap-3 rounded-lg border border-border p-3"
                >
                  <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', cfg.dot)} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{svc.service}</p>
                    <p className="text-xs text-muted-foreground">
                      {svc.uptime} uptime · {svc.latency} latency
                    </p>
                  </div>
                  <Badge variant="outline" className={cn('shrink-0', cfg.badge)}>
                    {cfg.label}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
