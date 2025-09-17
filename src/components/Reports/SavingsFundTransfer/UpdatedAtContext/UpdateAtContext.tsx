import React, { useCallback, useMemo, useState } from 'react';

export type UpdatedAtType = {
  updatedAt: Date | null;
  setUpdatedAt: () => void;
};

export const UpdatedAtContext = React.createContext<UpdatedAtType | null>(null);

export const useUpdatedAtContext = () => {
  const context = React.useContext(UpdatedAtContext);
  if (!context) {
    throw new Error(
      'Could not find UpdatedAtContext. Make sure that your component is inside <UpdatedAtProvider>',
    );
  }
  return context;
};

export const UpdatedAtProvider: React.FC<
  React.PropsWithChildren<{ storageKey?: string }>
> = ({ children, storageKey = 'fundsUpdatedAt' }) => {
  const [updatedAt, _setUpdatedAt] = useState<Date | null>(() => {
    const stored = localStorage.getItem(storageKey);
    return stored ? new Date(stored) : null;
  });

  const setUpdatedAt = useCallback(() => {
    const date = new Date();
    _setUpdatedAt(date);
    localStorage.setItem(storageKey, date.toISOString());
  }, [storageKey]);

  const value = useMemo(
    () => ({ updatedAt, setUpdatedAt }),
    [updatedAt, setUpdatedAt],
  );

  return (
    <UpdatedAtContext.Provider value={value}>
      {children}
    </UpdatedAtContext.Provider>
  );
};
