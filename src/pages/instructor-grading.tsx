import { useState } from 'react';
import { CheckCircle2, Clock, Search, Filter, Award, MessageSquare, BookOpen, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Submission {
  id: string;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  assignmentTitle: string;
  submittedAt: string;
  status: 'pending' | 'graded';
  score?: number;
  maxScore: number;
  feedback?: string;
}

const initialSubmissions: Submission[] = [
  {
    id: 'sub_1',
    studentName: 'Alex Rivera',
    studentEmail: 'alex.rivera@example.com',
    courseTitle: 'Transformers from Scratch',
    assignmentTitle: 'Positional Encoding Lab',
    submittedAt: '2026-05-18T14:30:00Z',
    status: 'pending',
    maxScore: 100,
  },
  {
    id: 'sub_2',
    studentName: 'Sarah Jenkins',
    studentEmail: 'sarah.j@example.com',
    courseTitle: 'Production LLM Applications',
    assignmentTitle: 'Retrieval Tuning Worksheet',
    submittedAt: '2026-05-17T11:15:00Z',
    status: 'graded',
    score: 92,
    maxScore: 100,
    feedback: 'Great job handling chunk overlaps and evaluating retrieval recall!',
  },
  {
    id: 'sub_3',
    studentName: 'Marcus Chen',
    studentEmail: 'marcus.c@example.com',
    courseTitle: 'Transformers from Scratch',
    assignmentTitle: 'Positional Encoding Lab',
    submittedAt: '2026-05-16T09:45:00Z',
    status: 'pending',
    maxScore: 100,
  },
];

export function InstructorGradingPage() {
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'graded'>('all');
  
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [scoreInput, setScoreInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.assignmentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' ? true : sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenGradeDialog = (sub: Submission) => {
    setSelectedSubmission(sub);
    setScoreInput(sub.score ? sub.score.toString() : '');
    setFeedbackInput(sub.feedback || '');
    setIsDialogOpen(true);
  };

  const handleSaveGrade = () => {
    if (!selectedSubmission) return;
    const scoreNum = parseFloat(scoreInput);

    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > selectedSubmission.maxScore) {
      toast.error(`Please enter a valid score between 0 and ${selectedSubmission.maxScore}`);
      return;
    }

    setSubmissions((prev) =>
      prev.map((item) =>
        item.id === selectedSubmission.id
          ? {
              ...item,
              status: 'graded',
              score: scoreNum,
              feedback: feedbackInput,
            }
          : item
      )
    );

    toast.success(`Successfully graded submission for ${selectedSubmission.studentName}`);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Grading & Submissions</h1>
        <p className="text-muted-foreground mt-1">
          Review student assignments, grade lab notebooks, and provide personalized feedback.
        </p>
      </div>
<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search student, assignment, or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)} className="w-auto">
          <TabsList>
            <TabsTrigger value="all">All Submissions</TabsTrigger>
            <TabsTrigger value="pending">
              Pending{' '}
              <Badge variant="secondary" className="ml-1.5 px-1 py-0 text-[10px]">
                {submissions.filter((s) => s.status === 'pending').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="graded">Graded</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="grid gap-4">
        {filteredSubmissions.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center">
            <Award className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <h3 className="text-lg font-semibold">No submissions found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your search filters or check back later for new student work.
            </p>
          </Card>
        ) : (
          filteredSubmissions.map((sub) => (
            <Card key={sub.id} className="transition-all hover:border-indigo/50">
              <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-base">{sub.studentName}</span>
                    <span className="text-xs text-muted-foreground">({sub.studentEmail})</span>
                    {sub.status === 'pending' ? (
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1">
                        <Clock className="h-3 w-3" /> Pending Review
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Graded ({sub.score}/{sub.maxScore})
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4 text-indigo" />
                      {sub.courseTitle}
                    </span>
                    <span>•</span>
                    <span className="font-medium text-foreground">{sub.assignmentTitle}</span>
                    <span>•</span>
                    <span>Submitted on {new Date(sub.submittedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button variant={sub.status === 'pending' ? 'default' : 'outline'} onClick={() => handleOpenGradeDialog(sub)}>
                    {sub.status === 'pending' ? 'Grade Assignment' : 'Edit Grade'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Grade Dialog Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
            <DialogDescription>
              Reviewing assignment for <span className="font-semibold text-foreground">{selectedSubmission?.studentName}</span> ({selectedSubmission?.assignmentTitle})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="score">Score (Out of {selectedSubmission?.maxScore})</Label>
              <Input
                id="score"
                type="number"
                placeholder="e.g. 85"
                value={scoreInput}
                onChange={(e) => setScoreInput(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback for Student</Label>
              <Textarea
                id="feedback"
                placeholder="Write constructive notes or guidance..."
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveGrade}>Save & Publish Grade</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}