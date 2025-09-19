import { useContext } from 'react';
import { LogContext } from '../context/LogContext';

export const useLogContext = () => {
  const context = useContext(LogContext);
  if (!context) {
    throw new Error('useLogContext must be used within a LogContextProvider');
  }
  return context;
};
