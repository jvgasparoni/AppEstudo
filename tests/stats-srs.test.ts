import test from "node:test";
import assert from "node:assert/strict";
import { summarizeAttempts, summarizeByDomainSubtheme } from "../lib/stats-core";
import { isCorrect, isRating, nextSrs } from "../lib/srs";
import { normalizeDashboardPeriod, normalizeDashboardSource } from "../lib/stats";

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

test("summarize attempts by domain and subtheme", () => {
  const result = summarizeByDomainSubtheme([
    { correct: true, question: { subject: "Sec", theme: "D1", tags: "", subtheme: "CIA" } },
    { correct: false, question: { subject: "Sec", theme: "Dominio 1", tags: "", subtheme: "CIA" } },
    { correct: true, question: { subject: "Sec", theme: "D2", tags: "", subtheme: "Malware" } },
    { correct: false, question: { subject: "Sec", theme: "D2", tags: "", subtheme: null } },
  ]);

  assert.deepEqual(result, [
    {
      domain: "Dominio 1",
      total: 2,
      correct: 1,
      wrong: 1,
      rate: 50,
      subthemes: [{ subtheme: "CIA", total: 2, correct: 1, wrong: 1, rate: 50 }],
    },
    {
      domain: "Dominio 2",
      total: 2,
      correct: 1,
      wrong: 1,
      rate: 50,
      subthemes: [
        { subtheme: "Malware", total: 1, correct: 1, wrong: 0, rate: 100 },
        { subtheme: "Sem subtema", total: 1, correct: 0, wrong: 1, rate: 0 },
      ],
    },
  ]);
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

test("normalize dashboard period", () => {
  assert.equal(normalizeDashboardPeriod("7"), "7");
  assert.equal(normalizeDashboardPeriod("15"), "15");
  assert.equal(normalizeDashboardPeriod("30"), "30");
  assert.equal(normalizeDashboardPeriod("all"), "all");
  assert.equal(normalizeDashboardPeriod("invalid"), "all");
});

test("normalize dashboard source", () => {
  assert.equal(normalizeDashboardSource("exam"), "exam");
  assert.equal(normalizeDashboardSource("train"), "train");
  assert.equal(normalizeDashboardSource("all"), "all");
  assert.equal(normalizeDashboardSource("invalid"), "all");
});
