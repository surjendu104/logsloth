import { useEffect, useState } from 'react';
import type { AccessLog } from '../../parser';
import type { TrafficCandidate } from './candidate';
import type { ApexOptions } from 'apexcharts';
import Chart from 'react-apexcharts';

const osCandidates: TrafficCandidate[] = [
  { name: 'Windows 3.11', regex: /Win16/, matches: 0 },
  {
    name: 'Windows 95',
    regex: /(Windows 95)|(Win95)|(Windows_95)/,
    matches: 0,
  },
  { name: 'Windows 98', regex: /(Windows 98)|(Win98)/, matches: 0 },
  {
    name: 'Windows 2000',
    regex: /(Windows NT 5.0)|(Windows 2000)/,
    matches: 0,
  },
  {
    name: 'Windows XP',
    regex: /(Windows NT 5.1)|(Windows XP)/,
    matches: 0,
  },
  { name: 'Windows Server 2003', regex: /(Windows NT 5.2)/, matches: 0 },
  { name: 'Windows Vista', regex: /(Windows NT 6.0)/, matches: 0 },
  { name: 'Windows 7', regex: /(Windows NT 6.1)/, matches: 0 },
  { name: 'Windows 8', regex: /(Windows NT 6.2)/, matches: 0 },
  { name: 'Windows 10/11', regex: /(Windows NT 10.0)/, matches: 0 },
  {
    name: 'Windows NT 4.0',
    regex: /(Windows NT 4.0)|(WinNT4.0)|(WinNT)|(Windows NT)/,
    matches: 0,
  },
  { name: 'Windows ME', regex: /Windows ME/, matches: 0 },
  { name: 'OpenBSD', regex: /OpenBSD/, matches: 0 },
  { name: 'SunOS', regex: /SunOS/, matches: 0 },
  { name: 'Android', regex: /Android/, matches: 0 },
  { name: 'Linux', regex: /(Linux)|(X11)/, matches: 0 },
  { name: 'MacOS', regex: /(Mac_PowerPC)|(Macintosh)/, matches: 0 },
  { name: 'QNX', regex: /QNX/, matches: 0 },
  { name: 'iOS', regex: /iPhone OS/, matches: 0 },
  { name: 'BeOS', regex: /BeOS/, matches: 0 },
  { name: 'OS/2', regex: /OS\/2/, matches: 0 },
  {
    name: 'Search Bot',
    regex:
      /(APIs-Google)|(AdsBot)|(nuhk)|(Googlebot)|(Storebot)|(Google-Site-Verification)|(Mediapartners)|(Yammybot)|(Openbot)|(Slurp)|(MSNBot)|(Ask Jeeves\/Teoma)|(ia_archiver)/,
    matches: 0,
  },
  { name: 'Windows Phone', regex: /Windows Phone/, matches: 0 },
  { name: 'Windows CE', regex: /Windows CE/, matches: 0 },
  { name: 'FreeBSD', regex: /FreeBSD/, matches: 0 },
  { name: 'NetBSD', regex: /NetBSD/, matches: 0 },
  { name: 'DragonFlyBSD', regex: /DragonFly/, matches: 0 },
  { name: 'AIX', regex: /AIX/, matches: 0 },
  { name: 'HP-UX', regex: /HP-UX/, matches: 0 },
  { name: 'IRIX', regex: /IRIX/, matches: 0 },
  { name: 'iPadOS', regex: /iPad; CPU OS/, matches: 0 },
  { name: 'Darwin', regex: /Darwin/, matches: 0 },
  { name: 'BlackBerry', regex: /(BlackBerry|BB10)/, matches: 0 },
  { name: 'Symbian', regex: /(Symbian|Series60)/, matches: 0 },
  { name: 'Tizen', regex: /Tizen/, matches: 0 },
  { name: 'KaiOS', regex: /KaiOS/, matches: 0 },
  { name: 'webOS', regex: /webOS/, matches: 0 },
  { name: 'ChromeOS', regex: /CrOS/, matches: 0 },
  { name: 'RISC OS', regex: /RISC OS/, matches: 0 },
  { name: 'MorphOS', regex: /MorphOS/, matches: 0 },
  { name: 'AmigaOS', regex: /AmigaOS/, matches: 0 },
];

const OS = ({ logs }: { logs: AccessLog[] }) => {
  const [plotData, setPlotData] = useState<{
    labels: string[];
    values: number[];
  } | null>(null);

  const getOSType = (userAgent: string | null) => {
    if (!userAgent) {
      return 'Unknown';
    }
    for (let i = 0; i < osCandidates.length; ++i) {
      const candidate = osCandidates[i];
      if (userAgent.match(candidate.regex)) {
        candidate.matches++;
        return candidate.name;
      }
    }

    return 'Others';
  };

  useEffect(() => {
    const osCounts: { [kay: string]: number } = {};

    for (const log of logs) {
      const ua = log.userAgent;
      const device = getOSType(ua);
      if (!osCounts[device]) {
        osCounts[device] = 0;
      }
      osCounts[device]++;
    }

    // sort the counts
    const sortedEntries = Object.entries(osCounts).sort((a, b) => b[1] - a[1]);
    const sortedOSCounts = Object.fromEntries(sortedEntries);

    const labels = Object.keys(sortedOSCounts);
    const values = Object.values(sortedOSCounts);
    setPlotData({ labels: labels, values: values });
  }, [logs]);

  const chartOptions: ApexOptions = {
    chart: {
      type: 'donut',
      fontFamily: 'var(--font-family)',
      // offsetX: -50
    },
    labels: plotData ? plotData.labels : [], // legend labels
    legend: {
      position: 'right',
      horizontalAlign: 'left',
      // offsetX: 10
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
          key={'client-pi-chart'}
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

export default OS;
