import { useEffect, useState } from 'react';
import type { NginxAccessLog } from '../parser';
import classes from './TrafficOverview.module.css';
import type { LogDateRange } from '../period';

type Trafficstats = {
  totalRequestCount: number;
  totalUserCount: number;
  totalsuccessRequestCount: number;
  successRate: number;
  requestPerHour: number;
};

const TrafficOverview = ({
  logs,
  logDateRange,
}: {
  logs: NginxAccessLog[];
  logDateRange: LogDateRange;
}) => {
  const [trafficStats, setTrafficStats] = useState<Trafficstats>({
    totalRequestCount: 0,
    totalUserCount: 0,
    totalsuccessRequestCount: 0,
    successRate: 0,
    requestPerHour: 0,
  });

  useEffect(() => {
    const uniqueIps = new Set();
    let totalSuccessRequestCount = 0;
    for (const log of logs) {
      if (!uniqueIps.has(log.ip)) uniqueIps.add(log.ip);
      // success request count
      if (log.status < 400) totalSuccessRequestCount += 1;
    }

    const totalRequestCount = logs.length;
    const successRate =
      totalSuccessRequestCount === 0
        ? 0
        : parseFloat(
            ((totalSuccessRequestCount * 100) / totalRequestCount).toFixed(2),
          );

    // calculate RPH
    const dateDiffInMs = Math.abs(logDateRange.end - logDateRange.start);
    const dateDiffInHours = Math.floor(dateDiffInMs / (1000 * 60 * 60));
    const requestPerHour =
      dateDiffInHours === 0
        ? 0
        : Math.round(totalRequestCount / dateDiffInHours);

    setTrafficStats({
      totalRequestCount: totalRequestCount,
      totalUserCount: uniqueIps.size,
      totalsuccessRequestCount: totalSuccessRequestCount,
      successRate: successRate,
      requestPerHour: requestPerHour,
    });
  }, [logs, logDateRange]);

  return (
    <div className={classes.trafficOverviewCt}>
      <div className={classes.tOCard}>
        <div className={classes.cardName}>Total Requests</div>
        <div className={classes.cardValue}>
          {trafficStats.totalRequestCount}
        </div>
      </div>
      <div className={classes.tOCard}>
        <div className={classes.cardName}>Total Users(Apprx.)</div>
        <div className={classes.cardValue}>{trafficStats.totalUserCount}</div>
      </div>
      <div className={classes.tOCard}>
        <div className={classes.cardName}>Success Rate</div>
        <div className={classes.cardValue}>{trafficStats.successRate}%</div>
      </div>
      <div className={classes.tOCard}>
        <div className={classes.cardName}>Request Per Hour</div>
        <div className={classes.cardValue}>{trafficStats.requestPerHour}</div>
      </div>
    </div>
  );
};

export default TrafficOverview;
