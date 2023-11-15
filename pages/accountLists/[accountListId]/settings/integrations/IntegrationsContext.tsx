import React from 'react';

export type IntegrationsContextType = {
  apiToken: string;
};
export const IntegrationsContext =
  React.createContext<IntegrationsContextType | null>(null);

interface IntegrationsContextProviderProps {
  children: React.ReactNode;
  apiToken: string;
}
export const IntegrationsContextProvider: React.FC<
  IntegrationsContextProviderProps
> = ({ children, apiToken }) => {
  return (
    <IntegrationsContext.Provider value={{ apiToken }}>
      {children}
    </IntegrationsContext.Provider>
  );
};
