import type { JSX } from 'react';
// import NginxLogAnalysisPage from './LogAnalysis/NginxLogAnalysis/NginxLogAnalysisPage';
import Header from './Header';
import { Link } from 'react-router-dom';
import classes from './LogAnalysisDirectory.module.css';
import {
  SiApachetomcat,
  SiGunicorn,
  SiNginx,
  SiPostgresql,
} from 'react-icons/si';
import { GiUnicorn } from 'react-icons/gi';

type Tool = {
  name: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const TOOLS: Tool[] = [
  {
    name: 'Nginx',
    path: '/log/nginx',
    icon: SiNginx,
  },
  {
    name: 'Postgres',
    path: '/log/postgres',
    icon: SiPostgresql,
  },
  {
    name: 'Gunicorn',
    path: '/log/gunicorn',
    icon: GiUnicorn,
  },
  {
    name: 'uvicorn',
    path: '/log/uvicorn',
    icon: SiGunicorn,
  },
  {
    name: 'Apache Tomcat',
    path: '/log/apache-server',
    icon: SiApachetomcat,
  },
];

const LogAnalysisDirectory = (): JSX.Element => {
  return (
    <>
      <Header />
      <div className={classes.mainCt}>
        {TOOLS.map((tool: Tool, index: number) => (
          <Link key={index} className={classes.toolCt} to={tool.path}>
            <tool.icon size={25} className={classes.toolImg} />
            <span className={classes.toolName}>{tool.name}</span>
          </Link>
        ))}
      </div>
    </>
  );
};

export default LogAnalysisDirectory;
