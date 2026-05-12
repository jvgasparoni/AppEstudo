import test from "node:test";
import assert from "node:assert/strict";
import { CLAVIS_LESSON_COUNT, clavisLessonLabel, clavisLessons, getClavisLessonFromSubtheme, normalizeClavisLesson } from "../lib/clavis";

test("clavis lessons cover 57 aulas", () => {
  assert.equal(clavisLessons.length, CLAVIS_LESSON_COUNT);
  assert.equal(clavisLessons[0], 1);
  assert.equal(clavisLessons[56], 57);
});

test("normalize clavis lesson accepts only valid lesson numbers", () => {
  assert.equal(normalizeClavisLesson("1"), 1);
  assert.equal(normalizeClavisLesson(57), 57);
  assert.equal(normalizeClavisLesson(0), null);
  assert.equal(normalizeClavisLesson(58), null);
  assert.equal(normalizeClavisLesson("abc"), null);
});

test("clavis lesson labels are stable", () => {
  assert.equal(clavisLessonLabel(12), "Aula 12");
});

test("extract clavis lesson from subtheme text", () => {
  assert.equal(getClavisLessonFromSubtheme("Aula 57"), 57);
  assert.equal(getClavisLessonFromSubtheme("Clavis - Aula: 3"), 3);
  assert.equal(getClavisLessonFromSubtheme("Aula 58"), null);
  assert.equal(getClavisLessonFromSubtheme("Privacidade"), null);
});
