import { useState } from 'react';
import { Sparkles, Wand2, Copy, Check, RefreshCw, FileText, HelpCircle, BookOpen, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type ToolType = 'quiz' | 'summary' | 'lesson-plan' | 'assignment';

interface ToolConfig {
  id: ToolType;
  title: string;
  description: string;
  icon: typeof Sparkles;
  placeholder: string;
}

const aiTools: ToolConfig[] = [
  {
    id: 'quiz',
    title: 'Generate Quiz Questions',
    description: 'Create multiple-choice or short-answer quiz questions based on your topic or lecture notes.',
    icon: HelpCircle,
    placeholder: 'e.g., Multi-Head Attention mechanisms in Transformers, QKV matrices, and positional encodings...',
  },
  {
    id: 'summary',
    title: 'Lecture Summary & Key Takeaways',
    description: 'Condense long transcripts or notes into clean, bulleted summaries and core takeaways.',
    icon: FileText,
    placeholder: 'Paste your raw lecture notes or transcript here...',
  },
  {
    id: 'lesson-plan',
    title: 'Interactive Lesson Plan',
    description: 'Generate structured lesson modules, student activities, and timed breakdowns.',
    icon: BookOpen,
    placeholder: 'e.g., Introduction to Next.js 14 App Router and Server Actions (90 mins)...',
  },
  {
    id: 'assignment',
    title: 'Coding & Project Prompt',
    description: 'Design practical coding assignments with objectives, starter requirements, and rubric criteria.',
    icon: Layers,
    placeholder: 'e.g., Build a RESTful API using Node.js and Express with JWT authentication...',
  },
];

export function InstructorAiToolsPage() {
  const [selectedTool, setSelectedTool] = useState<ToolType>('quiz');
  const [promptInput, setPromptInput] = useState('');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [tone, setTone] = useState('Professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [outputResult, setOutputResult] = useState('');
  const [copied, setCopied] = useState(false);

  const activeToolConfig = aiTools.find((t) => t.id === selectedTool) || aiTools[0];

  const handleGenerate = () => {
    if (!promptInput.trim()) {
      toast.error('Please enter a topic or notes first.');
      return;
    }

    setIsGenerating(true);
    setOutputResult('');

    // Simulate AI generation response
    setTimeout(() => {
      let mockOutput = '';
      if (selectedTool === 'quiz') {
        mockOutput = `### Generated Quiz: ${promptInput}\n\n**1. What is the primary purpose of the mechanism discussed?**\n- A) To increase model parameters infinitely\n- B) To compute weighted context representations efficiently (Correct)\n- C) To replace standard activation functions\n- D) To eliminate training loss entirely\n\n**2. Explain briefly how batch normalization interacts with this layer.**\n*(Answer Key: Normalization stabilizes internal covariate shift across mini-batches...)*`;
      } else if (selectedTool === 'summary') {
        mockOutput = `### Lecture Summary: ${promptInput}\n\n**Core Takeaways:**\n* **Foundational Concept:** Mastered core architecture patterns and data pipeline flows.\n* **Best Practices:** Always handle edge cases with robust error handling and type safety.\n* **Performance Optimization:** Utilize memoization and asynchronous batching where applicable.`;
      } else if (selectedTool === 'lesson-plan') {
        mockOutput = `### Lesson Plan: ${promptInput}\n\n* **Duration:** 90 Minutes\n* **Objective:** Understand and implement production-ready architecture.\n* **Outline:**\n  1. Introduction & Theory (20 mins)\n  2. Live Coding Demonstration (40 mins)\n  3. Q&A & Hands-on Exercise (30 mins)`;
      } else {
        mockOutput = `### Assignment Prompt: ${promptInput}\n\n* **Objective:** Build a scalable service adhering to clean code standards.\n* **Requirements:**\n  * Implement secure validation.\n  * Include comprehensive unit tests.\n* **Grading Rubric:** Code Quality (40%), Functionality (40%), Documentation (20%).`;
      }

      setOutputResult(mockOutput);
      setIsGenerating(false);
      toast.success('AI content generated successfully!');
    }, 1200);
  };

  const handleCopy = () => {
    if (!outputResult) return;
    navigator.clipboard.writeText(outputResult);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">AI Content Tools</h1>
          <Badge variant="outline" className="bg-indigo/10 text-indigo border-indigo/25 gap-1">
            <Sparkles className="h-3 w-3" /> Pro AI
          </Badge>
        </div>
        <p className="text-muted-foreground mt-1">
          Generate quizzes, summaries, lesson plans, and project materials instantly with AI.
        </p>
      </div>

      {/* Tool Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {aiTools.map((tool) => {
          const Icon = tool.icon;
          const isSelected = selectedTool === tool.id;
          return (
            <Card
              key={tool.id}
              onClick={() => {
                setSelectedTool(tool.id);
                setOutputResult('');
                setPromptInput('');
              }}
              className={`cursor-pointer transition-all hover:border-indigo/50 ${
                isSelected ? 'border-indigo bg-indigo/5 ring-1 ring-indigo/50' : 'bg-card'
              }`}
            >
              <CardContent className="p-5 space-y-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? 'bg-indigo text-indigo-foreground' : 'bg-muted text-foreground'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base">{tool.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{tool.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Generator Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Configuration Panel */}
        <Card className="lg:col-span-6 flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-indigo" /> Configure {activeToolConfig.title}
            </CardTitle>
            <CardDescription>Provide details or notes to guide the AI generation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Difficulty / Level</label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Tone</label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Professional">Professional</SelectItem>
                      <SelectItem value="Casual">Casual & Engaging</SelectItem>
                      <SelectItem value="Academic">Academic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Topic or Source Notes</label>
                <Textarea
                  placeholder={activeToolConfig.placeholder}
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  className="min-h-[160px] resize-none"
                />
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full gap-2 mt-6 bg-indigo hover:bg-indigo/90 text-indigo-foreground"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Generating content...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Generate with AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Panel */}
        <Card className="lg:col-span-6 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-lg">Generated Output</CardTitle>
              <CardDescription>Review, copy, or export your AI-generated material.</CardDescription>
            </div>
            {outputResult && (
              <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 rounded-xl border bg-muted/30 p-4 font-mono text-sm min-h-[260px] max-h-[380px] overflow-y-auto whitespace-pre-wrap">
              {isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2 py-16">
                  <RefreshCw className="h-8 w-8 animate-spin text-indigo" />
                  <p className="text-sm font-sans">Synthesizing curriculum content...</p>
                </div>
              ) : outputResult ? (
                outputResult
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center py-16">
                  <Sparkles className="h-10 w-10 text-muted-foreground/30 mb-2" />
                  <p className="text-sm">Configure your parameters on the left and click <strong>Generate with AI</strong> to create materials.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}