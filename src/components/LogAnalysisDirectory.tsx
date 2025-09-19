import type { JSX } from 'react';
// import NginxLogAnalysisPage from './LogAnalysis/NginxLogAnalysis/NginxLogAnalysisPage';
import Header from './Header';
import { Link } from 'react-router-dom';

const LogAnalysisDirectory = (): JSX.Element => {
  return (
    <>
      <Header />
      <Link to={'/log/nginx'}>Nginx Log Analysis</Link>
    </>
  );
};

export default LogAnalysisDirectory;
