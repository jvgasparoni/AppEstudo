import { prisma } from "@/lib/prisma";

function getData(f: FormData) {
  return {
    statement: String(f.get("statement") || ""), optionA: String(f.get("optionA") || ""), optionB: String(f.get("optionB") || ""), optionC: String(f.get("optionC") || ""), optionD: String(f.get("optionD") || ""), optionE: String(f.get("optionE") || ""),
    correctOption: String(f.get("correctOption") || ""), explanation: String(f.get("explanation") || ""), subject: String(f.get("subject") || ""), theme: String(f.get("theme") || ""),
    subtheme: String(f.get("subtheme") || "") || null, difficulty: String(f.get("difficulty") || "MEDIUM") as "EASY" | "MEDIUM" | "HARD", tags: String(f.get("tags") || ""), source: String(f.get("source") || "") || null,
  };
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const f = await req.formData();
  const id = Number(params.id);
  const updated = await prisma.question.update({ where: { id }, data: getData(f) });
  return Response.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const confirmation = new URL(_req.url).searchParams.get("confirm");
  if (confirmation !== "true") return Response.json({ message: "confirmação obrigatória: ?confirm=true" }, { status: 400 });
  await prisma.question.delete({ where: { id } });
  return Response.json({ ok: true });
}
