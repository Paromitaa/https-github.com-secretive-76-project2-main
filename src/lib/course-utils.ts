import { courses } from '@/lib/mock-data';
import type { Course } from '@/types';

export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug);
}

export function getAllLessons(course: Course) {
  return course.modules.flatMap((m) =>
    m.lessons.map((l) => ({ ...l, moduleTitle: m.title }))
  );
}

export function getLessonById(course: Course, lessonId: string) {
  for (const mod of course.modules) {
    const lesson = mod.lessons.find((l) => l.id === lessonId);
    if (lesson) return { lesson, module: mod };
  }
  return undefined;
}
