import cronstrue from 'cronstrue';
import { CronExpressionParser } from 'cron-parser';

export type CronDialect = 'crontab5' | 'crontab6';

export function normalizeExpr(expr: string): string {
  return expr.trim().replace(/\s+/g, ' ');
}

export function toHuman(expr: string, locale?: string): string {
  try {
    if (locale) return (cronstrue as any).toString(expr, { locale });
  } catch {}
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

  return interval.take(safeCount).map((d: any) => d.toDate());
}

export function shouldWarnDomDowOr(expr: string): boolean {
  const fields = normalizeExpr(expr).split(' ').filter(Boolean);
  if (fields.length < 5) return false;
  const dom = fields[2];
  const dow = fields[4];
  return dom !== '*' && dow !== '*';
}
