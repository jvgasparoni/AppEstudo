import { prisma } from "./prisma";
import { summarizeAttempts } from "./stats-core";

export { summarizeAttempts };

export async function getDashboard() {
  const [q, f, attempts] = await Promise.all([
    prisma.question.count(),
    prisma.flashcard.count(),
    prisma.questionAttempt.findMany({ include: { question: true } }),
  ]);
  return { q, f, attempts: attempts.length, ...summarizeAttempts(attempts) };
}
