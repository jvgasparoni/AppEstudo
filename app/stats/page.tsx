import { prisma } from "@/lib/prisma";
export default async function Stats(){const attempts=await prisma.questionAttempt.findMany({include:{question:true}}); return <div className='card'><p>Total tentativas: {attempts.length}</p></div>}
