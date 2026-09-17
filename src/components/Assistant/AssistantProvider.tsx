import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

export interface AssistantContext {
  open: boolean;
  openAssistant: () => void;
  closeAssistant: () => void;
}

const AssistantContext = createContext<AssistantContext>({
  open: false,
  openAssistant: () => undefined,
  closeAssistant: () => undefined,
});

export const useAssistantContext = (): AssistantContext =>
  useContext(AssistantContext);

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
