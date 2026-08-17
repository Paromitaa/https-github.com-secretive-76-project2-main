import { Link } from 'react-router-dom';
import {
  Trophy,
  Clock,
  Flame,
  Zap,
  ArrowRight,
  Sparkles,
  BookOpen,
  Brain,
  CheckCircle2,
  PlayCircle,
  Zap as ZapIcon,
  Award,
  MessageSquare,
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
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PageHeader } from '@/components/common/page-header';
import { StatCard } from '@/components/common/stat-card';
import { CourseCard } from '@/components/common/course-card';
import { EmptyState } from '@/components/common/empty-state';
import { Logo } from '@/components/common/logo';
import {
  currentUser,
  stats,
  courses,
  learningPaths,
  skills,
  achievements,
  recentActivity,
  aiConversations,
  weeklyActivity,
} from '@/lib/mock-data';
import { formatNumber, relativeTime, getIcon, initials } from '@/lib/format';
import { cn } from '@/lib/utils';

const activityIcon = {
  'lesson-completed': { icon: CheckCircle2, class: 'bg-success/10 text-success' },
  'course-started': { icon: PlayCircle, class: 'bg-info/10 text-info' },
  achievement: { icon: Trophy, class: 'bg-warning/10 text-warning' },
  'quiz-passed': { icon: Brain, class: 'bg-primary/10 text-primary' },
  'ai-coaching': { icon: Sparkles, class: 'bg-teal/10 text-teal' },
  streak: { icon: ZapIcon, class: 'bg-destructive/10 text-destructive' },
} as const;

const rarityStyles: Record<string, string> = {
  common: 'border-border bg-muted',
  rare: 'border-info/30 bg-info/5',
  epic: 'border-primary/30 bg-primary/5',
  legendary: 'border-warning/40 bg-warning/5',
};

export function DashboardPage() {
  const inProgress = courses.filter((c) => c.status === 'in-progress');
  const continueCourse = inProgress[0];
  const weeklyPct = Math.round((stats.weeklyAchievedMinutes / stats.weeklyGoalMinutes) * 100);

  return (
    <div className="space-y-8 animate-in-slide">
      <PageHeader
        title={`Welcome back, ${currentUser.name.split(' ')[0]}`}
        description="Pick up where you left off — your AI coach has new insights ready."
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link to="/student/browse">
                <BookOpen className="mr-2 h-4 w-4" />
                Browse
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/student/ai-coach">
                <Sparkles className="mr-2 h-4 w-4" />
                Ask Akademia
              </Link>
            </Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Courses completed"
          value={stats.coursesCompleted}
          icon={Trophy}
          accent="primary"
          trend={{ value: '+2 this month', positive: true }}
        />
        <StatCard
          label="Hours learned"
          value={stats.hoursLearned}
          icon={Clock}
          accent="info"
          trend={{ value: '+8h this week', positive: true }}
        />
        <StatCard
          label="Current streak"
          value={`${stats.currentStreak} days`}
          icon={Flame}
          accent="warning"
          trend={{ value: 'Personal best', positive: true }}
        />
        <StatCard
          label="Skill points"
          value={formatNumber(stats.skillPoints)}
          icon={Zap}
          accent="success"
          trend={{ value: '+420 this week', positive: true }}
        />
      </div>

      {/* Continue learning + weekly goal */}
      <div className="grid gap-4 lg:grid-cols-3">
        {continueCourse && (
          <Card className="relative col-span-1 overflow-hidden lg:col-span-2">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-indigo/5" />
            <CardContent className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
              <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg sm:w-56">
                <img
                  src={continueCourse.thumbnailUrl}
                  alt={continueCourse.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 grid place-items-center bg-black/30">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-background/90 shadow-lg transition-transform hover:scale-110">
                    <PlayCircle className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <Badge className="mb-2 gap-1 bg-primary/10 text-primary hover:bg-primary/10">
                  <Sparkles className="h-3 w-3" />
                  Continue learning
                </Badge>
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  {continueCourse.title}
                </h2>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {continueCourse.subtitle}
                </p>
                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Module 2 · Lesson 2 of 3
                    </span>
                    <span className="font-medium text-foreground">{continueCourse.progress}%</span>
                  </div>
                  <Progress value={continueCourse.progress} className="h-1.5" />
                </div>
                <Button className="mt-4" size="sm" asChild>
                  <Link to={`/student/courses/${continueCourse.slug}`}>
                    Resume lesson
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weekly goal ring */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Weekly goal</CardTitle>
            <CardDescription>Keep your streak alive</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center pt-0">
            <ProgressRing value={weeklyPct} />
            <div className="mt-4 grid w-full grid-cols-7 gap-1">
              {weeklyActivity.map((d, i) => (
                <div key={d.day} className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      'h-12 w-full rounded-md transition-colors',
                      d.minutes > 60
                        ? 'bg-primary'
                        : d.minutes > 30
                        ? 'bg-primary/60'
                        : d.minutes > 0
                        ? 'bg-primary/30'
                        : 'bg-muted'
                    )}
                    style={{ animationDelay: `${i * 40}ms` }}
                  />
                  <span className="text-[10px] text-muted-foreground">{d.day[0]}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              {stats.weeklyAchievedMinutes} / {stats.weeklyGoalMinutes} min this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* In progress courses */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            In progress
          </h2>
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
            <Link to="/student/my-courses">
              View all
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {inProgress.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      </section>

      {/* AI coach + activity */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* AI conversations */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div className="space-y-1.5">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-teal" />
                AI Coach
              </CardTitle>
              <CardDescription>Recent conversations</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/student/ai-coach">New</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {aiConversations.map((conv) => (
              <Link
                key={conv.id}
                to="/student/ai-coach"
                className="group flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-accent"
              >
                <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground group-hover:text-primary">
                    {conv.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{conv.preview}</p>
                </div>
                <span className="shrink-0 text-[10px] text-muted-foreground">
                  {relativeTime(conv.lastMessageAt)}
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
            <CardDescription>Your learning timeline</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="relative space-y-1">
              {recentActivity.map((act, i) => {
                const cfg = activityIcon[act.type];
                const Icon = cfg.icon;
                return (
                  <li key={act.id} className="relative flex gap-3 pb-4 last:pb-0">
                    {i < recentActivity.length - 1 && (
                      <span className="absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-px bg-border" />
                    )}
                    <div className={cn('z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full', cfg.class)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="text-sm font-medium text-foreground">{act.title}</p>
                      <p className="text-xs text-muted-foreground">{act.detail}</p>
                    </div>
                    <span className="shrink-0 pt-0.5 text-xs text-muted-foreground">
                      {relativeTime(act.timestamp)}
                    </span>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* Learning paths */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Your learning paths
          </h2>
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
            <Link to="/student/paths">
              View all
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {learningPaths.map((path) => (
            <Link
              key={path.id}
              to={`/student/paths/${path.slug}`}
              className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-foreground/5"
            >
              <div className="relative h-28 overflow-hidden">
                <img
                  src={path.thumbnailUrl}
                  alt={path.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                {path.aiGenerated && (
                  <Badge className="absolute right-3 top-3 gap-1 border-0 bg-background/90 backdrop-blur">
                    <Sparkles className="h-3 w-3 text-teal" />
                    AI-curated
                  </Badge>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary">
                  {path.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {path.description}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{path.courseCount} courses · {path.estimatedWeeks}w</span>
                  <span className="font-medium text-foreground">{path.progress}%</span>
                </div>
                <Progress value={path.progress} className="mt-2 h-1.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Skills + Achievements */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Skill progress</CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
              <Link to="/student/skills">Details</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {skills.slice(0, 5).map((skill) => (
              <div key={skill.id}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{skill.name}</span>
                  <span className="text-muted-foreground tabular-nums">{skill.proficiency}%</span>
                </div>
                <Progress value={skill.proficiency} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Achievements</CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
              <Link to="/student/achievements">All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {achievements.map((ach) => {
                const Icon = getIcon(ach.icon);
                return (
                  <div
                    key={ach.id}
                    className={cn(
                      'flex items-center gap-3 rounded-lg border p-3 transition-transform hover:scale-[1.02]',
                      rarityStyles[ach.rarity]
                    )}
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-background">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{ach.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{ach.description}</p>
                    </div>
                    <Award className="h-3.5 w-3.5 shrink-0 text-warning" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Design system footer showcase */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <Logo size="lg" showWordmark={false} />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Design system ready</p>
            <p className="text-xs text-muted-foreground">
              Navbar, sidebar, theme toggle, toasts, skeletons, empty states, and routing are all wired up.
            </p>
          </div>
          <EmptyState
            icon={Sparkles}
            title="This is an empty state"
            description="Used when there's nothing to show yet — with an optional action below."
            action={
              <Button size="sm" variant="outline">
                Example action
              </Button>
            }
            className="w-full max-w-md border-0 bg-transparent py-0"
          />
        </CardContent>
      </Card>
    </div>
  );
}

function ProgressRing({ value }: { value: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative grid h-24 w-24 place-items-center">
      <svg className="h-24 w-24 -rotate-90" viewBox="0 0 88 88">
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="6"
        />
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-lg font-semibold tabular-nums text-foreground">
        {value}%
      </span>
    </div>
  );
}
