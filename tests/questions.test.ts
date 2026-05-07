import test from "node:test";
import assert from "node:assert/strict";
import { normalizeDifficulty, validateQuestionInput } from "../lib/questions";

const baseQuestion = {
  statement: "Pergunta",
  optionA: "A",
  optionB: "B",
  optionC: "C",
  optionD: "D",
  optionE: "E",
  correctOption: "A",
  explanation: "Porque sim",
  subject: "Materia",
  theme: "Tema",
  subtheme: null,
  difficulty: "MEDIUM" as const,
  tags: "",
  source: null,
};

test("validate valid question input", () => {
  assert.equal(validateQuestionInput(baseQuestion), null);
});

test("validate missing question fields", () => {
  assert.match(validateQuestionInput({ ...baseQuestion, statement: "", optionA: "" }) || "", /statement, optionA/);
});

test("validate correct option", () => {
  assert.match(validateQuestionInput({ ...baseQuestion, correctOption: "Z" }) || "", /Resposta correta/);
});

test("normalize difficulty fallback", () => {
  assert.equal(normalizeDifficulty("HARD"), "HARD");
  assert.equal(normalizeDifficulty("unknown"), "MEDIUM");
});
