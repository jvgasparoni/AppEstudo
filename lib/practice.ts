type PracticeQuestion = {
  _count: {
    attempts: number;
  };
};

export function pickLeastAttemptedQuestion<T extends PracticeQuestion>(questions: T[], random = Math.random) {
  if (!questions.length) return null;

  const minAttempts = Math.min(...questions.map((question) => question._count.attempts));
  const leastAttempted = questions.filter((question) => question._count.attempts === minAttempts);
  const index = Math.min(Math.floor(random() * leastAttempted.length), leastAttempted.length - 1);
  return leastAttempted[index];
}
