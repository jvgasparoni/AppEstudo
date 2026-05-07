import { prisma } from "@/lib/prisma";import { redirect } from "next/navigation";
export async function POST(req:Request){const f=await req.formData(); const questionId=Number(f.get('questionId')); const sel=String(f.get('selectedOption')); const q=await prisma.question.findUnique({where:{id:questionId}}); if(!q) return new Response('Not found',{status:404});
await prisma.questionAttempt.create({data:{questionId,selectedOption:sel,correct:q.correctOption===sel,mode:'TRAIN'}}); redirect('/stats')}
