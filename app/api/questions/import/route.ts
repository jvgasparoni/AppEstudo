import { CLAVIS_ORIGIN, GENERAL_ORIGIN, getClavisLessonFromSubtheme, normalizeClavisLesson } from "@/lib/clavis";
import { parseFreeTextQuestions } from "@/lib/import-parser";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const IMPORT_BATCH_SIZE = 100;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { mode?: string; payload?: string; origin?: string; lessonNumber?: unknown } | null;
  if (!body) return Response.json({ message: "Dados invalidos" }, { status: 400 });

  const mode = body.mode as "preview" | "save";
  const payload = String(body.payload || "");
  const origin = body.origin === CLAVIS_ORIGIN ? CLAVIS_ORIGIN : GENERAL_ORIGIN;
  const fallbackLessonNumber = origin === CLAVIS_ORIGIN ? normalizeClavisLesson(body.lessonNumber) : null;

  const parsed = parseFreeTextQuestions(payload);
  if (origin === CLAVIS_ORIGIN) {
    for (const item of parsed) {
      const lessonNumber = getClavisLessonFromSubtheme(item.parsed?.subtheme) || fallbackLessonNumber;
      if (!lessonNumber) item.errors.push('Aula Clavis ausente no subtema. Use "Subtema: Aula 57".');
    }
  }
  const hasErrors = parsed.some((p) => p.errors.length > 0);

  if (mode === "preview") return Response.json({ total: parsed.length, hasErrors, items: parsed });
  if (mode !== "save") return Response.json({ message: "Modo de importacao invalido" }, { status: 400 });
  if (!parsed.length) return Response.json({ message: "Nenhuma questao identificada para importar." }, { status: 400 });
  if (hasErrors) return Response.json({ message: "Existem questoes com erro", items: parsed }, { status: 400 });

  let imported = 0;
  const data = parsed.map((p) => ({
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
    origin,
    lessonNumber: origin === CLAVIS_ORIGIN ? getClavisLessonFromSubtheme(p.parsed!.subtheme) || fallbackLessonNumber : null,
    reviewed: false,
  }));

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    for (let i = 0; i < data.length; i += IMPORT_BATCH_SIZE) {
      const result = await tx.question.createMany({
        data: data.slice(i, i + IMPORT_BATCH_SIZE),
      });
      imported += result.count;
    }
  });

  return Response.json({ ok: true, imported });
}

export async function DELETE(req: Request) {
  const confirmation = new URL(req.url).searchParams.get("confirm");
  if (confirmation !== "DELETE_ALL") {
    return Response.json({ message: "confirmacao obrigatoria: ?confirm=DELETE_ALL" }, { status: 400 });
  }

  const deleted = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.questionAttempt.deleteMany();
    await tx.examQuestion.deleteMany();
    await tx.exam.deleteMany();
    const questions = await tx.question.deleteMany();
    return questions.count;
  });

  return Response.json({ ok: true, deleted });
}
