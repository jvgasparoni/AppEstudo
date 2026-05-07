export function summarizeAttempts(attempts: Array<{ correct: boolean; question: { subject: string; theme: string } }>) {
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
