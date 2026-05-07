import { prisma } from "@/lib/prisma";import { redirect } from "next/navigation";
export async function POST(req:Request){const f=await req.formData(); await prisma.flashcard.create({data:{front:String(f.get('front')||''),back:String(f.get('back')||''),subject:String(f.get('subject')||''),theme:String(f.get('theme')||''),tags:String(f.get('tags')||'')}}); redirect('/flashcards')}
