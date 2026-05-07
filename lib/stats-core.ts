import { getQuestionDomain, sortDomains } from "./domains";

type AttemptForStats = {
  correct: boolean;
  question: {
    subject: string;
    theme: string;
    tags?: string | null;
    subtheme?: string | null;
  };
};

export function summarizeAttempts(attempts: AttemptForStats[]) {
  const total = attempts.length;
  const correct = attempts.filter((a) => a.correct).length;
  const bySubject: Record<string, { total: number; correct: number }> = {};
  const byTheme: Record<string, { total: number; correct: number }> = {};

  for (const a of attempts) {
    bySubject[a.question.subject] ??= { total: 0, correct: 0 };
    byTheme[a.question.theme] ??= { total: 0, correct: 0 };
    bySubject[a.question.subject].total++;
    byTheme[a.question.theme].total++;
    if (a.correct) {
      bySubject[a.question.subject].correct++;
      byTheme[a.question.theme].correct++;
    }
  }

  return { total, correct, rate: total ? Math.round((correct / total) * 100) : 0, bySubject, byTheme };
}

export function summarizeByDomainSubtheme(attempts: AttemptForStats[]) {
  const byDomain = new Map<
    string,
    {
      domain: string;
      total: number;
      correct: number;
      wrong: number;
      rate: number;
      subthemes: Map<string, { subtheme: string; total: number; correct: number; wrong: number; rate: number }>;
    }
  >();

  for (const attempt of attempts) {
    const domainName = getQuestionDomain(attempt.question);
    const subthemeName = attempt.question.subtheme?.trim() || "Sem subtema";
    const domain = byDomain.get(domainName) || {
      domain: domainName,
      total: 0,
      correct: 0,
      wrong: 0,
      rate: 0,
      subthemes: new Map<string, { subtheme: string; total: number; correct: number; wrong: number; rate: number }>(),
    };
    const subtheme = domain.subthemes.get(subthemeName) || { subtheme: subthemeName, total: 0, correct: 0, wrong: 0, rate: 0 };

    domain.total++;
    subtheme.total++;
    if (attempt.correct) {
      domain.correct++;
      subtheme.correct++;
    } else {
      domain.wrong++;
      subtheme.wrong++;
    }
    domain.rate = Math.round((domain.correct / domain.total) * 100);
    subtheme.rate = Math.round((subtheme.correct / subtheme.total) * 100);

    domain.subthemes.set(subthemeName, subtheme);
    byDomain.set(domainName, domain);
  }

  return Array.from(byDomain.values())
    .sort((a, b) => sortDomains({ name: a.domain }, { name: b.domain }))
    .map((domain) => ({
      domain: domain.domain,
      total: domain.total,
      correct: domain.correct,
      wrong: domain.wrong,
      rate: domain.rate,
      subthemes: Array.from(domain.subthemes.values()).sort((a, b) => a.subtheme.localeCompare(b.subtheme)),
    }));
}
