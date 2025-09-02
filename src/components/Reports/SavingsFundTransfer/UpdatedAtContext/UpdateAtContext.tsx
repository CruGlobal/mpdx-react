import React, { useMemo, useState } from 'react';

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

export const UpdatedAtProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const value = useMemo(
    () => ({ updatedAt, setUpdatedAt: () => setUpdatedAt(new Date()) }),
    [updatedAt],
  );

  return (
    <UpdatedAtContext.Provider value={value}>
      {children}
    </UpdatedAtContext.Provider>
  );
};
