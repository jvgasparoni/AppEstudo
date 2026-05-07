import { parseFreeTextQuestions } from "@/lib/import-parser";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  const body = await req.json();
  const mode = body.mode as "preview" | "save";
  const payload = String(body.payload || "");

  const parsed = parseFreeTextQuestions(payload);
  const hasErrors = parsed.some((p) => p.errors.length > 0);

  if (mode === "preview") return Response.json({ total: parsed.length, hasErrors, items: parsed });
  if (hasErrors) return Response.json({ message: "Existem questoes com erro", items: parsed }, { status: 400 });

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.question.createMany({
      data: parsed.map((p) => ({
        statement: p.parsed!.statement,
        optionA: p.parsed!.optionA,
        optionB: p.parsed!.optionB,
        optionC: p.parsed!.optionC,
        optionD: p.parsed!.optionD,
        optionE: p.parsed!.optionE,
        correctOption: p.parsed!.correctOption,
        explanation: p.parsed!.explanation,
        subject: p.parsed!.subject,
        theme: p.parsed!.theme,
        difficulty: p.parsed!.difficulty,
        tags: p.parsed!.tags,
        source: p.parsed!.source,
        subtheme: p.parsed!.subtheme,
        reviewed: false,
      })),
    });
  });

  return Response.json({ ok: true, imported: parsed.length });
}
