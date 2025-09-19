import { useParams } from 'react-router-dom';
import Header from './Header';
import NginxLogAnalysisPage from './LogAnalysis/NginxLogAnalysis/NginxLogAnalysisPage';
// import PostgresLogAnalysisPage from "./..."; // future tools

const TOOL_COMPONENTS: Record<string, React.FC> = {
  nginx: NginxLogAnalysisPage,
  postgres: NginxLogAnalysisPage,
  gunicorn: NginxLogAnalysisPage,
  uvicorn: NginxLogAnalysisPage,
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
