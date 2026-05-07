import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function POST(req: Request) {
  const f = await req.formData();
  const amount = Number(f.get("amount") || 10);
  const randomOrder = !!f.get("randomOrder");
  const where: Record<string, unknown> = {};

  ["subject", "theme"].forEach((k) => {
    const v = f.get(k);
    if (v) where[k] = String(v);
  });

  const diff = f.get("difficulty");
  if (diff) where.difficulty = String(diff);

  const tags = f.get("tags");
  if (tags) where.tags = { contains: String(tags) };

  const qs = await prisma.question.findMany({
    where,
    take: amount,
    orderBy: randomOrder ? { id: "desc" } : { id: "asc" },
  });

  const exam = await prisma.exam.create({
    data: {
      title: String(f.get("title") || "Simulado"),
      randomOrder,
      examQuestions: {
        create: qs.map((q: { id: number }, i: number) => ({ questionId: q.id, position: i + 1 })),
      },
    },
  });

  redirect(`/exams/result?examId=${exam.id}`);
}
