import { useEffect, useState } from 'react';
import type { NginxAccessLog } from '../../parser';
import type { TrafficCandidate } from './candidate';
import type { ApexOptions } from 'apexcharts';
import Chart from 'react-apexcharts';

const clientCandidates: TrafficCandidate[] = [
  { name: 'Curl', regex: /curl\//, matches: 0 },
  { name: 'Postman', regex: /PostmanRuntime\//, matches: 0 },
  { name: 'Insomnia', regex: /insomnia\//, matches: 0 },
  { name: 'Python requests', regex: /python-requests\//, matches: 0 },
  { name: 'Nodejs fetch', regex: /node-fetch\//, matches: 0 },
  { name: 'Seamonkey', regex: /Seamonkey\//, matches: 0 },
  { name: 'Firefox', regex: /Firefox\//, matches: 0 },
  { name: 'Chrome', regex: /Chrome\//, matches: 0 },
  { name: 'Chromium', regex: /Chromium\//, matches: 0 },
  { name: 'aiohttp', regex: /aiohttp\//, matches: 0 },
  { name: 'Python', regex: /Python\//, matches: 0 },
  { name: 'Go http', regex: /[Gg]o-http-client\//, matches: 0 },
  { name: 'Java', regex: /Java\//, matches: 0 },
  { name: 'axios', regex: /axios\//, matches: 0 },
  { name: 'Dart', regex: /Dart\//, matches: 0 },
  { name: 'OkHttp', regex: /OkHttp\//, matches: 0 },
  { name: 'Uptime Kuma', regex: /Uptime-Kuma\//, matches: 0 },
  { name: 'undici', regex: /undici\//, matches: 0 },
  { name: 'Lush', regex: /Lush\//, matches: 0 },
  { name: 'Zabbix', regex: /Zabbix/, matches: 0 },
  { name: 'Guzzle', regex: /GuzzleHttp\//, matches: 0 },
  { name: 'Uptime', regex: /Better Uptime/, matches: 0 },
  { name: 'GitHub Camo', regex: /github-camo/, matches: 0 },
  { name: 'Ruby', regex: /Ruby/, matches: 0 },
  { name: 'Node.js', regex: /node/, matches: 0 },
  { name: 'Next.js', regex: /Next\.js/, matches: 0 },
  {
    name: 'Vercel Edge Functions',
    regex: /Vercel Edge Functions/,
    matches: 0,
  },
  {
    name: 'OpenAI Image Downloader',
    regex: /OpenAI Image Downloader/,
    matches: 0,
  },
  { name: 'OpenAI', regex: /OpenAI/, matches: 0 },
  {
    name: 'Tsunami Security Scanner',
    regex: /TsunamiSecurityScanner/,
    matches: 0,
  },
  { name: 'iOS', regex: /iOS\//, matches: 0 },
  { name: 'Safari', regex: /Safari\//, matches: 0 },
  { name: 'Edge', regex: /Edg\//, matches: 0 },
  { name: 'Opera', regex: /(OPR|Opera)\//, matches: 0 },
  { name: 'Internet Explorer', regex: /(; MSIE |Trident\/)/, matches: 0 },
  { name: 'Wget', regex: /Wget/, matches: 0 },
  { name: 'libwww-perl', regex: /libwww-perl/, matches: 0 },
  { name: 'PHP', regex: /PHP/, matches: 0 },
  { name: 'reqwest', regex: /reqwest/, matches: 0 },
  { name: 'Dotnet', regex: /(HttpClient|\.NET)/, matches: 0 },
  { name: 'Googlebot', regex: /Googlebot/, matches: 0 },
  { name: 'Bingbot', regex: /bingbot/, matches: 0 },
  { name: 'Slackbot', regex: /Slackbot/, matches: 0 },
  { name: 'Discordbot', regex: /Discordbot/, matches: 0 },
  { name: 'Brave', regex: /Brave\//, matches: 0 },
  { name: 'Vivaldi', regex: /Vivaldi/, matches: 0 },
  { name: 'Samsung Internet', regex: /SamsungBrowser/, matches: 0 },
  { name: 'Electron', regex: /Electron/, matches: 0 },
  { name: 'Zoom', regex: /Zoom/, matches: 0 },
  { name: 'Teams', regex: /Teams/, matches: 0 },
];

const Client = ({ logs }: { logs: NginxAccessLog[] }) => {
  const [plotData, setPlotData] = useState<{
    labels: string[];
    values: number[];
  } | null>(null);

  const getClientType = (userAgent: string | null) => {
    if (!userAgent) {
      return 'Unknown';
    }
    for (let i = 0; i < clientCandidates.length; ++i) {
      const candidate = clientCandidates[i];
      if (userAgent.match(candidate.regex)) {
        candidate.matches++;
        return candidate.name;
      }
    }

    return 'Others';
  };

  useEffect(() => {
    const clientCounts: { [kay: string]: number } = {};

    for (const log of logs) {
      const ua = log.userAgent;
      const device = getClientType(ua);
      if (!clientCounts[device]) {
        clientCounts[device] = 0;
      }
      clientCounts[device]++;
    }

    // sort the counts
    const sortedEntries = Object.entries(clientCounts).sort(
      (a, b) => b[1] - a[1],
    );
    const sortedClientCounts = Object.fromEntries(sortedEntries);

    const labels = Object.keys(sortedClientCounts);
    const values = Object.values(sortedClientCounts);
    setPlotData({ labels: labels, values: values });
  }, [logs]);

  const chartOptions: ApexOptions = {
    chart: {
      type: 'donut',
      fontFamily: 'var(--font-family)',
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
          key={'os-pi-chart'}
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

export default Client;
