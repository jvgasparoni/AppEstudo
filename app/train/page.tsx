import { prisma } from "@/lib/prisma";
export default async function Train(){const q=await prisma.question.findFirst({orderBy:{id:'desc'}}); if(!q) return <p>Sem questões</p>;
return <form action='/api/train-attempts' method='post' className='card'><input type='hidden' name='questionId' value={q.id}/><p className='font-semibold mb-2'>{q.statement}</p>{['A','B','C','D','E'].map(l=><label key={l} className='block'><input type='radio' name='selectedOption' value={l} required/> {l}</label>)}<button className='btn-primary mt-2'>Responder</button></form>}
