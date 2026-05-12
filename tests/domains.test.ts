import test from "node:test";
import assert from "node:assert/strict";
import {
  getDomainCounts,
  getDomainIdFromValue,
  getExamBlueprintCounts,
  getQuestionDomain,
  getQuestionDomainInfo,
  getQuestionTopic,
  getTopicCounts,
  normalizeText,
  sortDomains,
} from "../lib/domains";

test("normalize text removes accents and lowercases", () => {
  assert.equal(normalizeText("Domínio 1 - Segurança"), "dominio 1 - seguranca");
});

test("normalize domain aliases from subject, not theme", () => {
  const questionWithTopic = { subject: "D1", theme: "Privacidade" };
  assert.equal(getQuestionDomain(questionWithTopic), "Dominio 1 - General Security Concepts");
  assert.equal(getQuestionDomain({ subject: "Domínio 5 - Security Program Management and Oversight" }), "Domínio 5 - Security Program Management and Oversight");
  assert.equal(getQuestionDomainInfo({ subject: "Domain 2 - Threats" }).id, "domain-2");
  assert.equal(getDomainIdFromValue("Dominio 3 / Arquitetura"), "domain-3");
});

test("theme remains the topic source", () => {
  const question = {
    subject: "Domínio 5 - Security Program Management and Oversight",
    theme: "Privacidade",
  };

  assert.equal(getQuestionDomain(question), "Domínio 5 - Security Program Management and Oversight");
  assert.equal(getQuestionTopic(question), "Privacidade");
});

test("sort numbered domains naturally", () => {
  const domains = [{ name: "Dominio 10" }, { name: "Dominio 2" }, { name: "Dominio 1" }, { name: "Outro" }];
  domains.sort(sortDomains);
  assert.deepEqual(
    domains.map((domain) => domain.name),
    ["Dominio 1", "Dominio 2", "Dominio 10", "Outro"],
  );
});

test("count normalized domains by subject", () => {
  const counts = getDomainCounts([
    { subject: "D1", theme: "Privacidade" },
    { subject: "Dominio 1", theme: "Redes" },
    { subject: "Domain 2 - Threats", theme: "Privacidade" },
  ]);

  assert.deepEqual(counts, [
    { id: "domain-1", name: "Dominio 1 - General Security Concepts", count: 2, isMain: true },
    { id: "domain-2", name: "Domain 2 - Threats", count: 1, isMain: true },
  ]);
});

test("count topics by theme", () => {
  const counts = getTopicCounts([
    { subject: "Dominio 5", theme: "Privacidade" },
    { subject: "Dominio 5", theme: "Privacidade" },
    { subject: "Dominio 1", theme: "Criptografia" },
  ]);

  assert.deepEqual(counts, [
    { name: "Criptografia", count: 1 },
    { name: "Privacidade", count: 2 },
  ]);
});

test("build comptia exam blueprint counts", () => {
  const counts = getExamBlueprintCounts(90);
  assert.deepEqual(
    counts.map((domain) => [domain.id, domain.amount]),
    [
      ["domain-1", 11],
      ["domain-2", 20],
      ["domain-3", 16],
      ["domain-4", 25],
      ["domain-5", 18],
    ],
  );
});

test("blueprint counts always sum to requested total", () => {
  for (let total = 1; total <= 120; total++) {
    const sum = getExamBlueprintCounts(total).reduce((acc, domain) => acc + domain.amount, 0);
    assert.equal(sum, total);
  }
});
