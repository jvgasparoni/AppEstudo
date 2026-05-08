import test from "node:test";
import assert from "node:assert/strict";
import {
  getQuestionOptionText,
  isQuestionOption,
  normalizeDifficulty,
  questionDifficultyLabels,
  readQuestionFormData,
  validateQuestionInput,
} from "../lib/questions";

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

test("validate question options and option text helper", () => {
  assert.equal(isQuestionOption("A"), true);
  assert.equal(isQuestionOption("Z"), false);
  assert.equal(getQuestionOptionText(baseQuestion, "D"), "D");
});

test("read question form data trims text and normalizes optional fields", () => {
  const formData = new FormData();
  formData.set("statement", " Pergunta ");
  formData.set("optionA", " A ");
  formData.set("optionB", " B ");
  formData.set("optionC", " C ");
  formData.set("optionD", " D ");
  formData.set("optionE", " E ");
  formData.set("correctOption", " a ");
  formData.set("explanation", " Exp ");
  formData.set("subject", " Materia ");
  formData.set("theme", " Tema ");
  formData.set("difficulty", "INVALID");

  assert.deepEqual(readQuestionFormData(formData), {
    statement: "Pergunta",
    optionA: "A",
    optionB: "B",
    optionC: "C",
    optionD: "D",
    optionE: "E",
    correctOption: "A",
    explanation: "Exp",
    subject: "Materia",
    theme: "Tema",
    subtheme: null,
    difficulty: "MEDIUM",
    tags: "",
    source: null,
  });
});

test("question difficulty labels cover every difficulty", () => {
  assert.deepEqual(questionDifficultyLabels, {
    EASY: "Facil",
    MEDIUM: "Medio",
    HARD: "Dificil",
  });
});
