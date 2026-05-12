import { CLAVIS_ORIGIN, normalizeClavisLesson } from "@/lib/clavis";
import { prisma } from "@/lib/prisma";
import { isQuestionOption } from "@/lib/questions";
import { isCorrect } from "@/lib/srs";
import { redirect } from "next/navigation";

export async function POST(req: Request) {
  const f = await req.formData();
  const questionId = Number(f.get("questionId"));
  const selectedOption = String(f.get("selectedOption") || "").trim().toUpperCase();
  const domain = String(f.get("domain") || "all").trim() || "all";
  const topic = String(f.get("topic") || "all").trim() || "all";
  const mode = String(f.get("mode") || "general").trim();
  const isClavisMode = mode === "clavis";
  const lessonNumber = normalizeClavisLesson(f.get("lesson"));

  if (!Number.isInteger(questionId) || !isQuestionOption(selectedOption)) {
    return Response.json({ message: "Resposta invalida" }, { status: 400 });
  }
  if (isClavisMode && !lessonNumber) {
    return Response.json({ message: "Aula Clavis invalida" }, { status: 400 });
  }

  const question = await prisma.question.findUnique({ where: { id: questionId } });
  if (!question) return new Response("Not found", { status: 404 });
  if (isClavisMode && (question.origin !== CLAVIS_ORIGIN || question.lessonNumber !== lessonNumber)) {
    return Response.json({ message: "Questao nao pertence a aula Clavis selecionada" }, { status: 400 });
  }
  if (!isClavisMode && question.origin === CLAVIS_ORIGIN) {
    return Response.json({ message: "Use o modo Praticar Clavis para responder esta questao" }, { status: 400 });
  }

  const correct = isCorrect(selectedOption, question.correctOption);
  await prisma.questionAttempt.create({
    data: {
      questionId,
      selectedOption,
      correct,
      mode: "TRAIN",
    },
  });

  const params = new URLSearchParams({
    domain,
    result: correct ? "correct" : "wrong",
    correct: question.correctOption,
    answer: selectedOption,
    reviewQuestionId: String(question.id),
  });
  if (topic !== "all") params.set("topic", topic);

  if (isClavisMode && lessonNumber) {
    params.set("mode", "clavis");
    params.set("lesson", String(lessonNumber));
    params.delete("domain");
    params.delete("topic");
  }

  redirect(`/train?${params.toString()}`);
}
