
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

type DataSourceType = 'mock' | 'api';

interface DataSourceContextType {
  dataSource: DataSourceType;
  toggleDataSource: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const DataSourceContext = createContext<DataSourceContextType | undefined>(undefined);

// Use localStorage to persist the data source preference
const getInitialDataSource = (): DataSourceType => {
  const savedDataSource = localStorage.getItem('dataSource');
  return (savedDataSource === 'api' || savedDataSource === 'mock') 
    ? savedDataSource 
    : 'mock';
};

export function DataSourceProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [dataSource, setDataSource] = useState<DataSourceType>(getInitialDataSource());
  const [isLoading, setIsLoading] = useState(false);

  const toggleDataSource = useCallback(() => {
    const newDataSource = dataSource === 'mock' ? 'api' : 'mock';
    setDataSource(newDataSource);
    // Save to localStorage
    localStorage.setItem('dataSource', newDataSource);
    toast({
      title: `Data Source Changed`,
      description: `Now using ${newDataSource === 'mock' ? 'mock data' : 'API data'}.`,
    });
  }, [dataSource, toast]);

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
