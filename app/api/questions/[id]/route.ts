import { prisma } from "@/lib/prisma";
import { readQuestionFormData, validateQuestionInput } from "@/lib/questions";
import { redirect } from "next/navigation";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const f = await req.formData();
  const id = Number(params.id);
  if (!Number.isInteger(id)) return Response.json({ message: "ID invalido" }, { status: 400 });

  const data = readQuestionFormData(f);
  const error = validateQuestionInput(data);
  if (error) return Response.json({ message: error }, { status: 400 });

  const updated = await prisma.question.update({ where: { id }, data });
  return Response.json(updated);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const f = await req.formData();
  const id = Number(params.id);
  if (!Number.isInteger(id)) return Response.json({ message: "ID invalido" }, { status: 400 });

  const data = readQuestionFormData(f);
  const error = validateQuestionInput(data);
  if (error) return Response.json({ message: error }, { status: 400 });

  await prisma.question.update({ where: { id }, data });
  redirect("/questions");
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const confirmation = new URL(req.url).searchParams.get("confirm");
  if (!Number.isInteger(id)) return Response.json({ message: "ID invalido" }, { status: 400 });
  if (confirmation !== "true") return Response.json({ message: "confirmacao obrigatoria: ?confirm=true" }, { status: 400 });

  const deleted = await prisma.$transaction(async (tx) => {
    await tx.questionAttempt.deleteMany({ where: { questionId: id } });
    await tx.examQuestion.deleteMany({ where: { questionId: id } });
    const result = await tx.question.deleteMany({ where: { id } });
    return result.count;
  });

  if (!deleted) return Response.json({ message: "Questao nao encontrada" }, { status: 404 });

  return Response.json({ ok: true });
}
