import {
  createContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';

interface LogContextType {
  accessLogSearchQuery: string;
  setAccessLogSearchQuery: Dispatch<SetStateAction<string>>;
}

const LogContext = createContext<LogContextType | undefined>(undefined);

const LogContextProvider = ({ children }: { children: ReactNode }) => {
  const [accessLogSearchQuery, setAccessLogSearchQuery] = useState('');

  return (
    <LogContext.Provider
      value={{ accessLogSearchQuery, setAccessLogSearchQuery }}
    >
      {children}
    </LogContext.Provider>
  );
};

export { LogContext, LogContextProvider };
