import { buildCustomDomainPlan, buildExamBlueprintPlan } from "@/lib/exam-planner";
import { prisma } from "@/lib/prisma";

type CreateExamBody =
  | { mode: "examBlueprint"; amount: number }
  | { mode: "custom"; domains: Array<{ theme: string; amount: number }> };

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as CreateExamBody | null;
  if (!body) return Response.json({ message: "Dados invalidos" }, { status: 400 });

  const questions = await prisma.question.findMany({ select: { id: true, theme: true, tags: true } });
  const plan =
    body.mode === "examBlueprint"
      ? buildExamBlueprintPlan(questions, body.amount)
      : body.mode === "custom"
        ? buildCustomDomainPlan(questions, body.domains)
        : { ok: false as const, message: "Modo de simulado invalido." };

  if (!plan.ok) return Response.json({ message: plan.message }, { status: 400 });

  const exam = await prisma.exam.create({
    data: {
      title: plan.title,
      randomOrder: true,
      examQuestions: {
        create: plan.selectedIds.map((questionId, index) => ({ questionId, position: index + 1 })),
      },
    },
  });

  return Response.json({ ok: true, examId: exam.id });
}
