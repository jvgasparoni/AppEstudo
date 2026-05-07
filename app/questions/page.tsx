import QuestionManager from "@/components/QuestionManager";
import { prisma } from "@/lib/prisma";

export default async function Questions({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q || "").trim();
  const data = await prisma.question.findMany({
    where: q
      ? {
          OR: [
            { statement: { contains: q } },
            { tags: { contains: q } },
            { subject: { contains: q } },
            { theme: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          attempts: true,
          examQuestions: true,
        },
      },
    },
  });

  return <QuestionManager questions={data} query={q} />;
}
