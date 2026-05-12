import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { calculateStatsByDomain, calculateStatsByTopic, summarizeAttempts, summarizeByDomainTopic } from "./stats-core";

export { summarizeAttempts };

export const dashboardPeriods = ["7", "15", "30", "all"] as const;
export type DashboardPeriod = (typeof dashboardPeriods)[number];
export const dashboardSources = ["all", "exam", "train"] as const;
export type DashboardSource = (typeof dashboardSources)[number];

const DASHBOARD_RESET_ID = "default";
const EPOCH = new Date("1970-01-01T00:00:00.000Z");

type ResetKind = "current" | "allTimeAccuracy" | "trainAnswered";

type ResetRow = {
  answeredResetAt: string | Date;
  accuracyResetAt: string | Date;
  allTimeAccuracyResetAt?: string | Date;
  trainAnsweredResetAt?: string | Date;
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

function periodStart(period: DashboardPeriod, now = new Date()) {
  if (period === "all") return null;
  const start = new Date(now);
  start.setDate(start.getDate() - Number(period));
  return start;
}

function laterDate(a: Date | null, b: Date | null) {
  if (!a) return b;
  if (!b) return a;
  return a > b ? a : b;
}

export function getDashboardAnalysisWhere(
  period: DashboardPeriod,
  source: DashboardSource,
  trainAnsweredResetAt: Date,
  now = new Date(),
): Prisma.QuestionAttemptWhereInput {
  const start = periodStart(period, now);

  if (source === "exam") {
    return {
      mode: "EXAM",
      ...(start ? { createdAt: { gte: start } } : {}),
    };
  }

  if (source === "train") {
    const trainStart = laterDate(start, trainAnsweredResetAt);
    return {
      mode: "TRAIN",
      ...(trainStart ? { createdAt: { gte: trainStart } } : {}),
    };
  }

  const trainStart = laterDate(start, trainAnsweredResetAt);
  return {
    OR: [
      {
        mode: "TRAIN",
        ...(trainStart ? { createdAt: { gte: trainStart } } : {}),
      },
      {
        NOT: { mode: "TRAIN" },
        ...(start ? { createdAt: { gte: start } } : {}),
      },
    ],
  };
}

async function ensureDashboardReset() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "DashboardCounterReset" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "answeredResetAt" DATETIME NOT NULL DEFAULT '1970-01-01T00:00:00.000Z',
      "accuracyResetAt" DATETIME NOT NULL DEFAULT '1970-01-01T00:00:00.000Z',
      "allTimeAccuracyResetAt" DATETIME NOT NULL DEFAULT '1970-01-01T00:00:00.000Z',
      "trainAnsweredResetAt" DATETIME NOT NULL DEFAULT '1970-01-01T00:00:00.000Z',
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  for (const column of ["allTimeAccuracyResetAt", "trainAnsweredResetAt"]) {
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "DashboardCounterReset"
        ADD COLUMN "${column}" DATETIME NOT NULL DEFAULT '1970-01-01T00:00:00.000Z'
      `);
    } catch {
      // Existing local databases already have these columns after migrations.
    }
  }

  await prisma.$executeRawUnsafe(`
    INSERT OR IGNORE INTO "DashboardCounterReset" ("id", "answeredResetAt", "accuracyResetAt", "allTimeAccuracyResetAt", "trainAnsweredResetAt", "updatedAt")
    VALUES ('${DASHBOARD_RESET_ID}', '1970-01-01T00:00:00.000Z', '1970-01-01T00:00:00.000Z', '1970-01-01T00:00:00.000Z', '1970-01-01T00:00:00.000Z', CURRENT_TIMESTAMP)
  `);
}

async function getDashboardReset() {
  await ensureDashboardReset();
  const rows = await prisma.$queryRawUnsafe<ResetRow[]>(`
    SELECT "answeredResetAt", "accuracyResetAt", "allTimeAccuracyResetAt", "trainAnsweredResetAt"
    FROM "DashboardCounterReset"
    WHERE "id" = '${DASHBOARD_RESET_ID}'
    LIMIT 1
  `);

  return {
    answeredResetAt: asDate(rows[0]?.answeredResetAt),
    accuracyResetAt: asDate(rows[0]?.accuracyResetAt),
    allTimeAccuracyResetAt: asDate(rows[0]?.allTimeAccuracyResetAt),
    trainAnsweredResetAt: asDate(rows[0]?.trainAnsweredResetAt),
  };
}

export async function resetDashboardCounter(kind: ResetKind) {
  await ensureDashboardReset();
  const now = new Date().toISOString();

  if (kind === "current") {
    await prisma.$executeRawUnsafe(`
      UPDATE "DashboardCounterReset"
      SET "answeredResetAt" = '${now}', "accuracyResetAt" = '${now}', "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = '${DASHBOARD_RESET_ID}'
    `);
    return;
  }

  const field = kind === "trainAnswered" ? "trainAnsweredResetAt" : "allTimeAccuracyResetAt";

  await prisma.$executeRawUnsafe(`
    UPDATE "DashboardCounterReset"
    SET "${field}" = '${now}', "updatedAt" = CURRENT_TIMESTAMP
    WHERE "id" = '${DASHBOARD_RESET_ID}'
  `);
}

export async function getDashboard(period: DashboardPeriod = "all", source: DashboardSource = "all") {
  const resets = await getDashboardReset();
  const periodWhere = getDashboardAnalysisWhere(period, source, resets.trainAnsweredResetAt);

  const [q, f, allAttempts, answeredSinceReset, accuracySinceReset, allTimeAccuracySinceReset, trainAnsweredSinceReset, periodAttempts] = await Promise.all([
    prisma.question.count(),
    prisma.flashcard.count(),
    prisma.questionAttempt.findMany({ include: { question: true } }),
    prisma.questionAttempt.count({ where: { createdAt: { gte: resets.answeredResetAt } } }),
    prisma.questionAttempt.findMany({ where: { createdAt: { gte: resets.accuracyResetAt } }, include: { question: true } }),
    prisma.questionAttempt.findMany({ where: { createdAt: { gte: resets.allTimeAccuracyResetAt } }, include: { question: true } }),
    prisma.questionAttempt.count({ where: { createdAt: { gte: resets.trainAnsweredResetAt }, mode: "TRAIN" } }),
    prisma.questionAttempt.findMany({ where: periodWhere, include: { question: true } }),
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
      domains: calculateStatsByDomain(periodAttempts),
      topics: calculateStatsByTopic(periodAttempts),
      domainTopics: summarizeByDomainTopic(periodAttempts),
    },
    resettable: {
      answered: answeredSinceReset,
      accuracyCorrect: resettableAccuracy.correct,
      accuracyTotal: resettableAccuracy.total,
      accuracyRate: resettableAccuracy.rate,
      trainAnswered: trainAnsweredSinceReset,
      answeredResetAt: resets.answeredResetAt,
      accuracyResetAt: resets.accuracyResetAt,
      allTimeAccuracyResetAt: resets.allTimeAccuracyResetAt,
      trainAnsweredResetAt: resets.trainAnsweredResetAt,
    },
  };
}
