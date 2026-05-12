import { comptiaSecurityPlusExamDomains, getDomainIdFromValue, getDomainLabelFromValue, getExamBlueprintCounts, getQuestionDomainInfo } from "./domains";

export type ExamQuestionSource = {
  id: number;
  subject?: string | null;
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
    const domain = getQuestionDomainInfo(question);
    byDomain.set(domain.id, [...(byDomain.get(domain.id) || []), question]);
  }
  return byDomain;
}

export function buildExamBlueprintPlan(questions: ExamQuestionSource[], amountValue: unknown, shuffleFn: ShuffleFn = shuffle): ExamPlanResult {
  const amount = validAmount(amountValue);
  if (!amount) return { ok: false, message: "Informe uma quantidade valida de questoes." };
  const byDomain = groupByDomain(questions);
  const availableInBlueprintDomains = comptiaSecurityPlusExamDomains.reduce((sum, domain) => sum + (byDomain.get(domain.id)?.length || 0), 0);
  if (availableInBlueprintDomains < amount) {
    return { ok: false, message: `Existem apenas ${availableInBlueprintDomains} questao(oes) dos dominios principais para ${amount} solicitada(s).` };
  }

  const selectedIds: number[] = [];

  for (const domain of getExamBlueprintCounts(amount)) {
    if (domain.amount === 0) continue;

    const available = byDomain.get(domain.id) || [];
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
  requestedDomains: Array<{ domain?: string; domainId?: string; theme?: string; amount: unknown }> | undefined = [],
  shuffleFn: ShuffleFn = shuffle,
): ExamPlanResult {
  const requested = requestedDomains
    .map((domain) => {
      const rawDomain = String(domain.domainId || domain.domain || domain.theme || "").trim();
      const domainId = rawDomain ? getDomainIdFromValue(rawDomain) : "";
      const label = getDomainLabelFromValue(rawDomain);
      return { domainId, label, amount: validAmount(domain.amount) };
    })
    .filter((domain) => /^domain-[1-5]$/.test(domain.domainId) && domain.amount > 0);

  if (!requested.length) return { ok: false, message: "Informe ao menos um dominio com quantidade maior que zero." };

  const byDomain = groupByDomain(questions);
  const selectedIds: number[] = [];

  for (const domain of requested) {
    const available = byDomain.get(domain.domainId) || [];
    if (available.length < domain.amount) {
      return {
        ok: false,
        message: `${domain.label}: existem ${available.length} questao(oes), mas voce solicitou ${domain.amount}.`,
      };
    }
    selectedIds.push(...shuffleFn(available).slice(0, domain.amount).map((question) => question.id));
  }

  return { ok: true, selectedIds: shuffleFn(selectedIds), title: `Simulado personalizado - ${selectedIds.length} questao(oes)` };
}
