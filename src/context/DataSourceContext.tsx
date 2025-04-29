
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

type DataSourceType = 'mock' | 'api';

interface DataSourceContextType {
  dataSource: DataSourceType;
  toggleDataSource: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const DataSourceContext = createContext<DataSourceContextType | undefined>(undefined);

export function DataSourceProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [dataSource, setDataSource] = useState<DataSourceType>('mock');
  const [isLoading, setIsLoading] = useState(false);

  const toggleDataSource = () => {
    const newDataSource = dataSource === 'mock' ? 'api' : 'mock';
    setDataSource(newDataSource);
    toast({
      title: `Data Source Changed`,
      description: `Now using ${newDataSource === 'mock' ? 'mock data' : 'API data'}.`,
    });
  };

  return (
    <DataSourceContext.Provider value={{ dataSource, toggleDataSource, isLoading, setIsLoading }}>
      {children}
    </DataSourceContext.Provider>
  );
}

export function useDataSource() {
  const context = useContext(DataSourceContext);
  if (context === undefined) {
    throw new Error('useDataSource must be used within a DataSourceProvider');
  }
  return context;
}
