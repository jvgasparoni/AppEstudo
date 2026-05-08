type DomainSource = {
  theme?: string | null;
  tags?: string | null;
};

export const comptiaSecurityPlusExamDomains = [
  {
    domain: "Dominio 1",
    title: "General Security Concepts",
    percentage: 12,
    description: "Controles, CIA/AAA, Zero Trust, change management, fundamentos de criptografia e PKI",
  },
  {
    domain: "Dominio 2",
    title: "Threats, Vulnerabilities, and Mitigations",
    percentage: 22,
    description: "Atores, vetores, vulnerabilidades, malware, ataques e formas de mitigacao",
  },
  {
    domain: "Dominio 3",
    title: "Security Architecture",
    percentage: 18,
    description: "Arquitetura segura, cloud, virtualizacao, segmentacao, protecao de dados, resiliencia e continuidade",
  },
  {
    domain: "Dominio 4",
    title: "Security Operations",
    percentage: 28,
    description: "Hardening, ativos, vulnerabilidades, monitoramento, IAM operacional, automacao, incidentes e forense",
  },
  {
    domain: "Dominio 5",
    title: "Security Program Management and Oversight",
    percentage: 20,
    description: "Governanca, risco, terceiros, compliance, auditoria e awareness",
  },
] as const;

export function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function getQuestionDomain(question: DomainSource) {
  const raw = `${question.theme || ""} ${question.tags || ""}`;
  const normalized = normalizeText(raw);
  const match = normalized.match(/\b(?:dominio|domain|d)\s*[-_:/]?\s*(\d{1,2})\b/);

  if (match) return `Dominio ${Number(match[1])}`;
  return question.theme?.trim() || "Sem dominio";
}

export function sortDomains(a: { name: string }, b: { name: string }) {
  const aNumber = normalizeText(a.name).match(/\bdominio\s*(\d{1,2})\b/)?.[1];
  const bNumber = normalizeText(b.name).match(/\bdominio\s*(\d{1,2})\b/)?.[1];

  if (aNumber && bNumber) return Number(aNumber) - Number(bNumber);
  if (aNumber) return -1;
  if (bNumber) return 1;
  return a.name.localeCompare(b.name);
}

export function getDomainCounts<T extends DomainSource>(questions: T[]) {
  const counts = new Map<string, number>();
  for (const question of questions) {
    const domain = getQuestionDomain(question);
    counts.set(domain, (counts.get(domain) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort(sortDomains);
}

export function getExamBlueprintCounts(totalQuestions: number) {
  const safeTotal = Math.max(0, Math.floor(totalQuestions));
  const raw = comptiaSecurityPlusExamDomains.map((domain) => {
    const exact = (safeTotal * domain.percentage) / 100;
    const amount = Math.floor(exact);
    return { ...domain, amount, remainder: exact - amount };
  });

  let remaining = safeTotal - raw.reduce((sum, domain) => sum + domain.amount, 0);
  for (const domain of [...raw].sort((a, b) => b.remainder - a.remainder)) {
    if (remaining <= 0) break;
    domain.amount++;
    remaining--;
  }

  return raw.map(({ remainder: _remainder, ...domain }) => domain);
}
