import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const confirmation = new URL(req.url).searchParams.get("confirm");

  if (!Number.isInteger(id)) return Response.json({ message: "ID invalido" }, { status: 400 });
  if (confirmation !== "true") return Response.json({ message: "confirmacao obrigatoria: ?confirm=true" }, { status: 400 });

  const deleted = await prisma.$transaction(async (tx) => {
    await tx.questionAttempt.deleteMany({ where: { examId: id } });
    await tx.examQuestion.deleteMany({ where: { examId: id } });
    const result = await tx.exam.deleteMany({ where: { id } });
    return result.count;
  });

  if (!deleted) return Response.json({ message: "Simulado nao encontrado" }, { status: 404 });

  return Response.json({ ok: true });
}
