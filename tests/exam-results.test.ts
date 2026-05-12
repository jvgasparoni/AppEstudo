import test from "node:test";
import assert from "node:assert/strict";
import { getExamStats } from "../lib/exam-results";

test("calculate exam stats by domain", () => {
  const completedAt = new Date("2026-05-07T12:00:00.000Z");
  const stats = getExamStats({
    examQuestions: [{}, {}, {}],
    attempts: [
      { correct: true, createdAt: new Date("2026-05-07T11:00:00.000Z"), question: { subject: "D1", theme: "Privacidade" } },
      { correct: false, createdAt: completedAt, question: { subject: "Dominio 1", theme: "Criptografia" } },
      { correct: true, createdAt: new Date("2026-05-07T10:00:00.000Z"), question: { subject: "D2", theme: "Privacidade" } },
    ],
  });

  assert.equal(stats.total, 3);
  assert.equal(stats.correct, 2);
  assert.equal(stats.wrong, 1);
  assert.equal(stats.percentage, 67);
  assert.equal(stats.completedAt, completedAt);
  assert.deepEqual(stats.byDomain, [
    { domain: "Dominio 1 - General Security Concepts", total: 2, correct: 1, wrong: 1, percentage: 50 },
    { domain: "Dominio 2 - Threats, Vulnerabilities, and Mitigations", total: 1, correct: 1, wrong: 0, percentage: 100 },
  ]);
});

test("handle unfinished exam stats", () => {
  const stats = getExamStats({ examQuestions: [{}, {}], attempts: [] });

  assert.equal(stats.total, 2);
  assert.equal(stats.correct, 0);
  assert.equal(stats.wrong, 0);
  assert.equal(stats.percentage, 0);
  assert.equal(stats.completedAt, null);
});
