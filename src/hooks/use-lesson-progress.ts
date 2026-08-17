import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';

interface ProgressRow {
  lesson_id: string;
  completed: boolean;
}

export function useLessonProgress(courseId: string) {
  const { user } = useAuth();
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('lesson_id, completed')
        .eq('user_id', user.id)
        .eq('course_id', courseId);

      if (!cancelled && !error && data) {
        const completed = new Set(
          (data as ProgressRow[]).filter((r) => r.completed).map((r) => r.lesson_id)
        );
        setCompletedLessons(completed);
      }
      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user, courseId]);

  const toggleLesson = useCallback(
    async (lessonId: string, completed: boolean) => {
      if (!user) return;

      setCompletedLessons((prev) => {
        const next = new Set(prev);
        if (completed) next.add(lessonId);
        else next.delete(lessonId);
        return next;
      });

      const { error } = await supabase
        .from('lesson_progress')
        .upsert(
          {
            user_id: user.id,
            course_id: courseId,
            lesson_id: lessonId,
            completed,
            completed_at: completed ? new Date().toISOString() : null,
          },
          { onConflict: 'user_id,lesson_id' }
        );

      if (error) {
        setCompletedLessons((prev) => {
          const next = new Set(prev);
          if (!completed) next.add(lessonId);
          else next.delete(lessonId);
          return next;
        });
      }
    },
    [user, courseId]
  );

  const markComplete = useCallback(
    (lessonId: string) => toggleLesson(lessonId, true),
    [toggleLesson]
  );

  const isCompleted = useCallback(
    (lessonId: string) => completedLessons.has(lessonId),
    [completedLessons]
  );

  return { completedLessons, loading, markComplete, toggleLesson, isCompleted };
}
