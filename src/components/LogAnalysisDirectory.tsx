import type { JSX } from 'react';
import NginxLogAnalysisPage from './LogAnalysis/NginxLogAnalysis/NginxLogAnalysisPage';

const LogAnalysisDirectory = (): JSX.Element => {
  return (
    <div>
      <NginxLogAnalysisPage />
    </div>
  );
};

export default LogAnalysisDirectory;
