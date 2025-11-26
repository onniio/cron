import cronstrue from 'cronstrue';
import { CronExpressionParser } from 'cron-parser';

export type CronDialect = 'crontab5' | 'crontab6';

/**
 * Normalize whitespace and optionally auto-pad to 5 fields.
 * MVP supports classic 5-field crontab.
 */
export function normalizeExpr(expr: string): string {
  return expr.trim().replace(/\s+/g, ' ');
}

export function toHuman(expr: string): string {
  // cronstrue throws on parse errors; catch outside if needed.
  return cronstrue.toString(expr);
}

export function getNextRuns(expr: string, tz: string, count: number, dialect: CronDialect = 'crontab5'): Date[] {
  const clean = normalizeExpr(expr);
  const fields = clean.split(' ').filter(Boolean);

  if (dialect === 'crontab5' && fields.length !== 5) {
    throw new Error(`Expected 5 fields (minute hour day-of-month month day-of-week) but got ${fields.length}.`);
  }
  if (dialect === 'crontab6' && fields.length !== 6) {
    throw new Error(`Expected 6 fields (second minute hour day-of-month month day-of-week) but got ${fields.length}.`);
  }

  const interval = CronExpressionParser.parse(clean, { tz, strict: true });
  const safeCount = Math.max(1, Math.min(count, 50));
  return interval.take(safeCount).map((d) => d.toDate());
}

/**
 * Helpful warning: classic cron has OR semantics between DOM and DOW
 * when both are restricted (not '*'). This surprises many users.
 */
export function domDowOrWarning(expr: string): string | null {
  const fields = normalizeExpr(expr).split(' ').filter(Boolean);
  if (fields.length < 5) return null;
  const dom = fields[2];
  const dow = fields[4];
  const isDomRestricted = dom !== '*';
  const isDowRestricted = dow !== '*';
  if (isDomRestricted && isDowRestricted) {
    return 'Note: In classic crontab, day-of-month and day-of-week are ORed (either match can trigger).';
  }
  return null;
}
