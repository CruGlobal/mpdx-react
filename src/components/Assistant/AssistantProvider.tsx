import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

export interface AssistantContextValue {
  open: boolean;
  openAssistant: () => void;
  closeAssistant: () => void;
}

const AssistantContext = createContext<AssistantContextValue | null>(null);

export const useAssistantContext = (): AssistantContextValue => {
  const context = useContext(AssistantContext);
  if (context === null) {
    throw new Error(
      'Could not find AssistantContext. Make sure that your component is inside <AssistantProvider>.',
    );
  }
  return context;
};

interface AssistantProviderProps {
  children: ReactNode;
}

export const AssistantProvider: React.FC<AssistantProviderProps> = ({
  children,
}) => {
  const [open, setOpen] = useState(false);
  const openAssistant = useCallback(() => setOpen(true), []);
  const closeAssistant = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ open, openAssistant, closeAssistant }),
    [open, openAssistant, closeAssistant],
  );

  return (
    <AssistantContext.Provider value={value}>
      {children}
    </AssistantContext.Provider>
  );
};
