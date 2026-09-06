import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/components/providers/auth-provider';

interface ProgressRow {
  lesson_id: string;
  completed: boolean;
}

export function useLessonProgress(courseId: string) {
  const { user } = useAuth();
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Load completed lesson progress from Go backend
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const data = await apiRequest(`/courses/${courseId}/progress`);
        if (!cancelled && data && Array.isArray(data)) {
          const completed = new Set(
            (data as ProgressRow[]).filter((r) => r.completed).map((r) => r.lesson_id)
          );
          setCompletedLessons(completed);
        }
      } catch (err) {
        console.error('Failed to fetch lesson progress:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, courseId]);

  // Toggle or update lesson progress via Go backend
  const toggleLesson = useCallback(
    async (lessonId: string, completed: boolean) => {
      if (!user) return;

      // Optimistically update UI state
      setCompletedLessons((prev) => {
        const next = new Set(prev);
        if (completed) next.add(lessonId);
        else next.delete(lessonId);
        return next;
      });

      try {
        await apiRequest(`/courses/${courseId}/progress`, {
          method: 'POST',
          body: JSON.stringify({
            lesson_id: lessonId,
            completed,
            completed_at: completed ? new Date().toISOString() : null,
          }),
        });
      } catch (err) {
        console.error('Failed to update lesson progress:', err);
        // Rollback on error
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