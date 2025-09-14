import { useEffect, useState } from 'react';
import type { NginxAccessLog } from '../parser';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import classes from './Referrer.module.css';

const Referrer = ({ logs }: { logs: NginxAccessLog[] }) => {
  const [plotData, setPlotData] = useState<{
    labels: string[];
    values: number[];
  } | null>(null);

  useEffect(() => {
    const referrerCounts: { [key: string]: number } = {};

    for (const log of logs) {
      const referrer = log.referer;
      if (!referrerCounts[referrer]) {
        referrerCounts[referrer] = 0;
      }
      referrerCounts[referrer]++;
    }

    // sort the counts
    const sortedEntries = Object.entries(referrerCounts).sort(
      (a, b) => b[1] - a[1],
    );
    const sortedDeviceCounts = Object.fromEntries(sortedEntries);

    const labels = Object.keys(sortedDeviceCounts);
    const values = Object.values(sortedDeviceCounts);
    setPlotData({ labels: labels, values: values });
  }, [logs]);

  const chartOptions: ApexOptions = {
    chart: {
      type: 'donut',
      fontFamily: 'var(--font-family)',
      animations: {
        enabled: true,
      },
    },
    title: {
      text: 'Referrer Distribution',
      style: {
        fontSize: '18px',
        fontWeight: '600',
      },
    },
    labels: plotData ? plotData.labels : [], // legend labels
    legend: {
      position: 'bottom',
      horizontalAlign: 'left',
      height: 100,
    },
    stroke: {
      show: false,
      width: 0,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%', // adjust size of the donut hole
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              formatter: (w) =>
                w.globals.seriesTotals
                  .reduce((a: number, b: number) => a + b, 0)
                  .toString(),
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
      style: {
        colors: ['var(--text-black)'],
        fontFamily: 'var(--font-family)',
      },
    },
  };
  return (
    <div className={classes.mainCt}>
      {plotData && (
        <Chart
          key={'device-pi-chart'}
          options={chartOptions}
          series={plotData.values}
          type="donut"
          width={'100%'}
          height={'100%'}
        />
      )}
    </div>
  );
};

export default Referrer;
