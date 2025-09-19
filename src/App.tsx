import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.css';
// import Header from './components/Header';
import LogAnalysisDirectory from './components/LogAnalysisDirectory';
import { LogContextProvider } from './context/LogContext';
import LogAnalysisPage from './components/LogAnalysisPage';

function App() {
  return (
    <>
      <LogContextProvider>
        <RouterProvider router={router} />
      </LogContextProvider>
    </>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <LogAnalysisDirectory />,
  },
  {
    path: '/log/:toolName',
    element: <LogAnalysisPage />,
  },
]);

export default App;
