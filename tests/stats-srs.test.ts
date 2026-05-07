import test from "node:test";
import assert from "node:assert/strict";
import { summarizeAttempts } from "../lib/stats-core";
import { isCorrect, isRating, nextSrs } from "../lib/srs";

test("isCorrect works", () => {
  assert.equal(isCorrect("A", "A"), true);
  assert.equal(isCorrect("B", "A"), false);
});

test("summarize attempts", () => {
  const result = summarizeAttempts([
    { correct: true, question: { subject: "Mat", theme: "A" } },
    { correct: false, question: { subject: "Mat", theme: "A" } },
    { correct: true, question: { subject: "Geo", theme: "B" } },
  ]);

  assert.equal(result.total, 3);
  assert.equal(result.correct, 2);
  assert.equal(result.rate, 67);
  assert.equal(result.bySubject.Mat.total, 2);
});

test("srs increases intervals and records lapses", () => {
  const base = { intervalDays: 2, easeFactor: 2.5, reviewCount: 1, lapseCount: 0 };
  const good = nextSrs(base, "GOOD");
  const again = nextSrs(base, "AGAIN", { againToday: true });

  assert.ok(good.intervalDays > base.intervalDays);
  assert.equal(again.intervalDays, 0);
  assert.equal(again.lapseCount, 1);
});

test("validate flashcard ratings", () => {
  assert.equal(isRating("GOOD"), true);
  assert.equal(isRating("INVALID"), false);
});
