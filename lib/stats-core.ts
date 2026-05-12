import { getQuestionDomainInfo, getQuestionTopic, sortDomains } from "./domains";

type AttemptForStats = {
  correct: boolean;
  question: {
    subject: string;
    theme: string;
  };
};

export type PerformanceGroup = {
  id: string;
  name: string;
  total: number;
  correct: number;
  wrong: number;
  rate: number;
};

function emptyGroup(id: string, name: string): PerformanceGroup {
  return { id, name, total: 0, correct: 0, wrong: 0, rate: 0 };
}

function addAttempt(group: PerformanceGroup, correct: boolean) {
  group.total++;
  if (correct) group.correct++;
  else group.wrong++;
  group.rate = Math.round((group.correct / group.total) * 100);
}

export function calculateStatsByDomain(attempts: AttemptForStats[]) {
  const byDomain = new Map<string, PerformanceGroup>();

  for (const attempt of attempts) {
    const domain = getQuestionDomainInfo(attempt.question);
    const group = byDomain.get(domain.id) || emptyGroup(domain.id, domain.label);
    addAttempt(group, attempt.correct);
    byDomain.set(domain.id, group);
  }

  return Array.from(byDomain.values()).sort(sortDomains);
}

export function calculateStatsByTopic(attempts: AttemptForStats[]) {
  const byTopic = new Map<string, PerformanceGroup>();

  for (const attempt of attempts) {
    const topic = getQuestionTopic(attempt.question);
    const group = byTopic.get(topic) || emptyGroup(topic, topic);
    addAttempt(group, attempt.correct);
    byTopic.set(topic, group);
  }

  return Array.from(byTopic.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function toRecord(groups: PerformanceGroup[]) {
  return Object.fromEntries(groups.map((group) => [group.name, { total: group.total, correct: group.correct }]));
}

export function summarizeAttempts(attempts: AttemptForStats[]) {
  const total = attempts.length;
  const correct = attempts.filter((a) => a.correct).length;
  const byDomain = calculateStatsByDomain(attempts);
  const byTopic = calculateStatsByTopic(attempts);

  return {
    total,
    correct,
    rate: total ? Math.round((correct / total) * 100) : 0,
    bySubject: toRecord(byDomain),
    byTheme: toRecord(byTopic),
    byDomain,
    byTopic,
  };
}

export function summarizeByDomainTopic(attempts: AttemptForStats[]) {
  const byDomain = new Map<
    string,
    PerformanceGroup & {
      topics: Map<string, PerformanceGroup & { topic: string }>;
    }
  >();

  for (const attempt of attempts) {
    const domainInfo = getQuestionDomainInfo(attempt.question);
    const topicName = getQuestionTopic(attempt.question);
    const domain = byDomain.get(domainInfo.id) || {
      ...emptyGroup(domainInfo.id, domainInfo.label),
      topics: new Map<string, PerformanceGroup & { topic: string }>(),
    };
    const topic = domain.topics.get(topicName) || { ...emptyGroup(topicName, topicName), topic: topicName };

    addAttempt(domain, attempt.correct);
    addAttempt(topic, attempt.correct);

    domain.topics.set(topicName, topic);
    byDomain.set(domainInfo.id, domain);
  }

  return Array.from(byDomain.values())
    .sort(sortDomains)
    .map((domain) => ({
      id: domain.id,
      domain: domain.name,
      total: domain.total,
      correct: domain.correct,
      wrong: domain.wrong,
      rate: domain.rate,
      topics: Array.from(domain.topics.values())
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((topic) => ({
          topic: topic.name,
          total: topic.total,
          correct: topic.correct,
          wrong: topic.wrong,
          rate: topic.rate,
        })),
    }));
}

export const summarizeByDomainSubtheme = summarizeByDomainTopic;
