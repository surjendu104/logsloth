import { useParams } from 'react-router-dom';
import Header from './Header';
import NginxLogAnalysisPage from './LogAnalysis/NginxLogAnalysis/NginxLogAnalysisPage';
import GunicornLogAnalysisPage from './LogAnalysis/GunicornLogAnalysis/GunicornLogAnalysisPage';
import PostgresSqlLogAnalysisPage from './LogAnalysis/PostgresSqlLogAnalysis/PostgresSqlLogAnalysisPage';
import ApacheTomCatLogAnalysisPage from './LogAnalysis/ApacheTomCatLogAnalysis/ApacheTomCatLogAnalysisPage';
import UvicornLogAnalysisPage from './LogAnalysis/UvicornLogAnalysis/UvicornLogAnalysisPage';
// import PostgresLogAnalysisPage from "./..."; // future tools

const TOOL_COMPONENTS: Record<string, React.FC> = {
  nginx: NginxLogAnalysisPage,
  postgres: PostgresSqlLogAnalysisPage,
  gunicorn: GunicornLogAnalysisPage,
  uvicorn: UvicornLogAnalysisPage,
  apacheTomcat: ApacheTomCatLogAnalysisPage,
};

const LogAnalysisPage = () => {
  const { toolName } = useParams<{ toolName: string }>();

  const ToolComponent = toolName ? TOOL_COMPONENTS[toolName] : null;

  return (
    <>
      <Header />
      {ToolComponent ? <ToolComponent /> : <p>Tool not supported.</p>}
    </>
  );
};

export default LogAnalysisPage;
