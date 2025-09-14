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
