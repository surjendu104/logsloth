import { useEffect, useState } from 'react';
import type { NginxAccessLog } from '../parser';
import type { ApexOptions } from 'apexcharts';
import Chart from 'react-apexcharts';
import classes from './TopEndpoints.module.css';

/* const TopEndpoints = ({logs}: {logs: NginxAccessLog[]}) => {
  const [plotData, setPlotData] = useState<[{
  data: { x: string; y: number }[]
}] | null>(null);

  useEffect(() => {
    const endpointCounts:{[path:string]: number} = {};
    logs.forEach((log) => {
      const url = log.url?.split('?')[0];
      // console.log(url);
      if(url) {
        endpointCounts[url] = (endpointCounts[url] || 0) + 1;;
      }
    })
    // console.log(endpointCounts);
    const finalPlotData = Object.entries(endpointCounts).map(([path, count]) => ({
      x: path,
      y: count
    })).sort((a, b) => b.y - a.y).slice(0, 10);

    setPlotData([{data:finalPlotData}])
  }, [logs]);

  const chartOptions:ApexOptions = {
              legend: {
                show: false
              },
              chart: {
                height: 350,
                type: 'treemap',
                fontFamily: 'var(--font-family)',
                toolbar: { show: false },
                zoom: { enabled: false },
              },
              title: {
                text: 'Basic Treemap'
              }
            };
  return (
    <div className={classes.mainCt}>
    {plotData && (
            <Chart
              options={chartOptions}
              series={plotData}
              type="treemap"
              height={'100%'}
              width={'100%'}
            />
          )}
    </div>
  )
} */

const TopEndpoints = ({ logs }: { logs: NginxAccessLog[] }) => {
  const [plotData, setPlotData] = useState<{ [path: string]: number } | null>(
    null,
  );

  useEffect(() => {
    const endpointCounts: { [path: string]: number } = {};
    logs.forEach((log) => {
      const url = log.url?.split('?')[0];
      // console.log(url);
      if (url) {
        endpointCounts[url] = (endpointCounts[url] || 0) + 1;
      }
    });

    setPlotData(endpointCounts);
  }, [logs]);

  // Sort data by count (descending) and take top 10
  const sortedData = plotData
    ? Object.entries(plotData)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
    : [];

  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      fontFamily: 'var(--font-family)',
      toolbar: { show: false },
    },
    title: {
      text: 'Top Endpoints',
      style: {
        fontSize: '18px',
        fontWeight: '600',
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        borderRadiusApplication: 'end',
        horizontal: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: sortedData.map(([path]) => path),
    },
  };

  const series = [
    {
      name: 'Requests',
      data: sortedData.map(([, count]) => count),
    },
  ];

  return (
    <div className={classes.mainCt}>
      {plotData && (
        <Chart
          options={chartOptions}
          series={series}
          type="bar"
          height={'100%'}
          width={'100%'}
        />
      )}
    </div>
  );
};

export default TopEndpoints;
