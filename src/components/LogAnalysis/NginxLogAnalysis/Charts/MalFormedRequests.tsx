import { useMemo } from 'react';
import type { NginxAccessLog } from '../parser';
import type { ApexOptions } from 'apexcharts';
import Chart from 'react-apexcharts';
import classes from './MalFormedRequests.module.css';
import { isbot } from 'isbot';

// Decide bucket size based on selected period
const getBucketSize = (start: Date, end: Date): number => {
  const rangeMs = end.getTime() - start.getTime();
  const targetBuckets = 100; // aim for ~100 points
  return Math.max(Math.floor(rangeMs / targetBuckets), 60 * 1000); // at least 1 minute
};

const MalFormedRequests = ({ logs }: { logs: NginxAccessLog[] }) => {
  const seriesData = useMemo(() => {
    if (logs.length === 0) {
      return [];
    }
    const endDate = logs[logs.length - 1].time;
    const startDate = logs[0].time;

    if (!startDate || !endDate) return [];

    const malformedURLcounts = new Map<number, number>();
    const botRequestcounts = new Map<number, number>();

    // prefill buckets
    const bucketMs = getBucketSize(startDate, endDate);
    const firstBucket = Math.floor(startDate.getTime() / bucketMs) * bucketMs;
    for (let t = firstBucket; t <= endDate.getTime(); t += bucketMs) {
      malformedURLcounts.set(t, 0);
      botRequestcounts.set(t, 0);
    }

    // bucket logs
    for (const log of logs) {
      if (!log.time) continue;
      const ts = log.time.getTime();
      if (ts < startDate.getTime() || ts > endDate.getTime()) continue;

      const bucketStart = Math.floor(ts / bucketMs) * bucketMs;
      if (log.malformed) {
        malformedURLcounts.set(
          bucketStart,
          (malformedURLcounts.get(bucketStart) || 0) + 1,
        );
      }
      if (isbot(log.userAgent)) {
        botRequestcounts.set(
          bucketStart,
          (botRequestcounts.get(bucketStart) || 0) + 1,
        );
      }
    }

    const data = [
      {
        name: 'Malformed URLs',
        data: Array.from(malformedURLcounts.entries())
          .sort((a, b) => a[0] - b[0])
          .map(([x, y]) => ({ x, y })),
      },
      {
        name: 'Bot Requests',
        data: Array.from(botRequestcounts.entries())
          .sort((a, b) => a[0] - b[0])
          .map(([x, y]) => ({ x, y })),
      },
    ];

    return data;
  }, [logs]);

  const chartOptions: ApexOptions = {
    chart: {
      id: 'main',
      type: 'area',
      zoom: { type: 'x', enabled: false, autoScaleYaxis: false },
      toolbar: { show: false },
      fontFamily: 'var(--font-family)',
    },
    title: {
      text: 'Automated/Anomalous Traffic Trends',
      style: {
        fontSize: '18px',
        fontWeight: '600',
      },
    },
    markers: { size: 0 },
    stroke: { curve: 'smooth', width: 2 },
    dataLabels: { enabled: false },
    tooltip: { x: { format: 'dd MMM yyyy HH:mm:ss' } },
    xaxis: {
      type: 'datetime',
      labels: { datetimeUTC: true },
      axisBorder: { show: false, color: 'var(--text-gray)' },
    },
    yaxis: {
      title: {
        text: 'Requests',
        style: {
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--text-black)',
        },
      },
      axisBorder: { show: false, color: 'var(--text-gray)' },
    },
    fill: {
      type: 'gradient',
      colors: ['#d90429', '#008ffb'],
      gradient: { shadeIntensity: 1, opacityFrom: 0.6, opacityTo: 0.05 },
    },
    grid: {
      show: false,
      xaxis: {
        lines: {
          show: true,
        },
      },
    },
  };

  return (
    <div className={classes.mainCt}>
      <Chart
        options={chartOptions}
        series={seriesData}
        type="area"
        height={'100%'}
        width={'100%'}
        className={classes.chart}
      />
    </div>
  );
};

export default MalFormedRequests;
