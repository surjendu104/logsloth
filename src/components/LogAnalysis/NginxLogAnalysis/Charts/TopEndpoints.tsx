import { useEffect, useState } from 'react';
import type { NginxAccessLog } from '../parser';
import type { ApexOptions } from 'apexcharts';
import Chart from 'react-apexcharts';
import classes from './TopEndpoints.module.css';

const TopEndpoints = ({ logs }: { logs: NginxAccessLog[] }) => {
  const [plotData, setPlotData] = useState<{ [path: string]: number } | null>(
    null,
  );
  const [selectedStatusCode, setSelectedStatusCode] = useState<number | 'all'>(
    'all',
  );

  useEffect(() => {
    console.log(selectedStatusCode);
    const endpointCounts: { [path: string]: number } = {};
    logs.forEach((log) => {
      const url = log.url?.split('?')[0];
      if (url) {
        if (selectedStatusCode === 'all' || log.status === selectedStatusCode) {
          endpointCounts[url] = (endpointCounts[url] || 0) + 1;
        }
      }
    });
    setPlotData(endpointCounts);
  }, [logs, selectedStatusCode]);

  const handleStatusCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedStatusCode(value === 'all' ? 'all' : Number(value));
  };

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
    noData: {
      text: 'No Data Found',
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
      <div className={classes.statusCodeSelectCt}>
        <select
          name="status_code"
          id="status_code"
          value={selectedStatusCode}
          onChange={handleStatusCodeChange}
        >
          {['all', 400, 401, 404, 413, 444, 500, 503].map(
            (s: string | number) => (
              <option value={s}>{s}</option>
            ),
          )}
        </select>
      </div>
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
