import QuestionForm from "@/components/QuestionForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditQuestion({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) notFound();

  const question = await prisma.question.findUnique({ where: { id } });
  if (!question) notFound();

  return (
    <div className="space-y-4">
      <div className="card">
        <p className="text-sm text-slate-500">Editar questao</p>
        <h2 className="text-xl font-semibold">Questao #{question.id}</h2>
      </div>
      <QuestionForm action={`/api/questions/${question.id}`} submitLabel="Salvar alteracoes" initialValues={question} />
    </div>
  );
}
