import test from "node:test";
import assert from "node:assert/strict";
import { getDomainCounts, getExamBlueprintCounts, getQuestionDomain, normalizeText, sortDomains } from "../lib/domains";

test("normalize text removes accents and lowercases", () => {
  assert.equal(normalizeText("Domínio 1 — Segurança"), "dominio 1 — seguranca");
});

test("normalize domain aliases", () => {
  assert.equal(getQuestionDomain({ theme: "D1" }), "Dominio 1");
  assert.equal(getQuestionDomain({ theme: "Dom\u00ednio 1 - General Security Concepts" }), "Dominio 1");
  assert.equal(getQuestionDomain({ theme: "Dominio 2 / Ameacas" }), "Dominio 2");
  assert.equal(getQuestionDomain({ theme: "Conceitos gerais", tags: "security-plus, d3" }), "Dominio 3");
});

test("sort numbered domains naturally", () => {
  const domains = [{ name: "Dominio 10" }, { name: "Dominio 2" }, { name: "Dominio 1" }, { name: "Outro" }];
  domains.sort(sortDomains);
  assert.deepEqual(
    domains.map((domain) => domain.name),
    ["Dominio 1", "Dominio 2", "Dominio 10", "Outro"],
  );
});

test("count normalized domains", () => {
  const counts = getDomainCounts([
    { theme: "D1", tags: "" },
    { theme: "Dominio 1", tags: "" },
    { theme: "Tema solto", tags: "security-plus, d2" },
  ]);

  assert.deepEqual(counts, [
    { name: "Dominio 1", count: 2 },
    { name: "Dominio 2", count: 1 },
  ]);
});

test("build comptia exam blueprint counts", () => {
  const counts = getExamBlueprintCounts(90);
  assert.deepEqual(
    counts.map((domain) => [domain.domain, domain.amount]),
    [
      ["Dominio 1", 11],
      ["Dominio 2", 20],
      ["Dominio 3", 16],
      ["Dominio 4", 25],
      ["Dominio 5", 18],
    ],
  );
});

test("blueprint counts always sum to requested total", () => {
  for (let total = 1; total <= 120; total++) {
    const sum = getExamBlueprintCounts(total).reduce((acc, domain) => acc + domain.amount, 0);
    assert.equal(sum, total);
  }
});
