import { Dispatch, SetStateAction, useState } from 'react';
import { Theme, useMediaQuery } from '@mui/material';
import { useUserPreference } from './useUserPreference';

/**
 * Saves a filter panel's open state as a user preference, except on small screens. There the panel
 * covers most of the page, so it starts closed and opening it doesn't change the saved preference
 * that larger screens use.
 */
export const useFilterPanelOpen = (
  key: string,
): [boolean, Dispatch<SetStateAction<boolean>>] => {
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('md'),
  );
  const [savedOpen, setSavedOpen] = useUserPreference({
    key,
    defaultValue: false,
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  return isMobile ? [mobileOpen, setMobileOpen] : [savedOpen, setSavedOpen];
};
