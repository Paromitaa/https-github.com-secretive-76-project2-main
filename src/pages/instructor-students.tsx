import { useState } from 'react';
import { Search, Mail, BookOpen, CheckCircle2, User, Clock, Award, FileText, ChevronRight, Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface ModuleProgress {
  moduleName: string;
  hoursSpent: number;
  completedLectures: number;
  totalLectures: number;
}

interface Submission {
  id: string;
  title: string;
  type: 'Quiz' | 'Lab' | 'Assignment';
  score: string;
  submittedDate: string;
  status: 'Graded' | 'Pending';
}

interface ChatMessage {
  id: string;
  sender: 'instructor' | 'student';
  text: string;
  timestamp: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  enrolledCourse: string;
  progress: number;
  totalHoursSpent: number;
  lastActive: string;
  status: 'active' | 'completed' | 'at-risk';
  modules: ModuleProgress[];
  submissions: Submission[];
  messages: ChatMessage[];
}

const initialStudents: Student[] = [
  {
    id: 'stud_1',
    name: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    enrolledCourse: 'Transformers from Scratch',
    progress: 78,
    totalHoursSpent: 14.5,
    lastActive: '2 hours ago',
    status: 'active',
    modules: [
      { moduleName: 'Module 1: Attention Mechanism Intro', hoursSpent: 4.5, completedLectures: 5, totalLectures: 5 },
      { moduleName: 'Module 2: Multi-Head Attention & Code', hoursSpent: 6.0, completedLectures: 4, totalLectures: 6 },
      { moduleName: 'Module 3: Positional Encodings', hoursSpent: 4.0, completedLectures: 2, totalLectures: 4 },
    ],
    submissions: [
      { id: 'sub_1', title: 'Attention Quiz 1', type: 'Quiz', score: '92%', submittedDate: 'Aug 12, 2026', status: 'Graded' },
      { id: 'sub_2', title: 'Decoder Stack Lab', type: 'Lab', score: '85/100', submittedDate: 'Aug 15, 2026', status: 'Graded' },
      { id: 'sub_3', title: 'Transformer Final Project', type: 'Assignment', score: '-', submittedDate: 'Aug 18, 2026', status: 'Pending' },
    ],
    messages: [
      { id: 'm_1', sender: 'instructor', text: 'Hi Alex, great work on the Multi-Head attention code. Make sure to review positional encodings before the lab.', timestamp: 'Yesterday, 10:30 AM' },
      { id: 'm_2', sender: 'student', text: 'Thank you Professor! I will go through Module 3 videos tonight.', timestamp: 'Yesterday, 11:15 AM' },
    ],
  },
  {
    id: 'stud_2',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    enrolledCourse: 'Production LLM Applications',
    progress: 100,
    totalHoursSpent: 22.0,
    lastActive: 'Yesterday',
    status: 'completed',
    modules: [
      { moduleName: 'Module 1: RAG Architecture', hoursSpent: 7.0, completedLectures: 6, totalLectures: 6 },
      { moduleName: 'Module 2: Vector Databases & Retrieval', hoursSpent: 8.0, completedLectures: 8, totalLectures: 8 },
      { moduleName: 'Module 3: Agentic Workflows', hoursSpent: 7.0, completedLectures: 5, totalLectures: 5 },
    ],
    submissions: [
      { id: 'sub_4', title: 'RAG Pipeline Quiz', type: 'Quiz', score: '98%', submittedDate: 'Aug 10, 2026', status: 'Graded' },
      { id: 'sub_5', title: 'LangChain Deployment Lab', type: 'Lab', score: '100/100', submittedDate: 'Aug 14, 2026', status: 'Graded' },
    ],
    messages: [
      { id: 'm_3', sender: 'instructor', text: 'Congratulations on completing the entire course Sarah!', timestamp: 'Aug 14, 4:00 PM' },
    ],
  },
  {
    id: 'stud_3',
    name: 'Marcus Chen',
    email: 'marcus.c@example.com',
    enrolledCourse: 'Transformers from Scratch',
    progress: 24,
    totalHoursSpent: 3.5,
    lastActive: '5 days ago',
    status: 'at-risk',
    modules: [
      { moduleName: 'Module 1: Attention Mechanism Intro', hoursSpent: 3.5, completedLectures: 2, totalLectures: 5 },
      { moduleName: 'Module 2: Multi-Head Attention & Code', hoursSpent: 0, completedLectures: 0, totalLectures: 6 },
    ],
    submissions: [
      { id: 'sub_6', title: 'Attention Quiz 1', type: 'Quiz', score: '60%', submittedDate: 'Aug 05, 2026', status: 'Graded' },
    ],
    messages: [
      { id: 'm_4', sender: 'instructor', text: 'Marcus, I noticed you have been inactive for a few days. Do you need any help catching up with Module 1?', timestamp: 'Aug 15, 9:00 AM' },
    ],
  },
  {
    id: 'stud_4',
    name: 'Elena Rostova',
    email: 'elena.r@example.com',
    enrolledCourse: 'Advanced React Architecture',
    progress: 65,
    totalHoursSpent: 11.2,
    lastActive: '3 hours ago',
    status: 'active',
    modules: [
      { moduleName: 'Module 1: Custom Hooks & Patterns', hoursSpent: 5.0, completedLectures: 4, totalLectures: 4 },
      { moduleName: 'Module 2: State Machines & XState', hoursSpent: 6.2, completedLectures: 3, totalLectures: 5 },
    ],
    submissions: [
      { id: 'sub_7', title: 'Hooks Architecture Quiz', type: 'Quiz', score: '88%', submittedDate: 'Aug 11, 2026', status: 'Graded' },
    ],
    messages: [],
  },
];

export function InstructorStudentsPage() {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [newChatText, setNewChatText] = useState('');

  const filteredStudents = students.filter((stud) =>
    stud.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stud.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stud.enrolledCourse.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDetail = (student: Student) => {
    setActiveStudent(student);
    setIsDetailOpen(true);
  };

  const handleOpenChat = (e: React.MouseEvent, student: Student) => {
    e.stopPropagation();
    setActiveStudent(student);
    setIsChatOpen(true);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim() || !activeStudent) return;

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'instructor',
      text: newChatText.trim(),
      timestamp: 'Just now',
    };

    const updatedStudents = students.map((s) => {
      if (s.id === activeStudent.id) {
        const updated = { ...s, messages: [...s.messages, newMessage] };
        setActiveStudent(updated);
        return updated;
      }
      return s;
    });

    setStudents(updatedStudents);
    setNewChatText('');
    toast.success('Instruction / message sent to student.');
  };

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Students</h1>
        <p className="text-muted-foreground mt-1">
          Click any student card to inspect detailed learning hours, module progress, grades, and dedicated chat history.
        </p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search students or courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{students.length}</span> Enrolled Students
        </div>
      </div>

      <div className="grid gap-4">
        {filteredStudents.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center">
            <User className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <h3 className="text-lg font-semibold">No students found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Try searching with a different name or course keyword.
            </p>
          </Card>
        ) : (
          filteredStudents.map((stud) => (
            <Card
              key={stud.id}
              onClick={() => handleOpenDetail(stud)}
              className="cursor-pointer transition-all hover:border-indigo/50 hover:bg-card/80 group"
            >
              <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-base group-hover:text-indigo transition-colors">{stud.name}</span>
                    <span className="text-xs text-muted-foreground">({stud.email})</span>
                    {stud.status === 'completed' && (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/25 gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Completed
                      </Badge>
                    )}
                    {stud.status === 'active' && (
                      <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 border-indigo-500/25">
                        Active
                      </Badge>
                    )}
                    {stud.status === 'at-risk' && (
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/25">
                        Needs Attention
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5 font-medium text-foreground">
                      <BookOpen className="h-4 w-4 text-indigo" />
                      {stud.enrolledCourse}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {stud.totalHoursSpent} hrs invested
                    </span>
                    <span>•</span>
                    <span>Last active: {stud.lastActive}</span>
                  </div>

                  <div className="space-y-1 max-w-md pt-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Course Progress</span>
                      <span className="font-medium">{stud.progress}%</span>
                    </div>
                    <Progress value={stud.progress} className="h-2" />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleOpenChat(e, stud)}
                    className="gap-1.5"
                  >
                    <MessageSquare className="h-4 w-4 text-indigo" /> Chat ({stud.messages.length})
                  </Button>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Detailed Student Modal / Drawer */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {activeStudent && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-indigo/10 flex items-center justify-center text-indigo font-bold text-lg">
                      {activeStudent.name.charAt(0)}
                    </div>
                    <div>
                      <DialogTitle className="text-xl">{activeStudent.name}</DialogTitle>
                      <DialogDescription>{activeStudent.email} • Enrolled in <span className="font-semibold text-foreground">{activeStudent.enrolledCourse}</span></DialogDescription>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-3 gap-3 my-4">
                <Card className="bg-muted/40 p-4 text-center">
                  <p className="text-xs text-muted-foreground">Total Time Spent</p>
                  <p className="text-xl font-bold mt-1 text-foreground">{activeStudent.totalHoursSpent} hrs</p>
                </Card>
                <Card className="bg-muted/40 p-4 text-center">
                  <p className="text-xs text-muted-foreground">Overall Progress</p>
                  <p className="text-xl font-bold mt-1 text-foreground">{activeStudent.progress}%</p>
                </Card>
                <Card className="bg-muted/40 p-4 text-center">
                  <p className="text-xs text-muted-foreground">Submissions</p>
                  <p className="text-xl font-bold mt-1 text-foreground">{activeStudent.submissions.length}</p>
                </Card>
              </div>

              <Tabs defaultValue="modules" className="mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="modules">Module & Lecture Hours</TabsTrigger>
                  <TabsTrigger value="submissions">Submissions & Grades</TabsTrigger>
                </TabsList>

                <TabsContent value="modules" className="space-y-4 pt-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Module Breakdown</h4>
                  <div className="space-y-3">
                    {activeStudent.modules.map((mod, idx) => (
                      <div key={idx} className="p-3 rounded-lg border bg-card space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium">{mod.moduleName}</span>
                          <span className="text-xs font-semibold text-indigo bg-indigo/10 px-2 py-0.5 rounded-full">
                            {mod.hoursSpent} hrs spent
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Completed lectures: {mod.completedLectures} / {mod.totalLectures}</span>
                          <span>{Math.round((mod.completedLectures / mod.totalLectures) * 100)}%</span>
                        </div>
                        <Progress value={(mod.completedLectures / mod.totalLectures) * 100} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="submissions" className="space-y-4 pt-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Assignments & Quiz Grades</h4>
                  <div className="space-y-3">
                    {activeStudent.submissions.map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{sub.title}</span>
                            <Badge variant="outline" className="text-xs">{sub.type}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">Submitted on {sub.submittedDate}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-base">{sub.score}</span>
                          <div>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${sub.status === 'Graded' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                              {sub.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter className="mt-6 flex justify-between sm:justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDetailOpen(false);
                    setIsChatOpen(true);
                  }}
                  className="gap-2"
                >
                  <MessageSquare className="h-4 w-4 text-indigo" /> Open Chat Box ({activeStudent.messages.length})
                </Button>
                <Button onClick={() => setIsDetailOpen(false)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dedicated Chat Box Drawer / Dialog */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="sm:max-w-xl h-[80vh] flex flex-col justify-between p-0 overflow-hidden">
          {activeStudent && (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo/10 flex items-center justify-center text-indigo font-bold">
                    {activeStudent.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">{activeStudent.name}</h3>
                    <p className="text-xs text-muted-foreground">Course Chat & Instructions • {activeStudent.enrolledCourse}</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/25">
                  Connected
                </Badge>
              </div>

              {/* Chat Message History */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-card/40">
                {activeStudent.messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-6">
                    <MessageSquare className="h-10 w-10 text-muted-foreground/40 mb-2" />
                    <p className="font-medium text-sm">No chat history yet</p>
                    <p className="text-xs mt-1">Send instructions or feedback below. The student can reply here anytime.</p>
                  </div>
                ) : (
                  activeStudent.messages.map((msg) => {
                    const isInstructor = msg.sender === 'instructor';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isInstructor ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1 px-1">
                          <span>{isInstructor ? 'You (Instructor)' : activeStudent.name}</span>
                          <span>•</span>
                          <span>{msg.timestamp}</span>
                        </div>
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                            isInstructor
                              ? 'bg-indigo text-indigo-foreground rounded-br-sm'
                              : 'bg-muted text-foreground border rounded-bl-sm'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Input Footer */}
              <form onSubmit={handleSendChatMessage} className="p-4 border-t bg-card flex items-center gap-2">
                <Input
                  placeholder="Type instructions, suggestions, or feedback..."
                  value={newChatText}
                  onChange={(e) => setNewChatText(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon" className="shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}