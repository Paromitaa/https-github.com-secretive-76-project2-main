import { useCallback, useEffect, useRef, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/components/providers/auth-provider';

export function useLessonNotes(courseId: string, lessonId: string) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load lesson notes from Go backend
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const data = await apiRequest(`/courses/${courseId}/lessons/${lessonId}/notes`);
        if (!cancelled && data && data.content) {
          setContent(data.content);
        }
      } catch (err) {
        console.error('Failed to fetch lesson notes:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, courseId, lessonId]);

  // Save lesson notes to Go backend
  const save = useCallback(
    async (text: string) => {
      if (!user) return;
      setSaving(true);
      setSaved(false);

      try {
        await apiRequest(`/courses/${courseId}/lessons/${lessonId}/notes`, {
          method: 'POST',
          body: JSON.stringify({ content: text }),
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (err) {
        console.error('Failed to save lesson notes:', err);
      } finally {
        setSaving(false);
      }
    },
    [user, courseId, lessonId]
  );

  const updateContent = useCallback(
    (text: string) => {
      setContent(text);
      setSaved(false);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => save(text), 1200);
    },
    [save]
  );

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  return { content, loading, saving, saved, updateContent, save };
}