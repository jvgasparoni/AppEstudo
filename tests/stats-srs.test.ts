import test from "node:test";
import assert from "node:assert/strict";
import { calculateStatsByDomain, calculateStatsByTopic, summarizeAttempts, summarizeByDomainTopic } from "../lib/stats-core";
import { isCorrect, isRating, nextSrs } from "../lib/srs";
import { getDashboardAnalysisWhere, normalizeDashboardPeriod, normalizeDashboardSource } from "../lib/stats";

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
  assert.equal(result.byTheme.A.total, 2);
});

test("summarize attempts by domain from subject and topic from theme", () => {
  const attempts = [
    { correct: true, question: { subject: "Domínio 5 - Security Program Management and Oversight", theme: "Privacidade" } },
    { correct: false, question: { subject: "Dominio 5 - Security Program Management and Oversight", theme: "Privacidade" } },
    { correct: true, question: { subject: "Dominio 1 - General Security Concepts", theme: "Criptografia" } },
    { correct: false, question: { subject: "Dominio 1 - General Security Concepts", theme: "Criptografia" } },
  ];

  const domains = calculateStatsByDomain(attempts);
  const topics = calculateStatsByTopic(attempts);
  const nested = summarizeByDomainTopic(attempts);

  assert.deepEqual(domains, [
    {
      id: "domain-1",
      name: "Dominio 1 - General Security Concepts",
      total: 2,
      correct: 1,
      wrong: 1,
      rate: 50,
    },
    {
      id: "domain-5",
      name: "Domínio 5 - Security Program Management and Oversight",
      total: 2,
      correct: 1,
      wrong: 1,
      rate: 50,
    },
  ]);

  assert.deepEqual(topics, [
    { id: "Criptografia", name: "Criptografia", total: 2, correct: 1, wrong: 1, rate: 50 },
    { id: "Privacidade", name: "Privacidade", total: 2, correct: 1, wrong: 1, rate: 50 },
  ]);

  assert.deepEqual(nested, [
    {
      id: "domain-1",
      domain: "Dominio 1 - General Security Concepts",
      total: 2,
      correct: 1,
      wrong: 1,
      rate: 50,
      topics: [{ topic: "Criptografia", total: 2, correct: 1, wrong: 1, rate: 50 }],
    },
    {
      id: "domain-5",
      domain: "Domínio 5 - Security Program Management and Oversight",
      total: 2,
      correct: 1,
      wrong: 1,
      rate: 50,
      topics: [{ topic: "Privacidade", total: 2, correct: 1, wrong: 1, rate: 50 }],
    },
  ]);
});

test("topic and domain counters increase correct and wrong independently", () => {
  const attempts = [
    { correct: true, question: { subject: "Domínio 5 - Security Program Management and Oversight", theme: "Privacidade" } },
    { correct: false, question: { subject: "Domínio 5 - Security Program Management and Oversight", theme: "Privacidade" } },
  ];

  assert.deepEqual(calculateStatsByDomain(attempts)[0], {
    id: "domain-5",
    name: "Domínio 5 - Security Program Management and Oversight",
    total: 2,
    correct: 1,
    wrong: 1,
    rate: 50,
  });
  assert.deepEqual(calculateStatsByTopic(attempts)[0], {
    id: "Privacidade",
    name: "Privacidade",
    total: 2,
    correct: 1,
    wrong: 1,
    rate: 50,
  });
});

test("srs increases intervals and records lapses", () => {
  const base = { intervalDays: 2, easeFactor: 2.5, reviewCount: 1, lapseCount: 0 };
  const good = nextSrs(base, "GOOD");
  const again = nextSrs(base, "AGAIN", { againToday: true });

  assert.ok(good.intervalDays > base.intervalDays);
  assert.equal(again.intervalDays, 0);
  assert.equal(again.lapseCount, 1);
});

test("srs handles hard and easy ratings with ease clamps", () => {
  const lowEase = nextSrs({ intervalDays: 2, easeFactor: 1.3, reviewCount: 0, lapseCount: 0 }, "AGAIN", { againToday: false });
  const hard = nextSrs({ intervalDays: 10, easeFactor: 2, reviewCount: 0, lapseCount: 0 }, "HARD");
  const easy = nextSrs({ intervalDays: 10, easeFactor: 2.95, reviewCount: 0, lapseCount: 0 }, "EASY");

  assert.equal(lowEase.intervalDays, 1);
  assert.equal(lowEase.easeFactor, 1.3);
  assert.equal(hard.intervalDays, 12);
  assert.equal(hard.easeFactor, 1.95);
  assert.equal(easy.intervalDays, 38);
  assert.equal(easy.easeFactor, 3);
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

test("dashboard reset kinds are intentionally limited", () => {
  const resetKinds = ["current", "allTimeAccuracy", "trainAnswered"];
  assert.deepEqual(resetKinds.sort(), ["allTimeAccuracy", "current", "trainAnswered"].sort());
});

test("practice-source analysis uses the later date between selected period and practice reset", () => {
  const now = new Date("2026-05-07T12:00:00.000Z");
  const resetBeforePeriod = new Date("2026-04-01T12:00:00.000Z");
  const resetAfterPeriod = new Date("2026-05-06T12:00:00.000Z");

  assert.deepEqual(getDashboardAnalysisWhere("30", "train", resetBeforePeriod, now), {
    mode: "TRAIN",
    createdAt: { gte: new Date("2026-04-07T12:00:00.000Z") },
  });
  assert.deepEqual(getDashboardAnalysisWhere("30", "train", resetAfterPeriod, now), {
    mode: "TRAIN",
    createdAt: { gte: resetAfterPeriod },
  });
});

test("exam-source analysis ignores the practice reset date", () => {
  const now = new Date("2026-05-07T12:00:00.000Z");
  const resetAt = new Date("2026-05-06T12:00:00.000Z");

  assert.deepEqual(getDashboardAnalysisWhere("7", "exam", resetAt, now), {
    mode: "EXAM",
    createdAt: { gte: new Date("2026-04-30T12:00:00.000Z") },
  });
});

test("all-source analysis excludes old practice attempts after practice reset", () => {
  const now = new Date("2026-05-07T12:00:00.000Z");
  const resetAt = new Date("2026-05-06T12:00:00.000Z");

  assert.deepEqual(getDashboardAnalysisWhere("all", "all", resetAt, now), {
    OR: [{ mode: "TRAIN", createdAt: { gte: resetAt } }, { NOT: { mode: "TRAIN" } }],
  });
});

test("all-source analysis keeps the selected period for non-practice attempts", () => {
  const now = new Date("2026-05-07T12:00:00.000Z");
  const resetAt = new Date("2026-05-06T12:00:00.000Z");
  const periodStart = new Date("2026-04-30T12:00:00.000Z");

  assert.deepEqual(getDashboardAnalysisWhere("7", "all", resetAt, now), {
    OR: [
      { mode: "TRAIN", createdAt: { gte: resetAt } },
      { NOT: { mode: "TRAIN" }, createdAt: { gte: periodStart } },
    ],
  });
});
