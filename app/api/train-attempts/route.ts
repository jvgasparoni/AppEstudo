import { prisma } from "@/lib/prisma";
import { isQuestionOption } from "@/lib/questions";
import { isCorrect } from "@/lib/srs";
import { redirect } from "next/navigation";

export async function POST(req: Request) {
  const f = await req.formData();
  const questionId = Number(f.get("questionId"));
  const selectedOption = String(f.get("selectedOption") || "").trim().toUpperCase();

  if (!Number.isInteger(questionId) || !isQuestionOption(selectedOption)) {
    return Response.json({ message: "Resposta invalida" }, { status: 400 });
  }

  const question = await prisma.question.findUnique({ where: { id: questionId } });
  if (!question) return new Response("Not found", { status: 404 });

  const correct = isCorrect(selectedOption, question.correctOption);
  await prisma.questionAttempt.create({
    data: {
      questionId,
      selectedOption,
      correct,
      mode: "TRAIN",
    },
  });

  redirect(`/train?result=${correct ? "correct" : "wrong"}&correct=${question.correctOption}&answer=${selectedOption}`);
}
