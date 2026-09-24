import { useCallback, useEffect, useState } from 'react';
import { useAssistantContext } from './AssistantProvider';

const nudgeShownKey = 'mpdx-guide-nudge-shown';
const guideOpenedKey = 'mpdx-guide-opened';

// Storage can throw in private windows or when site data is blocked, so it is only a hint
const readFlag = (storage: () => Storage, key: string): boolean => {
  try {
    return storage().getItem(key) === 'true';
  } catch {
    return false;
  }
};

const writeFlag = (storage: () => Storage, key: string): void => {
  try {
    storage().setItem(key, 'true');
  } catch {
    // The in-memory state still hides the nudge for this page
  }
};

const session = () => window.sessionStorage;
const local = () => window.localStorage;

export interface GuideNudge {
  show: boolean;
  dismiss: () => void;
}

// Opening the Guide retires the nudge for good, so it can never sit beside a kill switch notice
export const useGuideNudge = (eligible: boolean): GuideNudge => {
  const { open } = useAssistantContext();
  const [show, setShow] = useState(false);
  const [retired, setRetired] = useState(false);

  useEffect(() => {
    if (
      !eligible ||
      retired ||
      readFlag(local, guideOpenedKey) ||
      readFlag(session, nudgeShownKey)
    ) {
      return;
    }
    writeFlag(session, nudgeShownKey);
    setShow(true);
  }, [eligible, retired]);

  useEffect(() => {
    if (open) {
      writeFlag(local, guideOpenedKey);
      setRetired(true);
    }
  }, [open]);

  const dismiss = useCallback(() => setRetired(true), []);

  return { show: show && eligible && !retired, dismiss };
};
