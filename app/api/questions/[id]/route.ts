import { prisma } from "@/lib/prisma";

const validOptions = ["A", "B", "C", "D", "E"];
const validDifficulties = ["EASY", "MEDIUM", "HARD"] as const;

function text(f: FormData, key: string) {
  return String(f.get(key) || "").trim();
}

function getData(f: FormData) {
  const correctOption = text(f, "correctOption").toUpperCase();
  const difficulty = text(f, "difficulty") || "MEDIUM";

  return {
    statement: text(f, "statement"),
    optionA: text(f, "optionA"),
    optionB: text(f, "optionB"),
    optionC: text(f, "optionC"),
    optionD: text(f, "optionD"),
    optionE: text(f, "optionE"),
    correctOption,
    explanation: text(f, "explanation"),
    subject: text(f, "subject"),
    theme: text(f, "theme"),
    subtheme: text(f, "subtheme") || null,
    difficulty: (validDifficulties.includes(difficulty as (typeof validDifficulties)[number]) ? difficulty : "MEDIUM") as
      | "EASY"
      | "MEDIUM"
      | "HARD",
    tags: text(f, "tags"),
    source: text(f, "source") || null,
  };
}

function validateQuestion(data: ReturnType<typeof getData>) {
  const required = ["statement", "optionA", "optionB", "optionC", "optionD", "optionE", "correctOption", "explanation", "subject", "theme"] as const;
  const missing = required.filter((field) => !data[field]);
  if (missing.length) return `Campos obrigatorios ausentes: ${missing.join(", ")}`;
  if (!validOptions.includes(data.correctOption)) return "Resposta correta deve ser A, B, C, D ou E";
  return null;
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const f = await req.formData();
  const id = Number(params.id);
  if (!Number.isInteger(id)) return Response.json({ message: "ID invalido" }, { status: 400 });

  const data = getData(f);
  const error = validateQuestion(data);
  if (error) return Response.json({ message: error }, { status: 400 });

  const updated = await prisma.question.update({ where: { id }, data });
  return Response.json(updated);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const confirmation = new URL(req.url).searchParams.get("confirm");
  if (!Number.isInteger(id)) return Response.json({ message: "ID invalido" }, { status: 400 });
  if (confirmation !== "true") return Response.json({ message: "confirmacao obrigatoria: ?confirm=true" }, { status: 400 });

  await prisma.$transaction([
    prisma.questionAttempt.deleteMany({ where: { questionId: id } }),
    prisma.examQuestion.deleteMany({ where: { questionId: id } }),
    prisma.question.delete({ where: { id } }),
  ]);

  return Response.json({ ok: true });
}
