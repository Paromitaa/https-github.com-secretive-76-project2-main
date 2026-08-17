import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';

export function useLessonNotes(courseId: string, lessonId: string) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from('lesson_notes')
        .select('content')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (!cancelled && !error && data) {
        setContent((data as { content: string }).content ?? '');
      }
      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user, courseId, lessonId]);

  const save = useCallback(
    async (text: string) => {
      if (!user) return;
      setSaving(true);
      setSaved(false);

      const { error } = await supabase
        .from('lesson_notes')
        .upsert(
          {
            user_id: user.id,
            course_id: courseId,
            lesson_id: lessonId,
            content: text,
          },
          { onConflict: 'user_id,lesson_id' }
        );

      setSaving(false);
      if (!error) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
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
