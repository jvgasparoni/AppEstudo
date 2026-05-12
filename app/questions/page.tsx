import QuestionManager from "@/components/QuestionManager";
import { CLAVIS_ORIGIN } from "@/lib/clavis";
import { prisma } from "@/lib/prisma";

export default async function Questions({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q || "").trim();
  const [data, clavisCountsRaw] = await Promise.all([
    prisma.question.findMany({
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
    }),
    prisma.question.groupBy({
      by: ["lessonNumber"],
      where: {
        origin: CLAVIS_ORIGIN,
        lessonNumber: { not: null },
      },
      _count: { _all: true },
    }),
  ]);

  const clavisLessonCounts = clavisCountsRaw.reduce<Record<number, number>>((acc, item) => {
    if (item.lessonNumber) acc[item.lessonNumber] = item._count._all;
    return acc;
  }, {});

  return <QuestionManager questions={data} query={q} clavisLessonCounts={clavisLessonCounts} />;
}
