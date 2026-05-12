import { getQuestionDomain, sortDomains } from "./domains";

type ExamForStats = {
  attempts: Array<{
    correct: boolean;
    createdAt: Date;
    question: {
      subject: string;
      theme: string;
    };
  }>;
  examQuestions: Array<unknown>;
};

export function getExamStats(exam: ExamForStats) {
  const attempts = exam.attempts;
  const total = attempts.length || exam.examQuestions.length;
  const correct = attempts.filter((attempt) => attempt.correct).length;
  const wrong = attempts.length ? attempts.length - correct : 0;
  const percentage = attempts.length ? Math.round((correct / attempts.length) * 100) : 0;
  const completedAt = attempts.reduce<Date | null>((latest, attempt) => {
    if (!latest || attempt.createdAt > latest) return attempt.createdAt;
    return latest;
  }, null);

  const byDomain = new Map<string, { domain: string; total: number; correct: number; wrong: number; percentage: number }>();
  for (const attempt of attempts) {
    const domain = getQuestionDomain(attempt.question);
    const current = byDomain.get(domain) || { domain, total: 0, correct: 0, wrong: 0, percentage: 0 };
    current.total++;
    if (attempt.correct) current.correct++;
    else current.wrong++;
    current.percentage = Math.round((current.correct / current.total) * 100);
    byDomain.set(domain, current);
  }

  return {
    total,
    correct,
    wrong,
    percentage,
    completedAt,
    byDomain: Array.from(byDomain.values()).sort((a, b) => sortDomains({ name: a.domain }, { name: b.domain })),
  };
}
