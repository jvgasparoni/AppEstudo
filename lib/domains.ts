type DomainSource = {
  subject?: string | null;
};

type TopicSource = {
  theme?: string | null;
};

type DomainCountOptions = {
  mainOnly?: boolean;
};

export type QuestionDomainInfo = {
  id: string;
  label: string;
  number: number | null;
  isMain: boolean;
};

export const comptiaSecurityPlusExamDomains = [
  {
    id: "domain-1",
    number: 1,
    domain: "Dominio 1 - General Security Concepts",
    title: "General Security Concepts",
    percentage: 12,
    description: "Controles, CIA/AAA, Zero Trust, change management, fundamentos de criptografia e PKI",
  },
  {
    id: "domain-2",
    number: 2,
    domain: "Dominio 2 - Threats, Vulnerabilities, and Mitigations",
    title: "Threats, Vulnerabilities, and Mitigations",
    percentage: 22,
    description: "Atores, vetores, vulnerabilidades, malware, ataques e formas de mitigacao",
  },
  {
    id: "domain-3",
    number: 3,
    domain: "Dominio 3 - Security Architecture",
    title: "Security Architecture",
    percentage: 18,
    description: "Arquitetura segura, cloud, virtualizacao, segmentacao, protecao de dados, resiliencia e continuidade",
  },
  {
    id: "domain-4",
    number: 4,
    domain: "Dominio 4 - Security Operations",
    title: "Security Operations",
    percentage: 28,
    description: "Hardening, ativos, vulnerabilidades, monitoramento, IAM operacional, automacao, incidentes e forense",
  },
  {
    id: "domain-5",
    number: 5,
    domain: "Dominio 5 - Security Program Management and Oversight",
    title: "Security Program Management and Oversight",
    percentage: 20,
    description: "Governanca, risco, terceiros, compliance, auditoria e awareness",
  },
] as const;

const mainDomainByNumber = new Map<number, (typeof comptiaSecurityPlusExamDomains)[number]>(
  comptiaSecurityPlusExamDomains.map((domain) => [domain.number, domain]),
);

export function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function slugify(value: string) {
  return (
    normalizeText(value)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "sem-dominio"
  );
}

export function getQuestionTopic(question: TopicSource) {
  return question.theme?.trim() || "Sem tema";
}

export function getQuestionDomainInfo(question: DomainSource): QuestionDomainInfo {
  const raw = question.subject?.trim() || "";
  const normalized = normalizeText(raw);
  const match = normalized.match(/\b(?:dominio|domain|d)\s*[-_:/]?\s*(\d{1,2})\b/);
  const number = match ? Number(match[1]) : null;
  const mainDomain = number ? mainDomainByNumber.get(number) : null;

  if (mainDomain) {
    const hasSpecificLabel = normalized.replace(/[-_:/\s]/g, "") !== `dominio${number}` && normalized.replace(/[-_:/\s]/g, "") !== `domain${number}` && normalized !== `d${number}`;
    return {
      id: mainDomain.id,
      label: hasSpecificLabel ? raw : mainDomain.domain,
      number: mainDomain.number,
      isMain: true,
    };
  }

  return {
    id: `subject-${slugify(raw)}`,
    label: raw || "Sem dominio",
    number,
    isMain: false,
  };
}

export function getQuestionDomain(question: DomainSource) {
  return getQuestionDomainInfo(question).label;
}

export function getDomainIdFromValue(value: string) {
  const raw = value.trim();
  if (!raw) return "";

  const direct = raw.match(/^domain-([1-5])$/i);
  if (direct) return `domain-${direct[1]}`;

  return getQuestionDomainInfo({ subject: raw }).id;
}

export function getDomainLabelFromValue(value: string) {
  const raw = value.trim();
  const id = getDomainIdFromValue(raw);
  const mainDomain = comptiaSecurityPlusExamDomains.find((domain) => domain.id === id);
  return mainDomain?.domain || getQuestionDomainInfo({ subject: raw }).label;
}

export function sortDomains(a: { name: string; id?: string }, b: { name: string; id?: string }) {
  const aNumber = a.id?.match(/^domain-(\d+)$/)?.[1] ?? normalizeText(a.name).match(/\bdominio\s*(\d{1,2})\b/)?.[1];
  const bNumber = b.id?.match(/^domain-(\d+)$/)?.[1] ?? normalizeText(b.name).match(/\bdominio\s*(\d{1,2})\b/)?.[1];

  if (aNumber && bNumber) return Number(aNumber) - Number(bNumber);
  if (aNumber) return -1;
  if (bNumber) return 1;
  return a.name.localeCompare(b.name);
}

export function getDomainCounts<T extends DomainSource>(questions: T[], options: DomainCountOptions = {}) {
  const counts = new Map<string, { id: string; name: string; count: number; isMain: boolean }>();

  for (const question of questions) {
    const domain = getQuestionDomainInfo(question);
    if (options.mainOnly && !domain.isMain) continue;

    const current = counts.get(domain.id) || { id: domain.id, name: domain.label, count: 0, isMain: domain.isMain };
    current.count++;
    counts.set(domain.id, current);
  }

  return Array.from(counts.values()).sort(sortDomains);
}

export function getTopicCounts<T extends TopicSource>(questions: T[]) {
  const counts = new Map<string, number>();

  for (const question of questions) {
    const topic = getQuestionTopic(question);
    counts.set(topic, (counts.get(topic) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
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
