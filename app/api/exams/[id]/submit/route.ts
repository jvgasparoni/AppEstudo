import { prisma } from "@/lib/prisma";
import { isCorrect } from "@/lib/srs";
import { Prisma } from "@prisma/client";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const examId = Number(params.id);
  const body = (await req.json()) as { answers: Array<{ questionId: number; selectedOption: string }> };
  const exam = await prisma.exam.findUnique({ where: { id: examId }, include: { examQuestions: { include: { question: true } } } });
  if (!exam) return Response.json({ message: "Simulado não encontrado" }, { status: 404 });

  const map = new Map<number, string>(body.answers.map((a) => [a.questionId, a.selectedOption]));
  const created: { questionId: number; correct: boolean; selectedOption: string; subject: string; theme: string }[] = [];

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    for (const eq of exam.examQuestions) {
      const selectedOption = map.get(eq.questionId);
      if (!selectedOption) continue;
      const correct = isCorrect(selectedOption, eq.question.correctOption);
      await tx.questionAttempt.create({ data: { questionId: eq.questionId, examId, selectedOption, correct, mode: "EXAM" } });
      created.push({ questionId: eq.questionId, correct, selectedOption, subject: eq.question.subject, theme: eq.question.theme });
    }
  });

  const total = created.length;
  const correctCount = created.filter((x) => x.correct).length;
  const percentage = total ? Math.round((correctCount / total) * 100) : 0;
  return Response.json({ examId, total, correct: correctCount, wrong: total - correctCount, percentage });
}
