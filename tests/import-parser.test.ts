import test from "node:test";
import assert from "node:assert/strict";
import { parseFreeTextQuestions } from "../lib/import-parser";

test("parse multiple questions without blank lines between blocks", () => {
  const text = `Enunciado: Q1
A) a
B) b
C) c
D) d
E) e
Resposta correta: C
Explicacao: ok
Materia: Mat
Tema: T1
Dificuldade: facil
Enunciado: Q2
A) aa
B) bb
C) cc
D) dd
E) ee
Resposta correta: A
Explicacao: ok
Materia: Geo
Tema: T2
Dificuldade: medio`;

  const res = parseFreeTextQuestions(text);
  assert.equal(res.length, 2);
  assert.equal(res[0].errors.length, 0);
  assert.equal(res[0].parsed?.optionA, "a");
  assert.equal(res[0].parsed?.optionB, "b");
  assert.equal(res[0].parsed?.optionE, "e");
  assert.equal(res[1].parsed?.optionA, "aa");
});

test("parse security plus question format with accented labels", () => {
  const text = `Enunciado: Qual termo melhor descreve a finalidade de seguran\u00e7a?
A) Controle operacional
B) Controle gerencial
C) Controle f\u00edsico
D) Controle t\u00e9cnico
E) N\u00e3o se aplica / op\u00e7\u00e3o n\u00e3o utilizada
Resposta correta: D
Explica\u00e7\u00e3o: Controle t\u00e9cnico \u00e9 a resposta correta.
Mat\u00e9ria: CompTIA Security+ SY0-701
Tema: Dom\u00ednio 1 - General Security Concepts
Subtema: Controle t\u00e9cnico
Dificuldade: MEDIUM
Tags: security-plus, sy0-701, d1
Fonte: arquivo.docx`;

  const res = parseFreeTextQuestions(text);
  assert.equal(res.length, 1);
  assert.equal(res[0].errors.length, 0);
  assert.equal(res[0].parsed?.optionA, "Controle operacional");
  assert.equal(res[0].parsed?.optionB, "Controle gerencial");
  assert.equal(res[0].parsed?.optionC, "Controle f\u00edsico");
  assert.equal(res[0].parsed?.optionD, "Controle t\u00e9cnico");
  assert.equal(res[0].parsed?.optionE, "N\u00e3o se aplica / op\u00e7\u00e3o n\u00e3o utilizada");
  assert.equal(res[0].parsed?.correctOption, "D");
  assert.equal(res[0].parsed?.subject, "CompTIA Security+ SY0-701");
});

test("returns useful errors for incomplete questions", () => {
  const [res] = parseFreeTextQuestions(`Enunciado: Sem alternativas
Resposta correta: A
Tema: T`);

  assert.ok(res.errors.includes("Alternativas A-E incompletas"));
  assert.ok(res.errors.includes("Explicacao ausente"));
  assert.ok(res.errors.includes("Materia ausente"));
});

test("parse multiline options without merging alternatives", () => {
  const text = `Enunciado: Qual alternativa possui duas linhas?
A. Primeira linha da alternativa A
continua aqui
B. Alternativa B
C. Alternativa C
D. Alternativa D
E. Alternativa E
Resposta correta: A
Explicacao: A alternativa A continua em duas linhas.
Materia: Mat
Tema: D1
Dificuldade: medio`;

  const [res] = parseFreeTextQuestions(text);

  assert.equal(res.errors.length, 0);
  assert.equal(res.parsed?.optionA, "Primeira linha da alternativa A\ncontinua aqui");
  assert.equal(res.parsed?.optionB, "Alternativa B");
  assert.equal(res.parsed?.optionE, "Alternativa E");
});
