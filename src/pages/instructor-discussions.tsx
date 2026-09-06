import { useState } from 'react';
import { Search, MessageSquare, CheckCircle, ThumbsUp, Send, BookOpen, User, Clock, Edit2, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface ReplyItem {
  id: string;
  author: string;
  role: 'instructor' | 'student';
  content: string;
  timestamp: string;
}

interface DiscussionThread {
  id: string;
  courseTitle: string;
  studentName: string;
  studentEmail: string;
  title: string;
  content: string;
  timestamp: string;
  upvotes: number;
  status: 'Unanswered' | 'Answered';
  replies: ReplyItem[];
}

const initialThreads: DiscussionThread[] = [
  {
    id: 'disc_1',
    courseTitle: 'Transformers from Scratch',
    studentName: 'Alex Rivera',
    studentEmail: 'alex.rivera@example.com',
    title: 'Confusion with Multi-Head Attention QKV matrix dimensions',
    content: 'Hi Professor, when we split the Q, K, V projections across multiple heads, how do the tensor shapes align during batch matrix multiplication? I keep getting a dimension mismatch error in PyTorch.',
    timestamp: '2 hours ago',
    upvotes: 5,
    status: 'Unanswered',
    replies: [],
  },
  {
    id: 'disc_2',
    courseTitle: 'Production LLM Applications',
    studentName: 'Sarah Jenkins',
    studentEmail: 'sarah.j@example.com',
    title: 'Best chunking strategy for technical PDF documentation?',
    content: 'Is recursive character text splitting usually enough for embedding complex developer docs, or should we implement semantic chunking with overlap?',
    timestamp: 'Yesterday',
    upvotes: 12,
    status: 'Answered',
    replies: [
      {
        id: 'rep_1',
        author: 'Instructor',
        role: 'instructor',
        content: 'Great question Sarah! For dense technical docs, semantic chunking combined with a 15-20% token overlap works best to preserve code blocks and API signatures context.',
        timestamp: 'Yesterday, 3:45 PM',
      },
    ],
  },
  {
    id: 'disc_3',
    courseTitle: 'Transformers from Scratch',
    studentName: 'Marcus Chen',
    studentEmail: 'marcus.c@example.com',
    title: 'Positional encoding vs Learned embeddings in smaller datasets',
    content: 'Does sinusoidal positional encoding still outperform learned embeddings when training models from scratch on smaller domain-specific datasets?',
    timestamp: '3 days ago',
    upvotes: 8,
    status: 'Answered',
    replies: [
      {
        id: 'rep_2',
        author: 'Instructor',
        role: 'instructor',
        content: 'Yes! Sinusoidal encodings generalize better to sequence lengths longer than seen during training, which is extremely helpful for smaller datasets.',
        timestamp: '3 days ago, 10:20 AM',
      },
    ],
  },
];

export function InstructorDiscussionsPage() {
  const [threads, setThreads] = useState<DiscussionThread[]>(initialThreads);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Unanswered' | 'Answered'>('all');
  
  const [activeThread, setActiveThread] = useState<DiscussionThread | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replyText, setReplyText] = useState('');

  // Editing state
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');

  const filteredThreads = threads.filter((thread) => {
    const matchesSearch =
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || thread.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleOpenThread = (thread: DiscussionThread) => {
    setActiveThread(thread);
    setIsModalOpen(true);
    setEditingReplyId(null);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeThread) return;

    const newReply: ReplyItem = {
      id: `rep_${Date.now()}`,
      author: 'Instructor',
      role: 'instructor',
      content: replyText.trim(),
      timestamp: 'Just now',
    };

    const updatedReplies = [...activeThread.replies, newReply];
    const updatedThread = {
      ...activeThread,
      status: 'Answered' as const,
      replies: updatedReplies,
    };

    setActiveThread(updatedThread);
    setThreads(threads.map((t) => (t.id === activeThread.id ? updatedThread : t)));
    setReplyText('');
    toast.success('Reply posted successfully!');
  };

  const handleStartEdit = (reply: ReplyItem) => {
    setEditingReplyId(reply.id);
    setEditedContent(reply.content);
  };

  const handleSaveEdit = (replyId: string) => {
    if (!editedContent.trim() || !activeThread) return;

    const updatedReplies = activeThread.replies.map((rep) => {
      if (rep.id === replyId) {
        return { ...rep, content: editedContent.trim() };
      }
      return rep;
    });

    const updatedThread = { ...activeThread, replies: updatedReplies };
    setActiveThread(updatedThread);
    setThreads(threads.map((t) => (t.id === activeThread.id ? updatedThread : t)));
    setEditingReplyId(null);
    toast.success('Reply updated successfully!');
  };

  const handleDeleteReply = (replyId: string) => {
    if (!activeThread) return;

    const updatedReplies = activeThread.replies.filter((rep) => rep.id !== replyId);
    
    // If no instructor replies are left, we can optionally switch status back to Unanswered if desired
    const hasRemainingInstructorReplies = updatedReplies.some((r) => r.role === 'instructor');
    const newStatus = hasRemainingInstructorReplies ? 'Answered' : 'Unanswered';

    const updatedThread = {
      ...activeThread,
      status: newStatus as 'Answered' | 'Unanswered',
      replies: updatedReplies,
    };

    setActiveThread(updatedThread);
    setThreads(threads.map((t) => (t.id === activeThread.id ? updatedThread : t)));
    toast.success('Reply deleted successfully.');
  };

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Discussions & Q&A</h1>
        <p className="text-muted-foreground mt-1">
          Engage with students, answer course queries, and mark solutions to help the community.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search discussions, student names, or courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('all')}
          >
            All ({threads.length})
          </Button>
          <Button
            variant={filterStatus === 'Unanswered' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('Unanswered')}
          >
            Unanswered ({threads.filter((t) => t.status === 'Unanswered').length})
          </Button>
          <Button
            variant={filterStatus === 'Answered' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('Answered')}
          >
            Answered ({threads.filter((t) => t.status === 'Answered').length})
          </Button>
        </div>
      </div>

      {/* Discussion List */}
      <div className="grid gap-4">
        {filteredThreads.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <h3 className="text-lg font-semibold">No discussions found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your search query or filter status.
            </p>
          </Card>
        ) : (
          filteredThreads.map((thread) => (
            <Card
              key={thread.id}
              onClick={() => handleOpenThread(thread)}
              className="cursor-pointer transition-all hover:border-indigo/50 hover:bg-card/80 group"
            >
              <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-base group-hover:text-indigo transition-colors">
                      {thread.title}
                    </span>
                    {thread.status === 'Answered' ? (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/25 gap-1">
                        <CheckCircle className="h-3 w-3" /> Answered
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/25">
                        Needs Answer
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-1">{thread.content}</p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <BookOpen className="h-3.5 w-3.5 text-indigo" /> {thread.courseTitle}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" /> {thread.studentName}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {thread.timestamp}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end md:self-center shrink-0">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1.5 rounded-md">
                    <ThumbsUp className="h-3.5 w-3.5 text-indigo" />
                    <span>{thread.upvotes} upvotes</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1.5 rounded-md">
                    <MessageSquare className="h-3.5 w-3.5 text-indigo" />
                    <span>{thread.replies.length} replies</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Discussion Detail & Reply Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          {activeThread && (
            <>
              <div className="px-6 py-4 border-b bg-muted/30">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="text-xs bg-indigo/10 text-indigo border-indigo/25">
                    {activeThread.courseTitle}
                  </Badge>
                  {activeThread.status === 'Answered' ? (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/25 gap-1">
                      <CheckCircle className="h-3 w-3" /> Answered
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/25">
                      Needs Answer
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-xl mt-2">{activeThread.title}</DialogTitle>
                <DialogDescription className="mt-1">
                  Asked by <span className="font-semibold text-foreground">{activeThread.studentName}</span> ({activeThread.studentEmail}) • {activeThread.timestamp}
                </DialogDescription>
              </div>

              {/* Scrollable Thread & Replies */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Original Question */}
                <div className="p-4 rounded-xl border bg-card text-sm leading-relaxed">
                  <p>{activeThread.content}</p>
                </div>

                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2">
                  Replies ({activeThread.replies.length})
                </h4>

                {activeThread.replies.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic py-2">No replies yet. Be the first to answer this student's question!</p>
                ) : (
                  activeThread.replies.map((reply) => {
                    const isInstructor = reply.role === 'instructor';
                    const isEditing = editingReplyId === reply.id;

                    return (
                      <div
                        key={reply.id}
                        className={`p-4 rounded-xl border space-y-2 text-sm ${
                          isInstructor ? 'bg-indigo/5 border-indigo/20 ml-6' : 'bg-muted/50 mr-6'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                          <span className={isInstructor ? 'text-indigo font-bold' : ''}>
                            {reply.author} {isInstructor && '(You)'}
                          </span>
                          <div className="flex items-center gap-2">
                            <span>{reply.timestamp}</span>
                            {isInstructor && !isEditing && (
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleStartEdit(reply)}
                                  className="h-6 px-2 text-xs text-indigo hover:bg-indigo/10"
                                >
                                  <Edit2 className="h-3 w-3 mr-1" /> Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteReply(reply.id)}
                                  className="h-6 px-2 text-xs text-rose-500 hover:bg-rose-500/10"
                                >
                                  <Trash2 className="h-3 w-3 mr-1" /> Delete
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        {isEditing ? (
                          <div className="space-y-2 pt-1">
                            <Input
                              value={editedContent}
                              onChange={(e) => setEditedContent(e.target.value)}
                              className="bg-card text-sm"
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingReplyId(null)}
                                className="h-7 text-xs"
                              >
                                <X className="h-3 w-3 mr-1" /> Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleSaveEdit(reply.id)}
                                className="h-7 text-xs bg-indigo text-indigo-foreground hover:bg-indigo/90"
                              >
                                <Check className="h-3 w-3 mr-1" /> Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="leading-relaxed text-foreground pt-1">{reply.content}</p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Reply Input Form */}
              <form onSubmit={handleSendReply} className="p-4 border-t bg-card flex items-center gap-2">
                <Input
                  placeholder="Type your official instructor reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" className="gap-1.5 shrink-0">
                  <Send className="h-4 w-4" /> Send Reply
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}