import { prisma } from "@/lib/prisma";
import { readQuestionFormData, validateQuestionInput } from "@/lib/questions";
import { redirect } from "next/navigation";

export async function POST(req: Request) {
  const f = await req.formData();
  const data = readQuestionFormData(f);
  const error = validateQuestionInput(data);
  if (error) return Response.json({ message: error }, { status: 400 });

  await prisma.question.create({ data });
  redirect("/questions");
}
