export type NginxAccessLog = {
  ip: string;
  user: string;
  time: Date | null;
  method?: string;
  url?: string;
  protocol?: string;
  requestRaw: string;
  status: number;
  size: number;
  referer: string;
  userAgent: string;
  malformed: boolean;
};

export type NginxErrorLog = {
  timestamp: string;
  time: Date;
  level: string;
  pid: number;
  tid: number;
  connectionId?: number;
  message: string;

  // Optional fields depending on log line
  clientIp?: string;
  serverName?: string;
  request?: string;
  upstream?: string;
  host?: string;
  referrer?: string;
};

// Valid HTTP methods
const validMethods = new Set([
  'GET',
  'POST',
  'PUT',
  'DELETE',
  'HEAD',
  'OPTIONS',
  'PATCH',
  'CONNECT',
  'TRACE',
]);

const parseDate = (date: string): Date | null => {
  if (!date) return null;

  // Replace the first ":" after the day with a space
  const dateString = date
    .replace(/:/, ' ')
    .replace(
      /([A-Za-z]{3})/,
      (match) => match[0].toUpperCase() + match.slice(1).toLowerCase(),
    );

  const parsed = new Date(dateString);
  return isNaN(parsed.getTime()) ? null : parsed;
};

export const parseLogLines = (lines: string[]): NginxAccessLog[] | [] => {
  console.log('Parse log called.....');
  console.log(lines.length);
  const combinedPattern =
    /(?<ip>\S+) - (?<user>\S+) \[(?<time>[^\]]+)\] "(?<request>[^"]*)" (?<status>\d+) (?<size>\d+) "(?<referer>[^"]*)" "(?<userAgent>[^"]*)"/;
  const data: NginxAccessLog[] = [];
  for (const line of lines) {
    const match = combinedPattern.exec(line);
    if (!match?.groups) {
      console.log(line);
      continue;
    }

    const { ip, user, time, request, status, size, referer, userAgent } =
      match.groups;

    // split into METHOD URL PROTOCOL format
    const parts = request.split(' ');
    let method: string | undefined;
    let url: string | undefined;
    let protocol: string | undefined;
    let malformed = false;

    if (parts.length === 3 && validMethods.has(parts[0])) {
      method = parts[0];
      url = parts[1];
      protocol = parts[2];
    } else {
      malformed = true;
    }

    data.push({
      ip,
      user,
      time: parseDate(time),
      method,
      url,
      protocol,
      requestRaw: request,
      status: parseInt(status, 10),
      size: parseInt(size, 10),
      referer,
      userAgent,
      malformed,
    });
  }
  return data;
};

//                            0             1             2           3         4           5               6                 7
// log_format combined '$remote_addr - $remote_user [$time_local] "$request" $status $body_bytes_sent "$http_referer" "$http_user_agent"';
//                                   |             |             |          |       |                |               |                  |
//                                 ' - '          ' ['         '] "'      '" '     ' '              ' "'           '" "'              '"\n'

export const parseErrorLogs = (lines: string[]): NginxErrorLog[] => {
  const nginxErrorLogRegex =
    /^(?<timestamp>\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}) \[(?<level>\w+)\] (?<pid>\d+)#(?<tid>\d+):(?: \*(?<connectionId>\d+))? (?<message>.*?)(?=(?:, (?:client|server|request|upstream|host|referrer):)|$)(?:, client: (?<clientIp>[^,]+))?(?:, server: (?<serverName>[^,]+))?(?:, request: "(?<request>[^"]+)")?(?:, upstream: "(?<upstream>[^"]+)")?(?:, host: "(?<host>[^"]+)")?(?:, referrer: "(?<referrer>[^"]+)")?$/;

  const parsedLogs: NginxErrorLog[] = [];

  for (const line of lines) {
    const match = nginxErrorLogRegex.exec(line);
    if (!match?.groups) continue;

    const {
      timestamp,
      level,
      pid,
      tid,
      connectionId,
      message,
      clientIp,
      serverName,
      request,
      upstream,
      host,
      referrer,
    } = match.groups;

    // parse timestamp safely
    const tsParts = timestamp.match(
      /^(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2}):(\d{2})$/,
    );
    let time = new Date(NaN);
    if (tsParts) {
      const [, y, mo, d, hh, mm, ss] = tsParts;
      time = new Date(
        Date.UTC(
          parseInt(y, 10),
          parseInt(mo, 10) - 1,
          parseInt(d, 10),
          parseInt(hh, 10),
          parseInt(mm, 10),
          parseInt(ss, 10),
        ),
      );
    }

    parsedLogs.push({
      timestamp,
      time,
      level,
      pid: parseInt(pid, 10),
      tid: parseInt(tid, 10),
      connectionId: connectionId ? parseInt(connectionId, 10) : undefined,
      message: message.trim(),
      clientIp,
      serverName,
      request,
      upstream,
      host,
      referrer,
    });
  }

  return parsedLogs;
};
