import { useEffect, useState } from 'react';
import type { NginxAccessLog } from './parser';
import classes from './SuspeciousIPs.module.css';
import { LuCopy, LuLogs } from 'react-icons/lu';
import { IoDocumentTextOutline } from 'react-icons/io5';

type SuspiciousIP = {
  ip: string;
  score: number;
  reasons: string[];
  expanded: boolean;
};

const SuspeciousIPs = ({ logs }: { logs: NginxAccessLog[] }) => {
  const [suspeciousIps, setSuspeciousIps] = useState<SuspiciousIP[]>([]);
  const detectSuspiciousIPs = (
    logs: NginxAccessLog[],
    opts = {
      errorRateThreshold: 0.5, // >50% errors
      errorCountThreshold: 20, // >=20 errors in total
      requestRateThreshold: 100, // >=100 requests per minute
      suspiciousUserAgents: [/curl/i, /python/i, /sqlmap/i, /nikto/i, /nmap/i],
      suspiciousEndpoints: [
        /admin/i,
        /wp-login/i,
        /phpmyadmin/i,
        /etc\/passwd/i,
        /config/i,
        /.env/i,
        /.git/i,
      ],
      scoreThreshold: 5, // total score needed to be flagged
    },
  ): SuspiciousIP[] => {
    const ipStats: Record<
      string,
      {
        total: number;
        errors: number;
        malformed: number;
        requestsPerMinute: Record<string, number>;
        suspiciousUA: boolean;
        suspiciousEndpoint: boolean;
      }
    > = {};

    // Aggregate stats per IP
    logs.forEach((log) => {
      if (!ipStats[log.ip]) {
        ipStats[log.ip] = {
          total: 0,
          errors: 0,
          malformed: 0,
          requestsPerMinute: {},
          suspiciousUA: false,
          suspiciousEndpoint: false,
        };
      }
      const stats = ipStats[log.ip];
      stats.total++;

      // Count errors
      if (log.status >= 400) stats.errors++;

      // Count malformed
      if (log.malformed) stats.malformed++;

      // Requests per minute
      if (log.time) {
        const bucket = log.time.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
        stats.requestsPerMinute[bucket] =
          (stats.requestsPerMinute[bucket] || 0) + 1;
      }

      // Suspicious User-Agent
      if (log.userAgent) {
        if (opts.suspiciousUserAgents.some((r) => r.test(log.userAgent))) {
          stats.suspiciousUA = true;
        }
      }

      // Suspicious Endpoints
      if (log.url) {
        if (opts.suspiciousEndpoints.some((r) => r.test(log.url!))) {
          stats.suspiciousEndpoint = true;
        }
      }
    });

    // Evaluate each IP with scoring
    const result: SuspiciousIP[] = [];

    for (const [ip, stats] of Object.entries(ipStats)) {
      let score = 0;
      const reasons: string[] = [];

      // Error rate
      const errorRate = stats.errors / stats.total;
      if (
        errorRate > opts.errorRateThreshold &&
        stats.errors >= opts.errorCountThreshold
      ) {
        score += 2;
        reasons.push(`High error rate (${(errorRate * 100).toFixed(1)}%)`);
      }

      // Request rate
      const maxPerMinute = Math.max(...Object.values(stats.requestsPerMinute));
      if (maxPerMinute > opts.requestRateThreshold) {
        score += 2;
        reasons.push(`High request rate (${maxPerMinute}/min)`);
      }

      // Malformed requests
      if (stats.malformed > 5) {
        score += 1;
        reasons.push(`Many malformed requests (${stats.malformed})`);
      }

      // Suspicious User-Agent
      if (stats.suspiciousUA) {
        score += 3;
        reasons.push(`Suspicious user-agent detected`);
      }

      // Suspicious Endpoint Access
      if (stats.suspiciousEndpoint) {
        score += 2;
        reasons.push(`Accessed sensitive endpoint`);
      }

      if (score >= opts.scoreThreshold) {
        result.push({ ip, score, reasons, expanded: false });
      }
    }

    return result.sort((a: SuspiciousIP, b: SuspiciousIP) => b.score - a.score);
  };

  const toggleSuspeciousIP = (index: number) => {
    if (index < suspeciousIps.length) {
      setSuspeciousIps((prev: SuspiciousIP[]) =>
        prev.map((ip: SuspiciousIP, idx: number) =>
          idx === index ? { ...ip, expanded: !ip.expanded } : ip,
        ),
      );
    }
  };

  useEffect(() => {
    setSuspeciousIps(detectSuspiciousIPs(logs));
  }, [logs]);

  return (
    <div className={classes.mainCt}>
      <div className={classes.name}>Suspecious IPs</div>
      <div className={classes.ipCt}>
        {suspeciousIps.map((sip: SuspiciousIP, index: number) => (
          <div
            key={index}
            className={`${classes.ipCtInner} ${suspeciousIps[index].expanded ? classes.expanded : ''}`}
          >
            <div className={classes.ipCtMainBar}>
              <div>
                <span
                  className={`${classes.ip} ${suspeciousIps[index].expanded ? classes.expanded : ''}`}
                >
                  {sip.ip}
                </span>
                {/* <span>{sip.score}</span> */}
              </div>
              <div className={classes.actionCt}>
                <button title="Info" onClick={() => toggleSuspeciousIP(index)}>
                  <IoDocumentTextOutline size={16} />
                </button>
                <button title="Logs">
                  <LuLogs size={16} />
                </button>
                <button title="Copy IP">
                  <LuCopy size={16} />
                </button>
              </div>
            </div>

            {suspeciousIps[index].expanded && (
              <div className={classes.infoCt}>
                <div>Suspision Score: {sip.score}</div>
                <div>Reasons</div>
                <ul className={classes.reasonCt}>
                  {sip.reasons.map((r: string, idx: number) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuspeciousIPs;
