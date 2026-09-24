import React, { useState } from 'react';
import { AssistantFirstRunDialog } from './AssistantFirstRunDialog';
import { useAssistantContext } from './AssistantProvider';
import {
  AssistantLauncherState,
  useAssistantAccess,
} from './useAssistantVisibility';

export interface AssistantLaunch {
  launcher: AssistantLauncherState;
  launch: (returnFocusTo: HTMLButtonElement | null) => void;
  firstRunDialog: React.ReactElement;
}

// Shared by the top bar button and the orb so both open the Guide the same way
export const useAssistantLaunch = (): AssistantLaunch => {
  const { launcher } = useAssistantAccess();
  const { openAssistant, launcherRef } = useAssistantContext();
  const [firstRunOpen, setFirstRunOpen] = useState(false);

  const launch = (returnFocusTo: HTMLButtonElement | null) => {
    launcherRef.current = returnFocusTo;
    if (launcher === 'enabled') {
      openAssistant();
    } else {
      setFirstRunOpen(true);
    }
  };

  const firstRunDialog = (
    <AssistantFirstRunDialog
      open={firstRunOpen}
      onClose={() => setFirstRunOpen(false)}
      onEnabled={openAssistant}
    />
  );

  return { launcher, launch, firstRunDialog };
};
