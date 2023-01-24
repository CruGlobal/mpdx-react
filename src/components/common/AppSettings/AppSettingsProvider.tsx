import React, { createContext, useContext } from 'react';

export type AppSettingsType = {
  appName?: string;
};

export const AppSettingsContext = createContext<AppSettingsType>({});

export const useAppSettingsContext = (): AppSettingsType =>
  useContext(AppSettingsContext);

interface Props {
  children?: React.ReactNode;
}
export const AppSettingsProvider: React.FC<Props> = ({ children }) => {
  const value: AppSettingsType = {
    appName: process.env.APP_NAME,
  };

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
};
