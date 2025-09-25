import { useEffect, useMemo, useState, type JSX } from 'react';
import {
  parseLogLines,
  parseServerLogs,
  type AccessLog,
  type ServerLog,
} from './parser';
import {
  getLogDateRange,
  getPeriodStart,
  type LogDateRange,
  type Period,
  type PeriodMode,
} from './period';
import classes from './ApacheTomCatLogAnalysisPage.module.css';
import FileUpload from './FileUpload';
import ApacheTomcatRequestChart from './Charts/ApacheTomcatRequestChart';
import TrafficOverview from './Charts/TrafficOverview';
import TrafficDeviceChart from './Charts/DeviceChart/TrafficDeviceChart';
import UsageChart from './Charts/UsageChart';
import TopEndpoints from './Charts/TopEndpoints';
import ResponseSize from './Charts/ResponseSize';
import MalFormedRequests from './Charts/MalFormedRequests';
import Referrer from './Charts/Referrer';
import SuspeciousIPs from './SuspeciousIPs';
import RawAccessLogViewer from './RawAccessLogViewer';
import RawErrorLogViewer from './RawErrorLogViewer';
import PiiDataLeakDetection from './PiiDataLeakDetection';

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

const ApacheTomCatLogAnalysisPage = (): JSX.Element => {
  const [accessLogs, setAccessLogs] = useState<string[]>([]);
  const [serverLogs, setServerLogs] = useState<string[]>([]);
  const [parsedLogs, setParsedLogs] = useState<AccessLog[]>([]);
  const [parsedServerLogs, setParsedServerLogs] = useState<ServerLog[]>([]);
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
    if (!logRange) return [];

    const endDate =
      logPeriodRangeMode === 'datasetRelative'
        ? new Date(logRange.end)
        : new Date();
    const startDate =
      getPeriodStart(period, endDate) ?? new Date(logRange.start);

    setLogDateRange({ start: startDate.getTime(), end: endDate.getTime() });

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

  const filteredErrorLogByTimePeriod = useMemo(() => {
    if (!parsedServerLogs.length) return [];

    // get dataset range
    const logRange = getLogDateRange(parsedServerLogs);
    if (!logRange) return [];

    const endDate =
      logPeriodRangeMode === 'datasetRelative'
        ? new Date(logRange.end)
        : new Date();
    const startDate =
      getPeriodStart(period, endDate) ?? new Date(logRange.start);

    const filteredLogs = [];

    for (const log of parsedServerLogs) {
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
  }, [logPeriodRangeMode, parsedServerLogs, period]);

  const changePeriod = (newPeriod: Period) => {
    if (newPeriod !== period) {
      setPeriod(newPeriod);
    }
  };

  const totalLogDateRange = useMemo(() => {
    if (parsedLogs) {
      const range = getLogDateRange(parsedLogs);
      return {
        start: new Date(range?.start as number).toLocaleString(),
        end: new Date(range?.end as number).toLocaleString(),
      };
    }
    return { start: 'Unknown', end: 'Unknown' };
  }, [parsedLogs]);

  const selectedLogDateRange = useMemo(() => {
    return {
      start: new Date(logDateRange.start).toLocaleString(),
      end: new Date(logDateRange.end).toLocaleString(),
    };
  }, [logDateRange]);

  useEffect(() => {
    if (accessLogs.length != 0) {
      const parsedAccessLogs = parseLogLines(accessLogs);
      setParsedLogs(parsedAccessLogs);
      setIsFileUploaded(true);
    }
  }, [accessLogs]);

  useEffect(() => {
    if (serverLogs.length != 0) {
      const parsedServerLogs = parseServerLogs(serverLogs);
      setParsedServerLogs(parsedServerLogs);
    }
  }, [serverLogs]);

  if (!isFileUploaded || accessLogs.length === 0 || parsedLogs.length === 0) {
    return (
      <FileUpload setAccessLogs={setAccessLogs} setServerLogs={setServerLogs} />
    );
  }

  return (
    <div className={classes.logAMainCt}>
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
      <div className={classes.logRangeCt}>
        <div className={classes.range}>
          <div className={classes.cardName}>Total Log Period</div>
          <div>
            {totalLogDateRange.start} - {totalLogDateRange.end}
          </div>
        </div>
        <div className={classes.range}>
          <div className={classes.cardName}>Selected Log Period</div>
          <div>
            {selectedLogDateRange.start} - {selectedLogDateRange.end}
          </div>
        </div>
      </div>
      <TrafficOverview
        logs={filteredAccessLogByTimePeriod}
        logDateRange={logDateRange}
      />
      <ApacheTomcatRequestChart logs={filteredAccessLogByTimePeriod} />
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
        <RawAccessLogViewer logs={filteredAccessLogByTimePeriod} />
      </div>
      <RawErrorLogViewer logs={filteredErrorLogByTimePeriod} />
      <PiiDataLeakDetection logs={filteredAccessLogByTimePeriod} />
    </div>
  );
};

export default ApacheTomCatLogAnalysisPage;
