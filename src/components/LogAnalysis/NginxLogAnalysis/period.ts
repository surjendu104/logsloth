import type { NginxAccessLog } from './parser';

export type Period = '1h' | '24h' | '7d' | '30d' | '6m' | 'all';

export type PeriodMode = 'datasetRelative' | 'currentTimeRelative';

export type LogDateRange = {
  start: number;
  end: number;
};

export const getPeriodStart = (period: Period, endDate: Date) => {
  const date = new Date(endDate);
  switch (period) {
    case '1h':
      date.setHours(date.getHours() - 1);
      return date;
    case '24h':
      date.setHours(date.getHours() - 24);
      return date;
    case '7d':
      date.setDate(date.getDate() - 7);
      return date;
    case '30d':
      date.setDate(date.getDate() - 30);
      return date;
    case '6m':
      date.setMonth(date.getMonth() - 6);
      return date;
    default:
      return null;
  }
};

export const getLogDateRange = (
  data: NginxAccessLog[],
): LogDateRange | null => {
  if (!data || data.length === 0) {
    return null;
  }
  const range = { start: Infinity, end: -Infinity };

  for (const row of data) {
    if (!row.time) {
      continue;
    }
    const time = row.time.getTime();
    if (time < range.start) {
      range.start = time;
    }
    if (time > range.end) {
      range.end = time;
    }
  }

  return range;
};
