import { prisma } from "@/lib/prisma";

type QuestionItem = { id: number; statement: string; subject: string; theme: string; difficulty: string; tags: string };

export default async function Questions({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q || "";
  const data = (await prisma.question.findMany({ where: q ? { OR: [{ statement: { contains: q } }, { tags: { contains: q } }] } : undefined, take: 100 })) as QuestionItem[];

  return <div><form><input name='q' placeholder='buscar' defaultValue={q} className='input mb-3'/></form><div className='space-y-2'>{data.map((i: QuestionItem) => <div key={i.id} className='card'><p className='font-semibold'>{i.statement}</p><p>{i.subject} / {i.theme} / {i.difficulty}</p></div>)}</div></div>;
}
