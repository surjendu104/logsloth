import { useEffect, useState } from 'react';
import type { NginxAccessLog } from '../../parser';
import type { TrafficCandidate } from './candidate';
import type { ApexOptions } from 'apexcharts';
import Chart from 'react-apexcharts';

const deviceCandidates: TrafficCandidate[] = [
  { name: 'iPhone', regex: /iPhone/, matches: 0 },
  { name: 'iPad', regex: /iPad/, matches: 0 },
  { name: 'Android Phone', regex: /Android.*Mobile/, matches: 0 },
  { name: 'Android Tablet', regex: /Android(?!.*Mobile)/, matches: 0 },
  { name: 'Samsung', regex: /Tizen\//, matches: 0 },
  { name: 'Mac', regex: /Macintosh/, matches: 0 },
  { name: 'Windows', regex: /Windows NT/, matches: 0 },
  { name: 'Linux Desktop', regex: /X11; Linux/, matches: 0 },
  { name: 'ChromeOS', regex: /CrOS/, matches: 0 },
  { name: 'Smart TV', regex: /SmartTV|SMART-TV|HbbTV/, matches: 0 },
  { name: 'PlayStation', regex: /PlayStation/, matches: 0 },
  { name: 'Xbox', regex: /Xbox/, matches: 0 },
  { name: 'Nintendo', regex: /Nintendo/, matches: 0 },
  { name: 'Bot', regex: /bot|crawler|spider/i, matches: 0 },
];

const Device = ({ logs }: { logs: NginxAccessLog[] }) => {
  const [plotData, setPlotData] = useState<{
    labels: string[];
    values: number[];
  } | null>(null);

  const getDeviceType = (userAgent: string | null) => {
    if (!userAgent) {
      return 'Unknown';
    }
    for (let i = 0; i < deviceCandidates.length; ++i) {
      const candidate = deviceCandidates[i];
      if (userAgent.match(candidate.regex)) {
        candidate.matches++;
        return candidate.name;
      }
    }

    return 'Others';
  };

  useEffect(() => {
    const deviceCounts: { [key: string]: number } = {};

    for (const log of logs) {
      const ua = log.userAgent;
      const device = getDeviceType(ua);
      if (!deviceCounts[device]) {
        deviceCounts[device] = 0;
      }
      deviceCounts[device]++;
    }

    // sort the counts
    const sortedEntries = Object.entries(deviceCounts).sort(
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
    labels: plotData ? plotData.labels : [], // legend labels
    legend: {
      position: 'right',
      horizontalAlign: 'left',
      // height: 100
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
    <>
      {plotData && (
        <Chart
          key={'device-pi-chart'}
          options={chartOptions}
          series={plotData.values}
          type="donut"
          width="100%"
          height="100%"
        />
      )}
    </>
  );
};

export default Device;
