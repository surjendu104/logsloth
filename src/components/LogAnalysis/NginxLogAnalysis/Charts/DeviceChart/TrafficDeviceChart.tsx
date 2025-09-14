import { useState } from 'react';

import type { NginxAccessLog } from '../../parser';
import Device from './Device';
import Client from './Client';
import OS from './OS';
import classes from './TrafficDeviceChart.module.css';

type PiChartCateGory = 'device' | 'client' | 'os';

const TrafficDeviceChart = ({ logs }: { logs: NginxAccessLog[] }) => {
  const [category, setCategory] = useState<PiChartCateGory>('device');

  const handleChangeCategory = (newCategory: PiChartCateGory) => {
    if (category !== newCategory) {
      setCategory(newCategory);
    }
  };

  return (
    <div className={classes.mainCt}>
      <div className={classes.deviceTab}>
        <div className={classes.deviceTabInner}>
          <span
            className={`${classes.device} ${category === 'device' ? classes.activeDeviceTab : ''}`}
            onClick={() => handleChangeCategory('device')}
          >
            Device
          </span>
          <span
            className={`${classes.device} ${category === 'client' ? classes.activeDeviceTab : ''}`}
            onClick={() => handleChangeCategory('client')}
          >
            Client
          </span>
          <span
            className={`${classes.device} ${category === 'os' ? classes.activeDeviceTab : ''}`}
            onClick={() => handleChangeCategory('os')}
          >
            OS
          </span>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        {category === 'device' && <Device logs={logs} />}
        {category === 'client' && <Client logs={logs} />}
        {category === 'os' && <OS logs={logs} />}
      </div>
    </div>
  );
};

// const Client = ({logs}: {logs: NginxAccessLog}) => {
//   return (<div>Client</div>)
// }

// const OS = ({logs}: {logs: NginxAccessLog}) => {
//   return (<div>Client</div>)
// }

export default TrafficDeviceChart;
