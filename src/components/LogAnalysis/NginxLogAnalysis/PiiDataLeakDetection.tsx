import React, { useMemo } from 'react';
import type { NginxAccessLog } from './parser';
import classes from './PiiDataLeakDetection.module.css';
import { TableVirtuoso } from 'react-virtuoso';

export type PiiType = 'EMAIL' | 'PHONE' | 'SSN';

export type PiiLeak = {
  log: NginxAccessLog;
  piiType: PiiType;
  value: string;
};

type PiiLeakStat = {
  date: string;
  piiType: PiiType;
  uniqueCount: number;
};

export type PiiLeakingEndpoint = {
  endpoint: string;
  piiType: PiiType;
  leakCount: number;
};

// Define regex patterns
const PII_PATTERNS: Record<PiiType, RegExp> = {
  EMAIL: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  PHONE: /\+?\d[\d\s-]{7,}\d/,
  // CREDIT_CARD: /\b(?:\d[ -]*?){13,16}\b/,
  SSN: /\b\d{3}-\d{2}-\d{4}\b/,
};

// function to check pii data leaked in request or not
const detectPii = (log: NginxAccessLog): PiiLeak[] => {
  const leaks: PiiLeak[] = [];
  const fieldsToCheck = [
    // log.url,
    // log.referer,
    // log.userAgent,
    log.requestRaw,
  ].filter(Boolean) as string[];

  for (const field of fieldsToCheck) {
    for (const [piiType, regex] of Object.entries(PII_PATTERNS) as [
      PiiType,
      RegExp,
    ][]) {
      const match = field.match(regex);
      if (match) {
        leaks.push({ log, piiType, value: match[0] });
      }
    }
  }

  return leaks;
};

/**
 * Gives PII leaks by time.
 * @param leaks Array of detected PII leaks
 * @returns Array of JSON objects contains time with PII type and count
 */
const getPiiLeaksStatsByTime = (leaks: PiiLeak[]): PiiLeakStat[] => {
  const summaryMap = new Map<string, Set<string>>(); // key: date+type, value: set of unique values

  leaks.forEach(({ log, piiType, value }) => {
    const date = log.time?.toLocaleString() || 'unknown';
    const key = `${date}#${piiType}`;

    if (!summaryMap.has(key)) summaryMap.set(key, new Set());
    summaryMap.get(key)!.add(value); // store unique PII
  });

  const result: PiiLeakStat[] = [];
  summaryMap.forEach((set, key) => {
    const [date, piiType] = key.split('#');
    result.push({ date, piiType: piiType as PiiType, uniqueCount: set.size });
  });

  return result;
}

/**
 * Gives PII leaks by endpoint.
 * @param leaks Array of detected PII leaks
 * @returns Array of endpoints with PII type and count
 */
const getPiiLeakingEndpoints = (leaks: PiiLeak[]): PiiLeakingEndpoint[] => {
  const summaryMap = new Map<string, number>(); // key = endpoint#piiType, value = count

  leaks.forEach(({ log, piiType }) => {
    const endpoint = log.url || 'unknown';
    const key = `${endpoint}#${piiType}`;
    summaryMap.set(key, (summaryMap.get(key) || 0) + 1);
  });

  const result: PiiLeakingEndpoint[] = [];
  summaryMap.forEach((count, key) => {
    const [endpoint, piiType] = key.split('#');
    result.push({
      endpoint,
      piiType: piiType as PiiType,
      leakCount: count,
    });
  });

  return result;
}

const PiiDataLeakDetection = ({
  logs,
}: {
  logs: NginxAccessLog[];
}): React.JSX.Element => {
  const leakSummryOverTime = useMemo(() => {
    let leaks: PiiLeak[] = [];
    for (const log of logs) {
      const leak = detectPii(log);
      if (leak.length != 0) {
        leaks = [...leaks, ...leak];
      }
    }
    const stats = getPiiLeaksStatsByTime(leaks);
    const endpoints = getPiiLeakingEndpoints(leaks);

    return { stats: stats, endpoints: endpoints };
  }, [logs]);

  return (
    <div className={classes.mainCt}>
      <div className={classes.name}>PII Leak Detection Summary</div>
      <div className={classes.tableWrapper}>
        <TableVirtuoso
          className={classes.tableVirtuoso}
          data={leakSummryOverTime.stats}
          fixedHeaderContent={() => (
            <tr>
              <th>Date</th>
              <th>PII Type</th>
              <th>Count</th>
            </tr>
          )}
          itemContent={(_: number, content: PiiLeakStat) => (
            <>
              <td>{content.date}</td>
              <td>{content.piiType}</td>
              <td>{content.uniqueCount}</td>
            </>
          )}
        />
        <TableVirtuoso
          className={classes.tableVirtuoso}
          data={leakSummryOverTime.endpoints}
          fixedHeaderContent={() => (
            <tr>
              <th>Date</th>
              <th>PII Type</th>
              <th>Count</th>
            </tr>
          )}
          itemContent={(_: number, content: PiiLeakingEndpoint) => (
            <>
              <td style={{ overflowWrap: 'anywhere' }}>{content.endpoint}</td>
              <td>{content.piiType}</td>
              <td>{content.leakCount}</td>
            </>
          )}
        />
      </div>
    </div>
  );
};

export default PiiDataLeakDetection;
