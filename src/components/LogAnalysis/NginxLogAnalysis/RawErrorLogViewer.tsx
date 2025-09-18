import { useMemo, useState } from "react"
import type { NginxErrorLog } from "./parser"
import classes from './RawErrorLogViewer.module.css'
import { LuSearch } from "react-icons/lu";
import { Virtuoso } from "react-virtuoso";
import dropdownIcon from '../../../assets/select-element-dropdown-icon.svg';

const RawErrorLogViewer = ({logs}: {logs: NginxErrorLog[]}) => {
  const [searchInput, setSearchInput] = useState<string>('');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  console.log(JSON.stringify(logs));

  const toggleExpand = (index: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const filteredLogs = useMemo(() => {
      if (!searchInput.trim()) return logs;
      const lower = searchInput.toLowerCase();
      return logs.filter((log) =>
        JSON.stringify(log).includes(lower),
      );
    }, [logs, searchInput]);

  return (
    <div className={classes.mainCt}>
      <div className={classes.head}>
        <div className={classes.name}>Error Log Viewer</div>
        <div className={classes.searchCt}>
          <LuSearch size={20} />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search logs..."
          />
        </div>
      </div>

      <div className={classes.logViewerCt}>
        <Virtuoso
          className={classes.virtuosoCt}
          totalCount={filteredLogs.length}
          itemContent={(index) => {
            const log = filteredLogs[filteredLogs.length - 1 - index]; // newest first
            const isExpanded = expanded.has(index);

            return (
              <div
                className={`${classes.logCt} ${isExpanded ? classes.logExpanded : ''}`}
                onClick={() => toggleExpand(index)}
              >
                <div className={classes.rawLog}>
                  <img
                    className={`${classes.logDropdownImg} ${isExpanded ? classes.open : ''}`}
                    src={dropdownIcon}
                    alt="toggle"
                  />
                  <div>{JSON.stringify(log)}</div>
                </div>
                {isExpanded && (
                  <pre className={classes.logJsonCt} onClick={(e) => e.stopPropagation()}>
                    {JSON.stringify(log, null, 2)}
                  </pre>
                )}
              </div>
            );
          }}
        />
      </div>
    </div>
  )
}

export default RawErrorLogViewer
