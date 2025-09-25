export type AccessLog = {
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

export type ServerLog = {
  timestamp: string;
  time: Date;
  level: string;
  thread?: string;
  logger?: string;
  message: string;
  // stack contains any following lines that belong to this log e.g. exception class, "at ..." lines, Caused by, etc.
  stack?: string[];
  raw?: string; // optional: original line (first line)
}

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

export const parseLogLines = (lines: string[]): AccessLog[] | [] => {
  const combinedPattern =
    /(?<ip>\S+) - (?<user>\S+) \[(?<time>[^\]]+)\] "(?<request>[^"]*)" (?<status>\d+) (?<size>\d+) "(?<referer>[^"]*)" "(?<userAgent>[^"]*)"/;
  const data: AccessLog[] = [];
  for (const line of lines) {
    const match = combinedPattern.exec(line);
    if (!match?.groups) {
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

export const parseServerLogs = (lines: string[]): ServerLog[] => {
  // Matches: 2023-03-06 01:37:51,757 WARN  [thread] com.foo.Bar.method (optional " - ") message...
  const tomcatLogRegex =
    /^(?<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3})\s+(?<level>[A-Z]+)\s+\[(?<thread>[^\]]+)\]\s+(?<logger>[^\s]+)(?:\s+-\s+)?(?<message>.*)$/;

  const parsedLogs: ServerLog[] = [];

  for (const line of lines) {
    // ignore empty lines
    if (!line || /^\s*$/.test(line)) continue;

    const match = tomcatLogRegex.exec(line);

    if (match?.groups) {
      const { timestamp, level, thread, logger, message } = match.groups;

      // Parse timestamp: "YYYY-MM-DD HH:mm:ss,SSS"
      const tsParts = timestamp.match(
        /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2}),(\d{3})$/
      );
      let time = new Date(NaN);
      if (tsParts) {
        const [, y, mo, d, hh, mm, ss, ms] = tsParts;
        time = new Date(
          Date.UTC(
            parseInt(y, 10),
            parseInt(mo, 10) - 1,
            parseInt(d, 10),
            parseInt(hh, 10),
            parseInt(mm, 10),
            parseInt(ss, 10),
            parseInt(ms, 10)
          )
        );
      }

      parsedLogs.push({
        timestamp,
        time,
        level,
        thread,
        logger,
        message: message.trim(),
        raw: line,
      });
    } else {
      // If this line does NOT match the timestamped format, treat it as continuation/stack trace
      // Attach to last parsed log entry, if any.
      // We determine "new entry" lines by checking for a leading timestamp; if not present, it's continuation.
      const looksLikeNewEntry = /^\d{4}-\d{2}-\d{2} /.test(line);
      if (!looksLikeNewEntry && parsedLogs.length > 0) {
        const last = parsedLogs[parsedLogs.length - 1];
        if (!last.stack) last.stack = [];
        last.stack.push(line.trimEnd());
      } else {
        // Line looks like a new entry but didn't match (maybe different format) — skip or store as raw orphan entry.
        // For now we skip it to avoid noisy false matches; change behavior here if you want to capture unknown formats.
        continue;
      }
    }
  }

  return parsedLogs;
};
