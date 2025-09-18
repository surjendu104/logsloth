import './App.css';
import Header from './components/Header';
import LogAnalysisDirectory from './components/LogAnalysisDirectory';
import { LogContextProvider } from './context/LogContext';

function App() {
  return (
    <>
      <Header />
      <LogContextProvider>
        <LogAnalysisDirectory />
      </LogContextProvider>
    </>
  );
}

export default App;
