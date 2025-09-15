import { useEffect, useMemo, useState, type JSX } from 'react';
import { parseLogLines, type NginxAccessLog } from './parser';
import FileUpload from './FileUpload';
import {
  getLogDateRange,
  getPeriodStart,
  type LogDateRange,
  type Period,
  type PeriodMode,
} from './period';
import NginxRequestChart from './Charts/NginxRequestChart';
import classes from './NginxLogAnalysisPage.module.css';
import TrafficOverview from './Charts/TrafficOverview';
import TrafficDeviceChart from './Charts/DeviceChart/TrafficDeviceChart';
import UsageChart from './Charts/UsageChart';
import TopEndpoints from './Charts/TopEndpoints';
import ResponseSize from './Charts/ResponseSize';
import MalFormedRequests from './Charts/MalFormedRequests';
import Referrer from './Charts/Referrer';
import SuspeciousIPs from './SuspeciousIPs';

const PERIODS = [
  {
    name: '1h',
    value: '1h',
  },
  {
    name: '24h',
    value: '24h',
  },
  {
    name: '1 Week',
    value: '7d',
  },
  {
    name: '1 Month',
    value: '30d',
  },
  {
    name: '6 Month',
    value: '6m',
  },
  {
    name: 'All Time',
    value: 'all',
  },
];

const NginxLogAnalysisPage = (): JSX.Element => {
  const [accessLogs, setAccessLogs] = useState<string[]>([]);
  const [, setErrorLogs] = useState<string[]>([]);
  const [parsedLogs, setParsedLogs] = useState<NginxAccessLog[]>([]);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [period, setPeriod] = useState<Period>('all');
  const [logDateRange, setLogDateRange] = useState<LogDateRange>({
    start: -Infinity,
    end: Infinity,
  });
  const [logPeriodRangeMode] = useState<PeriodMode>('datasetRelative');

  const filteredAccessLogByTimePeriod = useMemo(() => {
    if (!parsedLogs.length) return [];

    // get dataset range
    const logRange = getLogDateRange(parsedLogs);
    console.log(logRange);
    if (!logRange) return [];

    const endDate =
      logPeriodRangeMode === 'datasetRelative'
        ? new Date(logRange.end)
        : new Date();
    const startDate =
      getPeriodStart(period, endDate) ?? new Date(logRange.start);

    setLogDateRange(logRange);

    const filteredLogs = [];
    for (const log of parsedLogs) {
      if (!log.time) continue;
      const ts = log.time.getTime();
      if (ts < startDate.getTime() || ts > endDate.getTime()) continue;
      else {
        filteredLogs.push(log);
      }
    }
    return filteredLogs.sort((a, b) => {
      const aTime = a.time?.getTime() ?? 0;
      const bTime = b.time?.getTime() ?? 0;
      return aTime - bTime;
    });
  }, [parsedLogs, period, logPeriodRangeMode]);

  const changePeriod = (newPeriod: Period) => {
    if (newPeriod !== period) {
      setPeriod(newPeriod);
    }
  };

  useEffect(() => {
    if (accessLogs.length != 0) {
      const parsedAccessLogs = parseLogLines(accessLogs);
      setParsedLogs(parsedAccessLogs);
      setIsFileUploaded(true);
    }
  }, [accessLogs]);

  if (!isFileUploaded || accessLogs.length === 0 || parsedLogs.length === 0) {
    return (
      <FileUpload setAccessLogs={setAccessLogs} setErrorLogs={setErrorLogs} />
    );
  }

  return (
    <div className={classes.nginxLogAMainCt}>
      <div className={classes.timePeriodCt}>
        <div className={classes.timePeriodCtInner}>
          {PERIODS.map((p, idx) => (
            <span
              key={idx}
              className={`${classes.timePeriod} ${p.value === period ? classes.activePeriod : ''}`}
              onClick={() => changePeriod(p.value as Period)}
            >
              {p.name}
            </span>
          ))}
        </div>
      </div>
      <TrafficOverview
        logs={filteredAccessLogByTimePeriod}
        logDateRange={logDateRange}
      />
      <NginxRequestChart logs={filteredAccessLogByTimePeriod} />
      <div className={classes.trafficAndUsageCt}>
        <TrafficDeviceChart logs={filteredAccessLogByTimePeriod} />
        <UsageChart logs={filteredAccessLogByTimePeriod} />
      </div>
      <div className={classes.trafficAndUsageCt}>
        <TopEndpoints logs={filteredAccessLogByTimePeriod} />
        <ResponseSize logs={filteredAccessLogByTimePeriod} />
      </div>
      <div className={classes.trafficAndUsageCt}>
        <MalFormedRequests logs={filteredAccessLogByTimePeriod} />
        <Referrer logs={filteredAccessLogByTimePeriod} />
      </div>
      <div className={classes.trafficAndUsageCt}>
      <SuspeciousIPs logs={filteredAccessLogByTimePeriod} />
      </div>
    </div>
  );
};

export default NginxLogAnalysisPage;

/*
charts
1. Request count per second
2. HTTP status code count per second
3. HTTP method count per second
4. Success rate
5. User/unique IP count
6. daytime wise heatmap of request count
7. uptime graph + number of requests + number of users
8. Error logs viewer
9. Raw Access log viewer
10. Parsed Access log viewer

11. DOSS Attack detection
12. PII data leak detection

14. Top endpoints interms of Bandwidth, Byte sent per interval
15. Latency graph (P50, P90, P99)

16. Device type(browser, mobile, crawler, bot)
17. Client OS type(ios, android, windows, mac)
*/

/*
[Total Request Count] [Total user/unique IP] [Success Rate] [Request/second]
[Request Graph{Generic, Method Wise, HTTP Status Code Wise}]
[PI Chart of {Device type, Client type, OS type}] | [Usage time Bar Graph{number of request + number of user}]
[Latency Graph {P90, P95, P50}] **not possible for default nginx log
[Top Endpoints(Horizontal bar chart/treemap)] [Response Size Distribution]
[Malformed request, bot request by time(line)][Reffer Breakdown(Pie/treemap)]
[Geographical distribution of requests] [Suspecious IPs]
[Raw Access Logs viewer]
[Raw Error Logs viewer]
[DOSS Attack Detection] [PII Leak Detection]
[uptime graph + number of requests + number of users] [Response Size]
*/
