import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

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

export async function POST(req: Request) {
  const f = await req.formData();
  const data = getData(f);
  const error = validateQuestion(data);
  if (error) return Response.json({ message: error }, { status: 400 });

  await prisma.question.create({ data });
  redirect("/questions");
}
