import test from "node:test";
import assert from "node:assert/strict";
import { parseFreeTextQuestions } from "../lib/import-parser";

test("parse multiple questions", () => {
  const text = `Enunciado: Q1\n\nA) a\nB) b\nC) c\nD) d\nE) e\n\nResposta correta: C\nExplicação: ok\n\nMatéria: Mat\nTema: T1\nDificuldade: fácil\n\nEnunciado: Q2\n\nA) a\nB) b\nC) c\nD) d\nE) e\n\nResposta correta: A\nExplicação: ok\n\nMatéria: Geo\nTema: T2\nDificuldade: médio`;
  const res = parseFreeTextQuestions(text);
  assert.equal(res.length, 2);
  assert.equal(res[0].errors.length, 0);
});
