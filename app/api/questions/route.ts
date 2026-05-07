import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

function getData(f: FormData) {
  return {
    statement: String(f.get("statement") || ""),
    optionA: String(f.get("optionA") || ""),
    optionB: String(f.get("optionB") || ""),
    optionC: String(f.get("optionC") || ""),
    optionD: String(f.get("optionD") || ""),
    optionE: String(f.get("optionE") || ""),
    correctOption: String(f.get("correctOption") || ""),
    explanation: String(f.get("explanation") || ""),
    subject: String(f.get("subject") || ""),
    theme: String(f.get("theme") || ""),
    subtheme: String(f.get("subtheme") || "") || null,
    difficulty: String(f.get("difficulty") || "MEDIUM") as "EASY" | "MEDIUM" | "HARD",
    tags: String(f.get("tags") || ""),
    source: String(f.get("source") || "") || null,
  };
}

export async function POST(req: Request) {
  const f = await req.formData();
  await prisma.question.create({ data: getData(f) });
  redirect("/questions");
}
