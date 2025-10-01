import React, { useCallback, useMemo, useState } from 'react';
import { DateTime } from 'luxon';

export type UpdatedAtType = {
  updatedAt: DateTime | null;
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
  const [updatedAt, _setUpdatedAt] = useState<DateTime | null>(() => {
    const stored = localStorage.getItem(storageKey);
    return stored ? DateTime.fromISO(stored) : null;
  });

  const setUpdatedAt = useCallback(() => {
    const date = DateTime.now();
    _setUpdatedAt(date);
    localStorage.setItem(storageKey, date.toISO());
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
