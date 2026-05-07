import { prisma } from "./prisma";
import { summarizeAttempts, summarizeByDomainSubtheme } from "./stats-core";

export { summarizeAttempts };

export const dashboardPeriods = ["7", "15", "30", "all"] as const;
export type DashboardPeriod = (typeof dashboardPeriods)[number];
export const dashboardSources = ["all", "exam", "train"] as const;
export type DashboardSource = (typeof dashboardSources)[number];

const DASHBOARD_RESET_ID = "default";
const EPOCH = new Date("1970-01-01T00:00:00.000Z");

type ResetKind = "answered" | "accuracy" | "allTimeAccuracy";

type ResetRow = {
  answeredResetAt: string | Date;
  accuracyResetAt: string | Date;
  allTimeAccuracyResetAt?: string | Date;
};

function asDate(value: string | Date | null | undefined) {
  if (!value) return EPOCH;
  return value instanceof Date ? value : new Date(value);
}

export function normalizeDashboardPeriod(value: string | undefined): DashboardPeriod {
  return dashboardPeriods.includes(value as DashboardPeriod) ? (value as DashboardPeriod) : "all";
}

export function normalizeDashboardSource(value: string | undefined): DashboardSource {
  return dashboardSources.includes(value as DashboardSource) ? (value as DashboardSource) : "all";
}

function periodStart(period: DashboardPeriod) {
  if (period === "all") return null;
  const start = new Date();
  start.setDate(start.getDate() - Number(period));
  return start;
}

async function ensureDashboardReset() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "DashboardCounterReset" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "answeredResetAt" DATETIME NOT NULL DEFAULT '1970-01-01T00:00:00.000Z',
      "accuracyResetAt" DATETIME NOT NULL DEFAULT '1970-01-01T00:00:00.000Z',
      "allTimeAccuracyResetAt" DATETIME NOT NULL DEFAULT '1970-01-01T00:00:00.000Z',
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "DashboardCounterReset"
      ADD COLUMN "allTimeAccuracyResetAt" DATETIME NOT NULL DEFAULT '1970-01-01T00:00:00.000Z'
    `);
  } catch {
    // Existing local databases already have this column after the migration.
  }

  await prisma.$executeRawUnsafe(`
    INSERT OR IGNORE INTO "DashboardCounterReset" ("id", "answeredResetAt", "accuracyResetAt", "allTimeAccuracyResetAt", "updatedAt")
    VALUES ('${DASHBOARD_RESET_ID}', '1970-01-01T00:00:00.000Z', '1970-01-01T00:00:00.000Z', '1970-01-01T00:00:00.000Z', CURRENT_TIMESTAMP)
  `);
}

async function getDashboardReset() {
  await ensureDashboardReset();
  const rows = await prisma.$queryRawUnsafe<ResetRow[]>(`
    SELECT "answeredResetAt", "accuracyResetAt", "allTimeAccuracyResetAt"
    FROM "DashboardCounterReset"
    WHERE "id" = '${DASHBOARD_RESET_ID}'
    LIMIT 1
  `);

  return {
    answeredResetAt: asDate(rows[0]?.answeredResetAt),
    accuracyResetAt: asDate(rows[0]?.accuracyResetAt),
    allTimeAccuracyResetAt: asDate(rows[0]?.allTimeAccuracyResetAt),
  };
}

export async function resetDashboardCounter(kind: ResetKind) {
  await ensureDashboardReset();
  const field =
    kind === "answered" ? "answeredResetAt" : kind === "accuracy" ? "accuracyResetAt" : "allTimeAccuracyResetAt";

  await prisma.$executeRawUnsafe(`
    UPDATE "DashboardCounterReset"
    SET "${field}" = '${new Date().toISOString()}', "updatedAt" = CURRENT_TIMESTAMP
    WHERE "id" = '${DASHBOARD_RESET_ID}'
  `);
}

function sourceMode(source: DashboardSource) {
  if (source === "exam") return "EXAM";
  if (source === "train") return "TRAIN";
  return null;
}

export async function getDashboard(period: DashboardPeriod = "all", source: DashboardSource = "all") {
  const resets = await getDashboardReset();
  const start = periodStart(period);
  const mode = sourceMode(source);
  const periodWhere = {
    ...(start ? { createdAt: { gte: start } } : {}),
    ...(mode ? { mode } : {}),
  };
  const hasPeriodWhere = Boolean(start || mode);

  const [q, f, allAttempts, answeredSinceReset, accuracySinceReset, allTimeAccuracySinceReset, periodAttempts] = await Promise.all([
    prisma.question.count(),
    prisma.flashcard.count(),
    prisma.questionAttempt.findMany({ include: { question: true } }),
    prisma.questionAttempt.count({ where: { createdAt: { gte: resets.answeredResetAt } } }),
    prisma.questionAttempt.findMany({ where: { createdAt: { gte: resets.accuracyResetAt } }, include: { question: true } }),
    prisma.questionAttempt.findMany({ where: { createdAt: { gte: resets.allTimeAccuracyResetAt } }, include: { question: true } }),
    prisma.questionAttempt.findMany({ where: hasPeriodWhere ? periodWhere : undefined, include: { question: true } }),
  ]);

  const allTime = summarizeAttempts(allAttempts);
  const resettableAccuracy = summarizeAttempts(accuracySinceReset);
  const allTimeAccuracy = summarizeAttempts(allTimeAccuracySinceReset);
  const periodSummary = summarizeAttempts(periodAttempts);

  return {
    q,
    f,
    attempts: allTime.total,
    ...allTime,
    allTime,
    allTimeAccuracy,
    selectedPeriod: period,
    selectedSource: source,
    period: {
      ...periodSummary,
      domainSubthemes: summarizeByDomainSubtheme(periodAttempts),
    },
    resettable: {
      answered: answeredSinceReset,
      accuracyCorrect: resettableAccuracy.correct,
      accuracyTotal: resettableAccuracy.total,
      accuracyRate: resettableAccuracy.rate,
      answeredResetAt: resets.answeredResetAt,
      accuracyResetAt: resets.accuracyResetAt,
      allTimeAccuracyResetAt: resets.allTimeAccuracyResetAt,
    },
  };
}
