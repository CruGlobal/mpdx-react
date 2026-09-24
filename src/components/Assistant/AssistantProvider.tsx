import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import {
  AssistantAction,
  AssistantState,
  assistantReducer,
  initialAssistantState,
} from './assistantReducer';
import { useAssistantVisibility } from './useAssistantVisibility';

export interface AssistantContextValue extends AssistantState {
  open: boolean;
  openAssistant: () => void;
  closeAssistant: () => void;
  // Whichever launcher opened the Guide, so closing it returns focus there
  launcherRef: React.MutableRefObject<HTMLButtonElement | null>;
  streaming: boolean;
  dispatch: React.Dispatch<AssistantAction>;
  beginStream: (controller: AbortController) => void;
  endStream: () => void;
  stopStream: () => void;
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

// Holds the transcript outside the drawer because MUI Drawer unmounts its children on close
export const AssistantProvider: React.FC<AssistantProviderProps> = ({
  children,
}) => {
  const [open, setOpen] = useState(false);
  const openAssistant = useCallback(() => setOpen(true), []);
  const closeAssistant = useCallback(() => setOpen(false), []);
  const launcherRef = useRef<HTMLButtonElement | null>(null);

  const [state, dispatch] = useReducer(assistantReducer, initialAssistantState);
  const [streaming, setStreaming] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  const beginStream = useCallback((controller: AbortController) => {
    controllerRef.current = controller;
    setStreaming(true);
  }, []);
  const endStream = useCallback(() => {
    controllerRef.current = null;
    setStreaming(false);
  }, []);
  const stopStream = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  const visible = useAssistantVisibility();
  useEffect(() => {
    if (!visible) {
      stopStream();
    }
  }, [visible, stopStream]);

  const value = useMemo(
    () => ({
      ...state,
      open,
      openAssistant,
      closeAssistant,
      launcherRef,
      streaming,
      dispatch,
      beginStream,
      endStream,
      stopStream,
    }),
    [
      state,
      open,
      openAssistant,
      closeAssistant,
      streaming,
      beginStream,
      endStream,
      stopStream,
    ],
  );

  return (
    <AssistantContext.Provider value={value}>
      {children}
    </AssistantContext.Provider>
  );
};
