import { useState } from 'react';
import {
  DollarSign,
  Users,
  Star,
  Plus,
  BarChart3,
  GraduationCap,
  PlayCircle,
  Edit3,
  MoreVertical,
  Trash2,
  ExternalLink,
  Sparkles,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  instructorCourses as initialCourses,
  studentProgress,
  revenueData,
  instructorReviews,
} from '@/lib/dashboard-data';
import { formatNumber, formatCurrency, initials } from '@/lib/format';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface Course {
  id: string;
  title: string;
  category: string;
  status: 'published' | 'draft' | 'in-review';
  students: number;
  rating: number;
  revenue: number;
  completionRate: number;
  thumbnailUrl: string;
}

const statusStyles: Record<string, string> = {
  published: 'bg-success/10 text-success border-success/20',
  draft: 'bg-muted text-muted-foreground border-border',
  'in-review': 'bg-warning/10 text-warning border-warning/20',
};

export function InstructorDashboard() {
  const [courses, setCourses] = useState<Course[]>(
    initialCourses.map((c: any) => ({
      id: c.id ?? `course-${Math.random()}`,
      title: c.title ?? 'Untitled Course',
      category: c.category ?? 'Development',
      status: c.status ?? 'draft',
      students: c.students ?? 0,
      rating: c.rating ?? 0,
      revenue: c.revenue ?? 0,
      completionRate: c.completionRate ?? 0,
      thumbnailUrl: c.thumbnailUrl ?? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60',
    }))
  );
  const [isNewCourseOpen, setIsNewCourseOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  // New Course Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Development');
  const [newPrice, setNewPrice] = useState('49.99');

  const totalStudents = courses.reduce((sum, c) => sum + c.students, 0);
  const totalRevenue = courses.reduce((sum, c) => sum + c.revenue, 0);
  const ratedCourses = courses.filter((c) => c.rating > 0);
  const avgRating = ratedCourses.length > 0 ? ratedCourses.reduce((sum, c) => sum + c.rating, 0) / ratedCourses.length : 0;
  const publishedCourses = courses.filter((c) => c.status === 'published').length;

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Please enter a course title.');
      return;
    }

    const newCourseObj: Course = {
      id: `course-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      status: 'draft',
      students: 0,
      rating: 0,
      revenue: 0,
      completionRate: 0,
      thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60',
    };

    setCourses([newCourseObj, ...courses]);
    setIsNewCourseOpen(false);
    setNewTitle('');
    toast.success('New course draft created successfully!');
  };

  const handleDeleteCourse = (id: string) => {
    setCourses(courses.filter((c) => c.id !== id));
    toast.success('Course removed successfully.');
  };

  return (
    <div className="space-y-8 animate-in-slide">
      <PageHeader
        title="Instructor Dashboard"
        description="Track course performance, student engagement, and revenue."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsAnalyticsOpen(true)}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Button>
            <Button size="sm" onClick={() => setIsNewCourseOpen(true)} className="bg-indigo hover:bg-indigo/90 text-indigo-foreground">
              <Plus className="mr-2 h-4 w-4" />
              New course
            </Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total students"
          value={formatNumber(totalStudents)}
          icon={Users}
          accent="primary"
          trend={{ value: '+1,240 this month', positive: true }}
        />
        <StatCard
          label="Total revenue"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          accent="success"
          trend={{ value: '+18.7% MoM', positive: true }}
        />
        <StatCard
          label="Avg. rating"
          value={avgRating.toFixed(1)}
          icon={Star}
          accent="warning"
          trend={{ value: 'Across all courses', positive: true }}
        />
        <StatCard
          label="Published courses"
          value={publishedCourses}
          icon={GraduationCap}
          accent="info"
          trend={{ value: `${courses.filter(c => c.status !== 'published').length} in review/draft`, positive: false }}
        />
      </div>

      {/* Revenue chart + top course */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Revenue overview</CardTitle>
            <CardDescription>Last 7 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={revenueData} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
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
                  tickFormatter={(v) => `$${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#revGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top course</CardTitle>
            <CardDescription>By enrollment</CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const top = courses.length > 0 ? courses[0] : null;
              if (!top) return <p className="text-sm text-muted-foreground py-8 text-center">No courses available.</p>;
              return (
                <div className="space-y-4">
                  <div className="relative aspect-video overflow-hidden rounded-lg">
                    <img src={top.thumbnailUrl} alt={top.title} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 grid place-items-center bg-black/30">
                      <PlayCircle className="h-10 w-10 text-background/90" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{top.title}</h3>
                    <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {formatNumber(top.students)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-warning text-warning" />
                        {top.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {formatCurrency(top.revenue)}
                      </span>
                    </div>
                    <div className="mt-3">
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Completion rate</span>
                        <span className="font-medium text-foreground">{top.completionRate}%</span>
                      </div>
                      <Progress value={top.completionRate} className="h-1.5" />
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      {/* Course management table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your courses</CardTitle>
          <CardDescription>Performance across all published and draft courses</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Course</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Students</th>
                  <th className="px-4 py-3 text-right font-medium">Rating</th>
                  <th className="px-4 py-3 text-right font-medium">Revenue</th>
                  <th className="px-4 py-3 text-right font-medium">Completion</th>
                  <th className="px-6 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {courses.map((course) => (
                  <tr key={course.id} className="transition-colors hover:bg-accent/40">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="h-10 w-16 shrink-0 rounded-md object-cover"
                        />
                        <span className="font-medium text-foreground">{course.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={cn('capitalize', statusStyles[course.status])}>
                        {course.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {formatNumber(course.students)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {course.rating > 0 ? (
                        <span className="flex items-center justify-end gap-1">
                          <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                          {course.rating}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium text-foreground">
                      {course.revenue > 0 ? formatCurrency(course.revenue) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {course.completionRate > 0 ? (
                        <span className="text-muted-foreground">{course.completionRate}%</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toast.success(`Opening editor for ${course.title}`)}>
                            <Edit3 className="mr-2 h-4 w-4" /> Edit Course
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success(`Previewing ${course.title}`)}>
                            <ExternalLink className="mr-2 h-4 w-4" /> Preview Live
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteCourse(course.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Course
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Students + Reviews */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Student progress</CardTitle>
            <CardDescription>Recently active students across your courses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {studentProgress.map((student) => (
              <div
                key={student.id}
                className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-accent/50"
              >
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage src={student.avatarUrl} alt={student.name} />
                  <AvatarFallback className="text-xs">{initials(student.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{student.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{student.course}</p>
                </div>
                <div className="hidden w-24 sm:block">
                  <Progress value={student.progress} className="h-1.5" />
                </div>
                <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
                  {student.progress}%
                </span>
                <span className="hidden w-16 text-right text-xs text-muted-foreground sm:block">
                  {student.lastActive}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent reviews</CardTitle>
            <CardDescription>What students are saying</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {instructorReviews.map((review) => (
              <div key={review.id} className="flex gap-3">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage src={review.avatarUrl} alt={review.student} />
                  <AvatarFallback className="text-xs">{initials(review.student)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium text-foreground">{review.student}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">{review.date}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{review.course}</p>
                  <div className="mt-1 flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'h-3 w-3',
                          i < review.rating ? 'fill-warning text-warning' : 'text-muted-foreground/30'
                        )}
                      />
                    ))}
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">"{review.comment}"</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* New Course Dialog */}
      <Dialog open={isNewCourseOpen} onOpenChange={setIsNewCourseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>Add a new course to your curriculum catalog.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCourse} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title</Label>
              <Input
                id="title"
                placeholder="e.g., Advanced Full-Stack Architecture"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Development">Development</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="AI & ML">AI & ML</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsNewCourseOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo hover:bg-indigo/90 text-indigo-foreground">
                Create Course Draft
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Analytics Modal */}
      <Dialog open={isAnalyticsOpen} onOpenChange={setIsAnalyticsOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo" /> Detailed Analytics Insights
            </DialogTitle>
            <DialogDescription>Performance metrics across your entire instructor portfolio.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border bg-muted/40 p-3 text-center">
                <p className="text-xs text-muted-foreground">Conversion Rate</p>
                <p className="text-lg font-bold text-foreground mt-1">24.8%</p>
              </div>
              <div className="rounded-xl border bg-muted/40 p-3 text-center">
                <p className="text-xs text-muted-foreground">Active Learners</p>
                <p className="text-lg font-bold text-foreground mt-1">{formatNumber(totalStudents)}</p>
              </div>
              <div className="rounded-xl border bg-muted/40 p-3 text-center">
                <p className="text-xs text-muted-foreground">Retention Rate</p>
                <p className="text-lg font-bold text-foreground mt-1">92.4%</p>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-4 space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-indigo" /> AI Growth Recommendation
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your course <strong>"{courses[0]?.title || 'Top Course'}"</strong> has a high student enrollment rate. Consider adding an advanced module or live Q&A sessions to boost student lifetime value by an estimated 15%.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsAnalyticsOpen(false)}>Close Insights</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}