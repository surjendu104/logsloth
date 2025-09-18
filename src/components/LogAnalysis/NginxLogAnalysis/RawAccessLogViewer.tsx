import React, { useState, useMemo, useCallback } from 'react';
import type { NginxAccessLog } from './parser';
import classes from './RawAccessLogViewer.module.css';
import dropdownIcon from '../../../assets/select-element-dropdown-icon.svg';
import { LuSearch } from 'react-icons/lu';
import { Virtuoso } from 'react-virtuoso';
import { useLogContext } from '../../../hooks/useLogContext';

type Props = {
  logs: NginxAccessLog[];
};

const RawAccessLogViewer: React.FC<Props> = ({ logs }) => {
  const {accessLogSearchQuery, setAccessLogSearchQuery} = useLogContext();
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const formatDate = (date: Date): string => {
    const day = String(date.getUTCDate()).padStart(2, '0');
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const month = monthNames[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${day}/${month}/${year}:${hours}:${minutes}:${seconds} +0000`;
  };

  const generateRawLog = useCallback((log: NginxAccessLog): string => {
    if (!log.time) return 'Invalid Log (no time)';
    const timeStr = formatDate(log.time);
    const user = log.user ?? '-';
    const method = log.method ?? '';
    const url = log.url ?? '';
    const protocol = log.protocol ?? '';
    const request =
      log.requestRaw && !log.malformed
        ? log.requestRaw
        : `${method} ${url} ${protocol}`;
    return `${log.ip} - ${user} [${timeStr}] "${request}" ${log.status} ${log.size} "${log.referer}" "${log.userAgent}"`;
  }, []);

  const toggleExpand = (index: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const filteredLogs = useMemo(() => {
    if (!accessLogSearchQuery.trim()) return logs;
    const lower = accessLogSearchQuery.toLowerCase();
    return logs.filter((log) =>
      generateRawLog(log).toLowerCase().includes(lower),
    );
  }, [logs, accessLogSearchQuery, generateRawLog]);

  return (
    <div className={classes.mainCt}>
      <div className={classes.head}>
        <div className={classes.name}>Raw Access Logs</div>
        <div className={classes.searchCt}>
          <LuSearch size={20} />
          <input
            type="text"
            value={accessLogSearchQuery}
            onChange={(e) => setAccessLogSearchQuery(e.target.value)}
            placeholder="Search logs..."
          />
        </div>
      </div>

      <div className={classes.logViewerCt}>
        <Virtuoso
          className={classes.virtuosoCt}
          totalCount={filteredLogs.length}
          itemContent={(index) => {
            const log = filteredLogs[filteredLogs.length - 1 - index]; // newest first
            const isExpanded = expanded.has(index);

            return (
              <div
                className={`${classes.logCt} ${isExpanded ? classes.logExpanded : ''}`}
                onClick={() => toggleExpand(index)}
              >
                <div className={classes.rawLog}>
                  <img
                    className={`${classes.logDropdownImg} ${isExpanded ? classes.open : ''}`}
                    src={dropdownIcon}
                    alt="toggle"
                  />
                  <div>{generateRawLog(log)}</div>
                </div>
                {isExpanded && (
                  <pre className={classes.logJsonCt} onClick={(e) => e.stopPropagation()}>
                    {JSON.stringify(log, null, 2)}
                  </pre>
                )}
              </div>
            );
          }}
        />
      </div>
    </div>
  );
};

export default RawAccessLogViewer;
