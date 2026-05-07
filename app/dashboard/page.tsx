import { getDashboard } from "@/lib/stats";
import { prisma } from "@/lib/prisma";
export default async function Dashboard(){const d=await getDashboard(); const pend=await prisma.flashcard.count({where:{nextReview:{lte:new Date()}}});
return <div className='grid gap-4 md:grid-cols-3'>{[['Questões',d.q],['Flashcards',d.f],['Respondidas',d.attempts],['Acerto geral',`${d.rate}%`],['Pendentes hoje',pend]].map(([k,v])=><div key={k} className='card'><p className='text-sm'>{k}</p><p className='text-2xl font-bold'>{v}</p></div>)}</div>}
