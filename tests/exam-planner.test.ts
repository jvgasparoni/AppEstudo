import test from "node:test";
import assert from "node:assert/strict";
import { buildCustomDomainPlan, buildExamBlueprintPlan } from "../lib/exam-planner";

const keepOrder = <T>(items: T[]) => items;

function questions(domain: string, amount: number, start = 1, theme = "Tema qualquer") {
  return Array.from({ length: amount }, (_, index) => ({ id: start + index, subject: domain, theme }));
}

test("build custom domain plan with more than one domain from subject", () => {
  const result = buildCustomDomainPlan(
    [...questions("Dominio 1", 3, 1, "Privacidade"), ...questions("Dominio 2", 3, 10, "Malware")],
    [
      { domainId: "domain-1", amount: 2 },
      { domainId: "domain-2", amount: 1 },
    ],
    keepOrder,
  );

  assert.equal(result.ok, true);
  if (result.ok) assert.deepEqual(result.selectedIds, [1, 2, 10]);
});

test("custom domain plan reports shortage clearly", () => {
  const result = buildCustomDomainPlan(questions("Dominio 1", 1), [{ domainId: "domain-1", amount: 2 }], keepOrder);

  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.message, /existem 1 questao/);
});

test("custom domain plan accepts domain aliases and empty requests", () => {
  const result = buildCustomDomainPlan(questions("Dominio 1", 2), [{ domain: "D1", amount: 1 }], keepOrder);
  const legacy = buildCustomDomainPlan(questions("Dominio 1", 2), [{ theme: "Dominio 1", amount: 1 }], keepOrder);
  const empty = buildCustomDomainPlan(questions("Dominio 1", 2), undefined, keepOrder);

  assert.equal(result.ok, true);
  if (result.ok) assert.deepEqual(result.selectedIds, [1]);
  assert.equal(legacy.ok, true);
  assert.equal(empty.ok, false);
  if (!empty.ok) assert.match(empty.message, /ao menos um dominio/);
});

test("build exam blueprint plan using comptia proportions", () => {
  const source = [
    ...questions("Dominio 1", 20, 100),
    ...questions("Dominio 2", 20, 200),
    ...questions("Dominio 3", 20, 300),
    ...questions("Dominio 4", 20, 400),
    ...questions("Dominio 5", 20, 500),
  ];

  const result = buildExamBlueprintPlan(source, 10, keepOrder);

  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.selectedIds.length, 10);
});

test("exam blueprint plan validates requested amount", () => {
  assert.deepEqual(buildExamBlueprintPlan(questions("Dominio 1", 2), 0, keepOrder), {
    ok: false,
    message: "Informe uma quantidade valida de questoes.",
  });
});

test("exam blueprint ignores non-domain subjects when validating availability", () => {
  const result = buildExamBlueprintPlan([...questions("Dominio 1", 2), ...questions("Tema solto", 20, 50)], 10, keepOrder);

  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.message, /dominios principais/);
});

test("exam blueprint plan validates domain availability", () => {
  const source = [
    ...questions("Dominio 1", 30, 100),
    ...questions("Dominio 2", 30, 200),
    ...questions("Dominio 3", 30, 300),
    ...questions("Dominio 4", 1, 400),
    ...questions("Dominio 5", 30, 500),
  ];

  const result = buildExamBlueprintPlan(source, 90, keepOrder);

  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.message, /Dominio 4/);
});
