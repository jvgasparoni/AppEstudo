export const GENERAL_ORIGIN = "GENERAL";
export const CLAVIS_ORIGIN = "CLAVIS";
export const CLAVIS_LESSON_COUNT = 57;

export const clavisLessons = Array.from({ length: CLAVIS_LESSON_COUNT }, (_, index) => index + 1);

export function normalizeClavisLesson(value: unknown) {
  const lesson = Number(value);
  return Number.isInteger(lesson) && lesson >= 1 && lesson <= CLAVIS_LESSON_COUNT ? lesson : null;
}

export function getClavisLessonFromSubtheme(value: string | null | undefined) {
  const match = String(value || "").match(/\baula\s*[-_:]?\s*(\d{1,2})\b/i);
  return match ? normalizeClavisLesson(match[1]) : null;
}

export function clavisLessonLabel(lesson: number) {
  return `Aula ${lesson}`;
}
