import { useMemo } from 'react';
import { TrendingUp, Sparkles, ArrowUpRight, Target } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { extendedSkills } from '@/lib/practice-data';
import { cn } from '@/lib/utils';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import type { Skill } from '@/types';

const categoryAccents: Record<string, string> = {
  'AI & ML': 'text-teal',
  Languages: 'text-primary',
  Frameworks: 'text-indigo',
  Math: 'text-info',
  Infrastructure: 'text-warning',
};

function proficiencyColor(p: number): string {
  if (p >= 80) return 'bg-success';
  if (p >= 60) return 'bg-primary';
  if (p >= 40) return 'bg-warning';
  return 'bg-destructive';
}

function proficiencyLabel(p: number): string {
  if (p >= 80) return 'Expert';
  if (p >= 60) return 'Proficient';
  if (p >= 40) return 'Developing';
  return 'Beginner';
}

export function SkillsPage() {
  const categories = useMemo(() => {
    const groups: Record<string, Skill[]> = {};
    for (const skill of extendedSkills) {
      if (!groups[skill.category]) groups[skill.category] = [];
      groups[skill.category].push(skill);
    }
    return Object.entries(groups);
  }, []);

  const radarData = useMemo(() => {
    return Object.entries(
      extendedSkills.reduce<Record<string, number[]>>((acc, skill) => {
        if (!acc[skill.category]) acc[skill.category] = [];
        acc[skill.category].push(skill.proficiency);
        return acc;
      }, {})
    ).map(([category, values]) => ({
      category,
      proficiency: Math.round(values.reduce((s, v) => s + v, 0) / values.length),
    }));
  }, []);

  const avgProficiency = Math.round(
    extendedSkills.reduce((s, skill) => s + skill.proficiency, 0) / extendedSkills.length
  );

  const skillGaps = useMemo(
    () => extendedSkills.filter((s) => s.proficiency < 60).sort((a, b) => a.proficiency - b.proficiency),
    []
  );

  return (
    <div className="space-y-8 animate-in-slide">
      <PageHeader
        title="Skills"
        description="Your growing skill graph, mapped across domains."
        actions={
          <Button size="sm" variant="outline">
            <Sparkles className="mr-2 h-4 w-4 text-teal" />
            Analyze gaps
          </Button>
        }
      />

      {/* Top: radar + overall stats */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Skill radar</CardTitle>
            <CardDescription>Average proficiency across domains</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis
                  dataKey="category"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <PolarRadiusAxis
                  domain={[0, 100]}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  angle={90}
                />
                <Radar
                  dataKey="proficiency"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Overview</CardTitle>
            <CardDescription>At a glance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">Average proficiency</p>
              <p className="mt-1 text-3xl font-bold text-foreground tabular-nums">{avgProficiency}%</p>
              <Progress value={avgProficiency} className="mt-2 h-2" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Total skills</p>
                <p className="mt-1 text-xl font-bold text-foreground tabular-nums">{extendedSkills.length}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Expert level</p>
                <p className="mt-1 text-xl font-bold text-foreground tabular-nums">
                  {extendedSkills.filter((s) => s.proficiency >= 80).length}
                </p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Categories</p>
                <p className="mt-1 text-xl font-bold text-foreground tabular-nums">{categories.length}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Skill gaps</p>
                <p className="mt-1 text-xl font-bold text-foreground tabular-nums">{skillGaps.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skill bars by category */}
      <div className="grid gap-4 lg:grid-cols-2">
        {categories.map(([category, skills]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className={cn('h-4 w-4', categoryAccents[category] ?? 'text-primary')} />
                {category}
              </CardTitle>
              <CardDescription>{skills.length} skills tracked</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {skills.map((skill) => (
                <div key={skill.id}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{skill.name}</span>
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        {proficiencyLabel(skill.proficiency)}
                      </Badge>
                    </div>
                    <span className="text-xs font-medium tabular-nums text-muted-foreground">
                      {skill.proficiency}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn('h-full rounded-full transition-all', proficiencyColor(skill.proficiency))}
                      style={{ width: `${skill.proficiency}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Skill gaps */}
      {skillGaps.length > 0 && (
        <Card className="border-warning/20 bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-warning" />
              Skill gaps to address
            </CardTitle>
            <CardDescription>Areas where focused practice would boost your profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {skillGaps.map((skill) => (
              <div
                key={skill.id}
                className="flex items-center gap-4 rounded-lg border border-border bg-card p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{skill.name}</p>
                    <span className="text-xs tabular-nums text-muted-foreground">{skill.proficiency}%</span>
                  </div>
                  <Progress value={skill.proficiency} className="mt-1.5 h-1.5" />
                </div>
                <Button size="sm" variant="outline" className="shrink-0">
                  Improve
                  <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
