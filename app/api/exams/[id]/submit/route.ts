import { prisma } from "@/lib/prisma";
import { isQuestionOption } from "@/lib/questions";
import { isCorrect } from "@/lib/srs";
import { Prisma } from "@prisma/client";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const examId = Number(params.id);
  if (!Number.isInteger(examId)) return Response.json({ message: "ID invalido" }, { status: 400 });

  const body = (await req.json().catch(() => ({}))) as { answers?: Array<{ questionId: number; selectedOption: string }> };
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      examQuestions: { include: { question: true } },
    },
  });
  if (!exam) return Response.json({ message: "Simulado nao encontrado" }, { status: 404 });

  const map = new Map<number, string>((body.answers || []).map((answer) => [Number(answer.questionId), String(answer.selectedOption || "").toUpperCase()]));
  const missing = exam.examQuestions.filter((examQuestion) => !isQuestionOption(map.get(examQuestion.questionId) || ""));
  if (missing.length) return Response.json({ message: "Responda todas as questoes antes de finalizar." }, { status: 400 });

  const created: { correct: boolean }[] = [];

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.questionAttempt.deleteMany({ where: { examId } });

    for (const examQuestion of exam.examQuestions) {
      const selectedOption = map.get(examQuestion.questionId)!;
      const correct = isCorrect(selectedOption, examQuestion.question.correctOption);
      await tx.questionAttempt.create({
        data: {
          questionId: examQuestion.questionId,
          examId,
          selectedOption,
          correct,
          mode: "EXAM",
        },
      });
      created.push({ correct });
    }
  });

  const total = created.length;
  const correct = created.filter((item) => item.correct).length;
  return Response.json({ examId, total, correct, wrong: total - correct, percentage: total ? Math.round((correct / total) * 100) : 0 });
}
