import { getExamBlueprintCounts, getQuestionDomain } from "./domains";

export type ExamQuestionSource = {
  id: number;
  theme?: string | null;
  tags?: string | null;
};

export type ExamPlanResult =
  | { ok: true; selectedIds: number[]; title: string }
  | { ok: false; message: string };

type ShuffleFn = <T>(items: T[]) => T[];

export function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function validAmount(value: unknown) {
  const amount = Number(value);
  return Number.isInteger(amount) && amount > 0 ? amount : 0;
}

function groupByDomain(questions: ExamQuestionSource[]) {
  const byDomain = new Map<string, ExamQuestionSource[]>();
  for (const question of questions) {
    const domain = getQuestionDomain(question);
    byDomain.set(domain, [...(byDomain.get(domain) || []), question]);
  }
  return byDomain;
}

export function buildExamBlueprintPlan(questions: ExamQuestionSource[], amountValue: unknown, shuffleFn: ShuffleFn = shuffle): ExamPlanResult {
  const amount = validAmount(amountValue);
  if (!amount) return { ok: false, message: "Informe uma quantidade valida de questoes." };
  if (questions.length < amount) {
    return { ok: false, message: `Existem apenas ${questions.length} questao(oes) disponivel(is) para ${amount} solicitada(s).` };
  }

  const byDomain = groupByDomain(questions);
  const selectedIds: number[] = [];

  for (const domain of getExamBlueprintCounts(amount)) {
    if (domain.amount === 0) continue;

    const available = byDomain.get(domain.domain) || [];
    if (available.length < domain.amount) {
      return {
        ok: false,
        message: `${domain.domain}: a prova precisa de ${domain.amount} questao(oes), mas existem ${available.length} disponivel(is).`,
      };
    }
    selectedIds.push(...shuffleFn(available).slice(0, domain.amount).map((question) => question.id));
  }

  return { ok: true, selectedIds: shuffleFn(selectedIds), title: `Simulado prova Security+ - ${amount} questao(oes)` };
}

export function buildCustomDomainPlan(
  questions: ExamQuestionSource[],
  requestedDomains: Array<{ theme: string; amount: unknown }>,
  shuffleFn: ShuffleFn = shuffle,
): ExamPlanResult {
  const requested = requestedDomains
    .map((domain) => ({ theme: String(domain.theme || "").trim(), amount: validAmount(domain.amount) }))
    .filter((domain) => domain.theme && domain.amount > 0);

  if (!requested.length) return { ok: false, message: "Informe ao menos um dominio com quantidade maior que zero." };

  const byDomain = groupByDomain(questions);
  const selectedIds: number[] = [];

  for (const domain of requested) {
    const available = byDomain.get(domain.theme) || [];
    if (available.length < domain.amount) {
      return {
        ok: false,
        message: `${domain.theme}: existem ${available.length} questao(oes), mas voce solicitou ${domain.amount}.`,
      };
    }
    selectedIds.push(...shuffleFn(available).slice(0, domain.amount).map((question) => question.id));
  }

  return { ok: true, selectedIds: shuffleFn(selectedIds), title: `Simulado personalizado - ${selectedIds.length} questao(oes)` };
}
