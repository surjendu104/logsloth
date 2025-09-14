import { useEffect, useState } from 'react';
import type { NginxAccessLog } from '../parser';
import type { ApexOptions } from 'apexcharts';
import Chart from 'react-apexcharts';
import classes from './UsageChart.module.css';

const UsageChart = ({ logs }: { logs: NginxAccessLog[] }) => {
  const [plotData, setPlotData] = useState<
    { name: string; data: number[] }[] | null
  >(null);

  useEffect(() => {
    const hourlyRequestCount = new Array(24).fill(0);
    const hourlyUserSets: Set<string>[] = Array.from(
      { length: 24 },
      () => new Set(),
    );

    logs.forEach((log) => {
      if (log.time) {
        const date = new Date(log.time);
        const hour = date.getHours();
        hourlyRequestCount[hour] += 1;
        if (log.ip) {
          hourlyUserSets[hour].add(log.ip);
        }
      }
    });

    // Convert sets to counts
    const hourlyUserCount = hourlyUserSets.map((set) => set.size);

    setPlotData([
      { name: 'Request Count', data: hourlyRequestCount },
      { name: 'User Count', data: hourlyUserCount },
    ]);
  }, [logs]);

  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      fontFamily: 'var(--font-family)',
      toolbar: { show: false },
      zoom: { enabled: false },
      // offsetY: 20
    },
    title: {
      text: 'Usage Time',
      style: {
        fontSize: '18px',
        fontWeight: '600',
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 5,
        borderRadiusApplication: 'end',
      },
    },
    dataLabels: {
      enabled: false,
      style: {
        colors: ['var(--text-black)'],
        fontFamily: 'var(--font-family)',
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: Array.from({ length: 24 }, (_, hour) => {
        const start = hour.toString().padStart(2, '0');
        const end = ((hour + 1) % 24).toString().padStart(2, '0');
        return `${start}-${end}`;
      }),
      labels: {
        rotate: -45,
        rotateAlways: true,
        // hideOverlappingLabels: true,
        // formatter: (val: string, index: number) => {
        //   // Show only every 3rd hour
        //   return index % 3 === 0 ? val : "";
        // }
      },
    },
    yaxis: {
      title: {
        text: 'Count',
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return val.toString();
        },
      },
      x: {
        formatter: (val: number) => {
          const intervalValues = val.toString().split('-');
          const start = intervalValues[0];
          const end = intervalValues[1];
          return `Count Between ${start}:00-${end}:00`;
        },
      },
    },
  };

  return (
    <div className={classes.mainCt}>
      {plotData && (
        <Chart
          options={chartOptions}
          series={plotData}
          type="bar"
          height={'100%'}
          width={'100%'}
        />
      )}
    </div>
  );
};

export default UsageChart;
