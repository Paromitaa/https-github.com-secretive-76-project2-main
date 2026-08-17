import { useState, useMemo } from 'react';
import { BookOpen, Search, Clock, CheckCircle2, PlayCircle, Circle, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { CourseCard } from '@/components/common/course-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { courses } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

type FilterKey = 'all' | 'in-progress' | 'completed' | 'not-started';

const filters: { key: FilterKey; label: string; icon: typeof BookOpen }[] = [
  { key: 'all', label: 'All', icon: BookOpen },
  { key: 'in-progress', label: 'In progress', icon: PlayCircle },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 },
  { key: 'not-started', label: 'Not started', icon: Circle },
];

export function MyCoursesPage() {
  const [filter, setFilter] = useState<FilterKey>('all');
  const [search, setSearch] = useState('');

  const enrolledCourses = useMemo(
    () => courses.filter((c) => c.status !== 'not-started' || c.progress > 0),
    []
  );

  const allCourses = useMemo(() => courses, []);

  const filtered = useMemo(() => {
    const source = filter === 'all' ? allCourses : enrolledCourses.filter((c) => c.status === filter);
    if (!search.trim()) return source;
    return source.filter((c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    );
  }, [filter, search, allCourses, enrolledCourses]);

  const counts = useMemo(
    () => ({
      all: allCourses.length,
      'in-progress': enrolledCourses.filter((c) => c.status === 'in-progress').length,
      completed: enrolledCourses.filter((c) => c.status === 'completed').length,
      'not-started': allCourses.filter((c) => c.status === 'not-started').length,
    }),
    [allCourses, enrolledCourses]
  );

  return (
    <div className="space-y-8 animate-in-slide">
      <PageHeader
        title="My Courses"
        description="Courses you're enrolled in, organized by progress."
      />

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <QuickStat icon={BookOpen} label="Enrolled" value={enrolledCourses.length} accent="text-primary bg-primary/10" />
        <QuickStat icon={PlayCircle} label="In progress" value={counts['in-progress']} accent="text-info bg-info/10" />
        <QuickStat icon={CheckCircle2} label="Completed" value={counts.completed} accent="text-success bg-success/10" />
        <QuickStat
          icon={Clock}
          label="Hours left"
          value={enrolledCourses
            .filter((c) => c.status === 'in-progress')
            .reduce((sum, c) => sum + (c.durationHours * (100 - c.progress)) / 100, 0)
            .toFixed(0)}
          accent="text-warning bg-warning/10"
        />
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterKey)}>
          <TabsList>
            {filters.map((f) => (
              <TabsTrigger key={f.key} value={f.key} className="gap-1.5">
                {f.label}
                <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {counts[f.key]}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Course grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-muted">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">No courses found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {search ? 'Try a different search term.' : 'Browse the catalog to enroll in a course.'}
          </p>
          <Button asChild className="mt-4" size="sm">
            <a href="/student/browse">Browse courses</a>
          </Button>
        </div>
      )}
    </div>
  );
}

function QuickStat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className={cn('grid h-10 w-10 place-items-center rounded-lg', accent)}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground tabular-nums">{value}</p>
      <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
