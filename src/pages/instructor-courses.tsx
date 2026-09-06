import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  MoreVertical,
  BookOpen,
  Users,
  Star,
  Eye,
  Edit,
  Trash2,
  BarChart2,
  Sparkles,
  X,
  Layers,
  Video,
  FileText,
  Upload as UploadIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Lecture {
  id: string;
  title: string;
  videoFile: File | null;
  pdfFile: File | null;
}

interface ModuleItem {
  id: string;
  title: string;
  isFreePreview: boolean;
  lectures: Lecture[];
}

interface CourseItem {
  id: string;
  title: string;
  category: string;
  status: string;
  students: number;
  rating: number;
  reviewsCount: number;
  priceType: 'free' | 'paid' | 'freemium';
  price: string;
  lessons: number;
  image: string;
}

const initialCourses: CourseItem[] = [
  {
    id: 'c1',
    title: 'Complete Web Development Bootcamp 2026',
    category: 'Development',
    status: 'Published',
    students: 12450,
    rating: 4.8,
    reviewsCount: 1820,
    priceType: 'paid',
    price: '৳4,500',
    lessons: 142,
    image: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'c2',
    title: 'Advanced React & Next.js Architecture',
    category: 'Frontend',
    status: 'Published',
    students: 8960,
    rating: 4.9,
    reviewsCount: 940,
    priceType: 'paid',
    price: '৳5,200',
    lessons: 88,
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'c3',
    title: 'UI/UX Design Masterclass with Figma',
    category: 'Design',
    status: 'Draft',
    students: 0,
    rating: 0,
    reviewsCount: 0,
    priceType: 'freemium',
    price: '৳3,800',
    lessons: 45,
    image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'c4',
    title: 'Node.js & Microservices Backend Engineering',
    category: 'Backend',
    status: 'Published',
    students: 4200,
    rating: 4.7,
    reviewsCount: 410,
    priceType: 'paid',
    price: '৳4,900',
    lessons: 96,
    image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600&auto=format&fit=crop&q=80',
  },
];

export function InstructorCoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseItem[]>(initialCourses);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Published' | 'Draft'>('All');

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Development');
  const [newPriceType, setNewPriceType] = useState<'free' | 'paid' | 'freemium'>('paid');
  const [newPrice, setNewPrice] = useState('৳4,000');
  const [coverImage, setCoverImage] = useState<File | null>(null);

  // Edit Modal State
  const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPriceType, setEditPriceType] = useState<'free' | 'paid' | 'freemium'>('paid');
  const [editPrice, setEditPrice] = useState('');
  const [editCoverImage, setEditCoverImage] = useState<File | null>(null);

  // Modules & Lectures State (Shared for create/edit)
  const [modules, setModules] = useState<ModuleItem[]>([
    {
      id: 'm-1',
      title: 'Introduction & Setup',
      isFreePreview: true,
      lectures: [
        { id: 'l-1', title: 'Welcome & Overview', videoFile: null, pdfFile: null },
      ],
    },
  ]);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteCourse = (id: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      setCourses((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleOpenEdit = (course: CourseItem) => {
    setEditingCourse(course);
    setEditTitle(course.title);
    setEditCategory(course.category);
    setEditPriceType(course.priceType);
    setEditPrice(course.price);
    setEditCoverImage(null);
    setModules([
      {
        id: 'm-1',
        title: 'Course Curriculum',
        isFreePreview: course.priceType === 'free',
        lectures: [{ id: 'l-1', title: 'Introduction Lecture', videoFile: null, pdfFile: null }],
      },
    ]);
  };

  // Module actions
  const addModule = () => {
    setModules([
      ...modules,
      {
        id: `m-${Date.now()}`,
        title: `Module ${modules.length + 1}`,
        isFreePreview: false,
        lectures: [{ id: `l-${Date.now()}`, title: 'Lecture 1', videoFile: null, pdfFile: null }],
      },
    ]);
  };

  const removeModule = (moduleId: string) => {
    setModules(modules.filter((m) => m.id !== moduleId));
  };

  const updateModuleTitle = (moduleId: string, title: string) => {
    setModules(modules.map((m) => (m.id === moduleId ? { ...m, title } : m)));
  };

  const toggleModulePreview = (moduleId: string) => {
    setModules(
      modules.map((m) => (m.id === moduleId ? { ...m, isFreePreview: !m.isFreePreview } : m))
    );
  };

  // Lecture actions
  const addLecture = (moduleId: string) => {
    setModules(
      modules.map((m) => {
        if (m.id === moduleId) {
          return {
            ...m,
            lectures: [
              ...m.lectures,
              {
                id: `l-${Date.now()}`,
                title: `Lecture ${m.lectures.length + 1}`,
                videoFile: null,
                pdfFile: null,
              },
            ],
          };
        }
        return m;
      })
    );
  };

  const removeLecture = (moduleId: string, lectureId: string) => {
    setModules(
      modules.map((m) => {
        if (m.id === moduleId) {
          return {
            ...m,
            lectures: m.lectures.filter((l) => l.id !== lectureId),
          };
        }
        return m;
      })
    );
  };

  const updateLectureTitle = (moduleId: string, lectureId: string, title: string) => {
    setModules(
      modules.map((m) => {
        if (m.id === moduleId) {
          return {
            ...m,
            lectures: m.lectures.map((l) => (l.id === lectureId ? { ...l, title } : l)),
          };
        }
        return m;
      })
    );
  };

  const updateLectureFile = (
    moduleId: string,
    lectureId: string,
    fileType: 'videoFile' | 'pdfFile',
    file: File | null
  ) => {
    setModules(
      modules.map((m) => {
        if (m.id === moduleId) {
          return {
            ...m,
            lectures: m.lectures.map((l) =>
              l.id === lectureId ? { ...l, [fileType]: file } : l
            ),
          };
        }
        return m;
      })
    );
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const totalLessonsCount = modules.reduce((acc, m) => acc + m.lectures.length, 0);
    const imageUrl = coverImage
      ? URL.createObjectURL(coverImage)
      : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80';

    const createdCourse: CourseItem = {
      id: `c-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      status: 'Draft',
      students: 0,
      rating: 0,
      reviewsCount: 0,
      priceType: newPriceType,
      price: newPriceType === 'free' ? 'Free' : (newPrice.startsWith('৳') ? newPrice : `৳${newPrice}`),
      lessons: totalLessonsCount || 1,
      image: imageUrl,
    };

    setCourses([createdCourse, ...courses]);
    setNewTitle('');
    setCoverImage(null);
    setIsCreateModalOpen(false);
  };

  const handleUpdateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse || !editTitle.trim()) return;

    const totalLessonsCount = modules.reduce((acc, m) => acc + m.lectures.length, 0);
    const imageUrl = editCoverImage ? URL.createObjectURL(editCoverImage) : editingCourse.image;

    setCourses(
      courses.map((c) => {
        if (c.id === editingCourse.id) {
          return {
            ...c,
            title: editTitle,
            category: editCategory,
            priceType: editPriceType,
            price: editPriceType === 'free' ? 'Free' : (editPrice.startsWith('৳') ? editPrice : `৳${editPrice}`),
            lessons: totalLessonsCount || c.lessons,
            image: imageUrl,
            status: 'Draft', // Automatically set back to Draft for admin approval after editing
          };
        }
        return c;
      })
    );

    setEditingCourse(null);
  };

  return (
    <div className="space-y-8 p-6 lg:p-8 relative">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            My Courses
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your published courses and drafts. Editing any course will submit it for re-approval.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground shadow hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Course</span>
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground">Total Courses</span>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{courses.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {courses.filter((c) => c.status === 'Published').length} Published
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground">Total Enrolled</span>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {courses.reduce((acc, curr) => acc + curr.students, 0).toLocaleString()}
            </div>
            <p className="text-xs text-emerald-500 font-medium mt-1">+1,240 this month</p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground">Avg. Rating</span>
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">4.8</div>
            <p className="text-xs text-muted-foreground mt-1">Across 3,170 reviews</p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground">Draft Courses</span>
            <Sparkles className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {courses.filter((c) => c.status === 'Draft').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Pending admin approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['All', 'Published', 'Draft'] as const).map((filter) => (
            <Button
              key={filter}
              variant={statusFilter === filter ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(filter)}
              className="text-xs"
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>

      {/* Course Cards Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              className="group flex flex-col overflow-hidden border border-border bg-card transition-all hover:shadow-md"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-muted">
                <img
                  src={course.image}
                  alt={course.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <Badge
                  variant={course.status === 'Published' ? 'default' : 'secondary'}
                  className="absolute left-3 top-3 border-none bg-background/80 font-semibold backdrop-blur"
                >
                  {course.status}
                </Badge>
                <div className="absolute right-3 top-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-background/80 backdrop-blur hover:bg-background"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenEdit(course)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Course
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/instructor/courses/${course.id}/analytics`)}>
                        <BarChart2 className="mr-2 h-4 w-4" />
                        Analytics
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/courses/${course.id}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDeleteCourse(course.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <CardHeader className="flex-1 p-5 pb-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-semibold text-primary">{course.category}</span>
                  <span className="capitalize">{course.priceType}</span>
                </div>
                <CardTitle className="line-clamp-2 text-lg font-bold text-foreground mt-1">
                  {course.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-5 pt-0">
                <div className="flex items-center justify-between border-t border-border/50 pt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    <span>{course.students.toLocaleString()} students</span>
                  </div>
                  {course.rating > 0 ? (
                    <div className="flex items-center gap-1 font-medium text-foreground">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{course.rating}</span>
                    </div>
                  ) : (
                    <span className="italic">No ratings yet</span>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex items-center justify-between border-t border-border bg-muted/20 p-4">
                <span className="text-lg font-extrabold text-foreground">
                  {course.priceType === 'free' ? 'Free' : course.price}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenEdit(course)}
                  className="gap-1.5 text-xs text-primary"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">No courses found</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Try adjusting your search query or filters.
          </p>
        </div>
      )}

      {/* Create Course Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-xl bg-card border border-border p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h3 className="text-lg font-bold text-foreground">Create New Course</h3>
                <p className="text-xs text-muted-foreground">Course will be saved as Draft for admin approval.</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCreateModalOpen(false)}
                className="h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-6 pt-4 overflow-y-auto pr-2 flex-1">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Course Title</label>
                  <Input
                    required
                    placeholder="e.g. Masterclass in TypeScript"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Development">Development</option>
                      <option value="Frontend">Frontend</option>
                      <option value="Backend">Backend</option>
                      <option value="Design">Design</option>
                      <option value="AI & Data">AI & Data</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Pricing Structure</label>
                    <select
                      value={newPriceType}
                      onChange={(e) => {
                        const val = e.target.value as 'free' | 'paid' | 'freemium';
                        setNewPriceType(val);
                        if (val === 'free') {
                          setModules(modules.map((m) => ({ ...m, isFreePreview: true })));
                        }
                      }}
                      className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="paid">Paid (Full)</option>
                      <option value="free">Free Course</option>
                      <option value="freemium">Freemium (Select Free Modules)</option>
                    </select>
                  </div>
                </div>

                {newPriceType !== 'free' && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Price (৳)</label>
                    <Input
                      required
                      placeholder="e.g. ৳4,500"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <UploadIcon className="h-3.5 w-3.5" /> Cover Picture (from device)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                    className="mt-1.5 block w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </div>
              </div>

              {/* Modules & Lectures */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-primary" /> Curriculum
                  </h4>
                  <Button type="button" size="sm" variant="outline" onClick={addModule} className="gap-1">
                    <Plus className="h-3.5 w-3.5" /> Add Module
                  </Button>
                </div>

                <div className="space-y-4">
                  {modules.map((mod, modIdx) => (
                    <div key={mod.id} className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-xs font-bold text-muted-foreground">#{modIdx + 1}</span>
                          <Input
                            value={mod.title}
                            onChange={(e) => updateModuleTitle(mod.id, e.target.value)}
                            placeholder="Module Title"
                            className="h-8 text-sm font-medium"
                          />
                        </div>

                        {newPriceType === 'freemium' && (
                          <Button
                            type="button"
                            size="sm"
                            variant={mod.isFreePreview ? 'default' : 'outline'}
                            onClick={() => toggleModulePreview(mod.id)}
                            className="text-xs h-8 shrink-0"
                          >
                            {mod.isFreePreview ? 'Free Preview' : 'Paid Locked'}
                          </Button>
                        )}

                        {modules.length > 1 && (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => removeModule(mod.id)}
                            className="h-8 w-8 text-destructive shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="pl-4 space-y-2 border-l-2 border-primary/20">
                        {mod.lectures.map((lec, lecIdx) => (
                          <div key={lec.id} className="rounded-md border border-border/60 bg-card p-3 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1">
                                <span className="text-[11px] text-muted-foreground font-semibold">L{lecIdx + 1}</span>
                                <Input
                                  value={lec.title}
                                  onChange={(e) => updateLectureTitle(mod.id, lec.id, e.target.value)}
                                  placeholder="Lecture Title"
                                  className="h-7 text-xs"
                                />
                              </div>
                              {mod.lectures.length > 1 && (
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => removeLecture(mod.id, lec.id)}
                                  className="h-7 w-7 text-destructive"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                              <div className="flex items-center gap-1.5 bg-muted/50 p-1.5 rounded border border-border/40">
                                <Video className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                                <span className="truncate flex-1">
                                  {lec.videoFile ? lec.videoFile.name : 'Upload Video'}
                                </span>
                                <input
                                  type="file"
                                  accept="video/*"
                                  onChange={(e) =>
                                    updateLectureFile(mod.id, lec.id, 'videoFile', e.target.files?.[0] || null)
                                  }
                                  className="hidden"
                                  id={`vid-create-${lec.id}`}
                                />
                                <label
                                  htmlFor={`vid-create-${lec.id}`}
                                  className="cursor-pointer font-semibold text-primary hover:underline"
                                >
                                  Browse
                                </label>
                              </div>

                              <div className="flex items-center gap-1.5 bg-muted/50 p-1.5 rounded border border-border/40">
                                <FileText className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                <span className="truncate flex-1">
                                  {lec.pdfFile ? lec.pdfFile.name : 'Upload PDF / Material'}
                                </span>
                                <input
                                  type="file"
                                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                                  onChange={(e) =>
                                    updateLectureFile(mod.id, lec.id, 'pdfFile', e.target.files?.[0] || null)
                                  }
                                  className="hidden"
                                  id={`pdf-create-${lec.id}`}
                                />
                                <label
                                  htmlFor={`pdf-create-${lec.id}`}
                                  className="cursor-pointer font-semibold text-primary hover:underline"
                                >
                                  Browse
                                </label>
                              </div>
                            </div>
                          </div>
                        ))}

                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => addLecture(mod.id)}
                          className="text-xs h-7 text-primary gap-1 mt-1"
                        >
                          <Plus className="h-3 w-3" /> Add Lecture
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border sticky bottom-0 bg-card py-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Submit for Approval</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-xl bg-card border border-border p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h3 className="text-lg font-bold text-foreground">Edit Course: {editingCourse.title}</h3>
                <p className="text-xs text-amber-500 font-medium">⚠️ Editing will reset course status to Draft for admin re-approval.</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingCourse(null)}
                className="h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleUpdateCourse} className="space-y-6 pt-4 overflow-y-auto pr-2 flex-1">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Course Title</label>
                  <Input
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Category</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Development">Development</option>
                      <option value="Frontend">Frontend</option>
                      <option value="Backend">Backend</option>
                      <option value="Design">Design</option>
                      <option value="AI & Data">AI & Data</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Pricing Structure</label>
                    <select
                      value={editPriceType}
                      onChange={(e) => {
                        const val = e.target.value as 'free' | 'paid' | 'freemium';
                        setEditPriceType(val);
                        if (val === 'free') {
                          setModules(modules.map((m) => ({ ...m, isFreePreview: true })));
                        }
                      }}
                      className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="paid">Paid (Full)</option>
                      <option value="free">Free Course</option>
                      <option value="freemium">Freemium (Select Free Modules)</option>
                    </select>
                  </div>
                </div>

                {editPriceType !== 'free' && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Price (৳)</label>
                    <Input
                      required
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <UploadIcon className="h-3.5 w-3.5" /> Replace Cover Picture (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditCoverImage(e.target.files?.[0] || null)}
                    className="mt-1.5 block w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </div>
              </div>

              {/* Modules & Lectures */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-primary" /> Curriculum Updates
                  </h4>
                  <Button type="button" size="sm" variant="outline" onClick={addModule} className="gap-1">
                    <Plus className="h-3.5 w-3.5" /> Add Module
                  </Button>
                </div>

                <div className="space-y-4">
                  {modules.map((mod, modIdx) => (
                    <div key={mod.id} className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-xs font-bold text-muted-foreground">#{modIdx + 1}</span>
                          <Input
                            value={mod.title}
                            onChange={(e) => updateModuleTitle(mod.id, e.target.value)}
                            placeholder="Module Title"
                            className="h-8 text-sm font-medium"
                          />
                        </div>

                        {editPriceType === 'freemium' && (
                          <Button
                            type="button"
                            size="sm"
                            variant={mod.isFreePreview ? 'default' : 'outline'}
                            onClick={() => toggleModulePreview(mod.id)}
                            className="text-xs h-8 shrink-0"
                          >
                            {mod.isFreePreview ? 'Free Preview' : 'Paid Locked'}
                          </Button>
                        )}

                        {modules.length > 1 && (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => removeModule(mod.id)}
                            className="h-8 w-8 text-destructive shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="pl-4 space-y-2 border-l-2 border-primary/20">
                        {mod.lectures.map((lec, lecIdx) => (
                          <div key={lec.id} className="rounded-md border border-border/60 bg-card p-3 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1">
                                <span className="text-[11px] text-muted-foreground font-semibold">L{lecIdx + 1}</span>
                                <Input
                                  value={lec.title}
                                  onChange={(e) => updateLectureTitle(mod.id, lec.id, e.target.value)}
                                  placeholder="Lecture Title"
                                  className="h-7 text-xs"
                                />
                              </div>
                              {mod.lectures.length > 1 && (
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => removeLecture(mod.id, lec.id)}
                                  className="h-7 w-7 text-destructive"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                              <div className="flex items-center gap-1.5 bg-muted/50 p-1.5 rounded border border-border/40">
                                <Video className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                                <span className="truncate flex-1">
                                  {lec.videoFile ? lec.videoFile.name : 'Upload Video'}
                                </span>
                                <input
                                  type="file"
                                  accept="video/*"
                                  onChange={(e) =>
                                    updateLectureFile(mod.id, lec.id, 'videoFile', e.target.files?.[0] || null)
                                  }
                                  className="hidden"
                                  id={`vid-edit-${lec.id}`}
                                />
                                <label
                                  htmlFor={`vid-edit-${lec.id}`}
                                  className="cursor-pointer font-semibold text-primary hover:underline"
                                >
                                  Browse
                                </label>
                              </div>

                              <div className="flex items-center gap-1.5 bg-muted/50 p-1.5 rounded border border-border/40">
                                <FileText className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                <span className="truncate flex-1">
                                  {lec.pdfFile ? lec.pdfFile.name : 'Upload PDF / Material'}
                                </span>
                                <input
                                  type="file"
                                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                                  onChange={(e) =>
                                    updateLectureFile(mod.id, lec.id, 'pdfFile', e.target.files?.[0] || null)
                                  }
                                  className="hidden"
                                  id={`pdf-edit-${lec.id}`}
                                />
                                <label
                                  htmlFor={`pdf-edit-${lec.id}`}
                                  className="cursor-pointer font-semibold text-primary hover:underline"
                                >
                                  Browse
                                </label>
                              </div>
                            </div>
                          </div>
                        ))}

                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => addLecture(mod.id)}
                          className="text-xs h-7 text-primary gap-1 mt-1"
                        >
                          <Plus className="h-3 w-3" /> Add Lecture
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border sticky bottom-0 bg-card py-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingCourse(null)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save & Submit for Re-Approval</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}