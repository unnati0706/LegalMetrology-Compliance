import React, { createContext, useContext } from 'react';

interface QueryClientConfig {
  defaultStaleTime: number;
  retryCount: number;
}

const defaultConfig: QueryClientConfig = {
  defaultStaleTime: 60 * 1000, // 1 minute cache
  retryCount: 2,
};

const QueryContext = createContext<QueryClientConfig>(defaultConfig);

export const QueryClientProvider: React.FC<{ children: React.ReactNode; config?: Partial<QueryClientConfig> }> = ({
  children,
  config
}) => {
  const mergedConfig: QueryClientConfig = {
    ...defaultConfig,
    ...config,
  };

  return (
    <QueryContext.Provider value={mergedConfig}>
      {children}
    </QueryContext.Provider>
  );
};

export const useQueryConfig = () => useContext(QueryContext);
