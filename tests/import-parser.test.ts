import test from "node:test";
import assert from "node:assert/strict";
import { parseFreeTextQuestions } from "../lib/import-parser";

test("parse multiple questions with separated options", () => {
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

test("parse security plus question format without blank lines", () => {
  const text = `Enunciado: Qual termo melhor descreve a seguinte finalidade de segurança: implementar proteção por meio de tecnologia, como software, hardware ou mecanismos lógicos?
A) Controle operacional
B) Controle gerencial
C) Controle físico
D) Controle técnico
E) Não se aplica / opção não utilizada
Resposta correta: D
Explicação: Controle técnico é a resposta correta porque seu objetivo principal é implementar proteção por meio de tecnologia, como software, hardware ou mecanismos lógicos. No contexto do enunciado, isso aparece quando uma empresa decide aplicar MFA, regras de firewall e criptografia em disco para reduzir exposição.
Matéria: CompTIA Security+ SY0-701
Tema: Domínio 1 — General Security Concepts / Conceitos Gerais de Segurança
Subtema: Controle técnico
Dificuldade: MEDIUM
Tags: security-plus, sy0-701, d1, conceitos gerais de segurança
Fonte: D1_conceitos_gerais_de_seguranca_100_questoes(1).docx`;

  const res = parseFreeTextQuestions(text);
  assert.equal(res.length, 1);
  assert.equal(res[0].errors.length, 0);
  assert.equal(res[0].parsed?.optionA, "Controle operacional");
  assert.equal(res[0].parsed?.optionB, "Controle gerencial");
  assert.equal(res[0].parsed?.optionC, "Controle físico");
  assert.equal(res[0].parsed?.optionD, "Controle técnico");
  assert.equal(res[0].parsed?.optionE, "Não se aplica / opção não utilizada");
  assert.equal(res[0].parsed?.correctOption, "D");
  assert.equal(res[0].parsed?.subject, "CompTIA Security+ SY0-701");
});
