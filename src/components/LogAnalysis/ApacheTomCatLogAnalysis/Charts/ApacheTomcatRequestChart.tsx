import type { ApexOptions } from 'apexcharts';
import Chart from 'react-apexcharts';
import classes from './ApacheTomcatRequestChart.module.css';
import type { AccessLog } from '../parser';
import { useMemo, useState } from 'react';

type ChartMode = 'generic' | 'method' | 'status_code';

// Decide bucket size based on selected period
const getBucketSize = (start: Date, end: Date): number => {
  const rangeMs = end.getTime() - start.getTime();
  const targetBuckets = 100; // aim for ~100 points
  return Math.max(Math.floor(rangeMs / targetBuckets), 60 * 1000); // at least 1 minute
};

const ApacheTomcatRequestChart = ({ logs }: { logs: AccessLog[] }) => {
  const [chartMode, setChartMode] = useState<ChartMode>('generic');

  const seriesData = useMemo(() => {
    if (logs.length === 0) return [];

    const endDate = logs[logs.length - 1].time;
    const startDate = logs[0].time;
    if (!startDate || !endDate) return [];

    const bucketMs = getBucketSize(startDate, endDate);
    const firstBucket = Math.floor(startDate.getTime() / bucketMs) * bucketMs;

    // helper: init buckets
    const initBuckets = () => {
      const map = new Map<number, number>();
      for (let t = firstBucket; t <= endDate.getTime(); t += bucketMs) {
        map.set(t, 0);
      }
      return map;
    };

    // choose grouping key
    const getKey = (log: AccessLog) => {
      if (chartMode === 'method') return log.method || 'UNKNOWN';
      if (chartMode === 'status_code') return String(log.status) || 'UNKNOWN';
      return 'ALL';
    };

    // buckets grouped by key
    const grouped = new Map<string, Map<number, number>>();

    for (const log of logs) {
      if (!log.time) continue;
      const ts = log.time.getTime();
      if (ts < startDate.getTime() || ts > endDate.getTime()) continue;

      const bucketStart = Math.floor(ts / bucketMs) * bucketMs;
      const key = getKey(log);

      if (!grouped.has(key)) {
        grouped.set(key, initBuckets());
      }

      const buckets = grouped.get(key)!;
      buckets.set(bucketStart, (buckets.get(bucketStart) || 0) + 1);
    }

    // convert into Apex series
    return Array.from(grouped.entries()).map(([name, buckets]) => ({
      name,
      data: Array.from(buckets.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([x, y]) => ({ x, y })),
    }));
  }, [logs, chartMode]);

  const handleChartModeChange = (newMode:ChartMode) => {
    if(newMode !== chartMode) {
      setChartMode(newMode)
    }
  }

  const chartOptions: ApexOptions = {
    chart: {
      id: 'main',
      type: 'area',
      height: 350,
      zoom: { type: 'x', enabled: false, autoScaleYaxis: false },
      toolbar: { show: false },
      fontFamily: 'var(--font-family)',
      // offsetY: -40
    },
    // title: {
    //   text: 'Request Chart',
    //   style: {
    //     fontSize: '18px',
    //     fontWeight: '600',
    //   },
    // },
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
        text: 'Request count',
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
      gradient: { shadeIntensity: 1, opacityFrom: 0.6, opacityTo: 0.05 },
    },
    grid: {
      show: true,
      xaxis: {
        lines: {
          show: true,
        },
      },
    },
  };

  return (
    <div className={classes.nrpsHead}>
      <div className={classes.rpsTab}>
        <div className={classes.rpsTabInner}>
          <span
            className={`${classes.tab} ${chartMode === 'generic' ? classes.activeTab : ''}`}
            onClick={() => handleChartModeChange('generic')}
          >
            Generic
          </span>
          <span
            className={`${classes.tab} ${chartMode === 'method' ? classes.activeTab : ''}`}
            onClick={() => handleChartModeChange('method')}
          >
            Method
          </span>
          <span
            className={`${classes.tab} ${chartMode === 'status_code' ? classes.activeTab : ''}`}
            onClick={() => handleChartModeChange('status_code')}
          >
            Status Code
          </span>
        </div>
      </div>
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

export default ApacheTomcatRequestChart;
