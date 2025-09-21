import type { JSX } from 'react';
// import NginxLogAnalysisPage from './LogAnalysis/NginxLogAnalysis/NginxLogAnalysisPage';
import Header from './Header';
import { Link } from 'react-router-dom';
import classes from './LogAnalysisDirectory.module.css';
import {
  SiApachetomcat,
  SiGunicorn,
  SiMysql,
  SiNginx,
  SiPostgresql,
  SiRedis,
} from 'react-icons/si';
import { GiUnicorn } from 'react-icons/gi';

type Tool = {
  name: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  section: string;
};

const TOOLS: Tool[] = [
  {
    name: 'Nginx',
    path: '/log/nginx',
    icon: SiNginx,
    section: 'server',
  },
  {
    name: 'Apache Tomcat',
    path: '/log/apacheTomcat',
    icon: SiApachetomcat,
    section: 'server',
  },
  {
    name: 'Postgres',
    path: '/log/postgres',
    icon: SiPostgresql,
    section: 'database',
  },
  {
    name: 'MySQL',
    path: '/log/mysql',
    icon: SiMysql,
    section: 'database',
  },
  {
    name: 'Redis',
    path: '/log/redis',
    icon: SiRedis,
    section: 'database',
  },
  {
    name: 'Gunicorn',
    path: '/log/gunicorn',
    icon: GiUnicorn,
    section: 'workers',
  },
  {
    name: 'uvicorn',
    path: '/log/uvicorn',
    icon: SiGunicorn,
    section: 'workers',
  },
];

// Helper: group tools by section
const groupBySection = (tools: Tool[]) => {
  return tools.reduce<Record<string, Tool[]>>((acc, tool) => {
    acc[tool.section] = acc[tool.section] || [];
    acc[tool.section].push(tool);
    return acc;
  }, {});
};

const LogAnalysisDirectory = (): JSX.Element => {
  const grouped = groupBySection(TOOLS);

  return (
    <>
      <Header />
      <div className={classes.mainCt}>
        {Object.entries(grouped).map(([section, tools]) => (
          <div key={section} className={classes.sectionCt}>
            <div className={classes.sectionHead}>
              <span
                className={classes.sectionTitle}
              >{`${section[0].toUpperCase() + section.slice(1)}`}</span>
              <hr className={classes.sectionHr} />
            </div>
            <div className={classes.toolsGrid}>
              {tools.map((tool, index) => (
                <Link key={index} className={classes.toolCt} to={tool.path}>
                  <tool.icon size={25} className={classes.toolImg} />
                  <span className={classes.toolName}>{tool.name}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default LogAnalysisDirectory;
