import { resetDashboardCounter } from "@/lib/stats";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { kind?: string };

  if (body.kind !== "current" && body.kind !== "allTimeAccuracy" && body.kind !== "trainAnswered") {
    return Response.json({ message: "Tipo de reset invalido" }, { status: 400 });
  }

  await resetDashboardCounter(body.kind);
  return Response.json({ ok: true });
}
