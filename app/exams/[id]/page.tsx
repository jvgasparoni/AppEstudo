import ExamRunner from "@/components/ExamRunner";
import { getQuestionDomain } from "@/lib/domains";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ExamPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) notFound();

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      attempts: true,
      examQuestions: {
        orderBy: { position: "asc" },
        include: { question: true },
      },
    },
  });

  if (!exam) notFound();

  if (exam.attempts.length > 0) {
    return (
      <div className="card space-y-3">
        <p className="font-semibold">Este simulado ja foi finalizado.</p>
        <Link className="btn-primary inline-block" href={`/exams/${exam.id}/review`}>
          Abrir revisao
        </Link>
      </div>
    );
  }

  const questions = exam.examQuestions.map((item) => ({
    ...item.question,
    domain: getQuestionDomain(item.question),
  }));

  return <ExamRunner examId={exam.id} title={exam.title} questions={questions} />;
}
