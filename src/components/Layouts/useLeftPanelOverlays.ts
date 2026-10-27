import { useEffect } from 'react';
import { Theme, useMediaQuery } from '@mui/material';

export const leftPanelOverlayBreakpoint = 'md';

/**
 * Whether SidePanelsLayout's left panel covers the main content instead of sitting beside it.
 * Use this instead of repeating the breakpoint so it stays in sync with the layout.
 */
export const useLeftPanelOverlays = (): boolean =>
  useMediaQuery((theme: Theme) =>
    theme.breakpoints.down(leftPanelOverlayBreakpoint),
  );

/**
 * For a left panel that starts open, closes it when it would cover the content. It runs in an
 * effect, after hydration, because the server can't know the screen size.
 */
export const useCloseLeftPanelWhenOverlaid = (close: () => void): void => {
  const overlays = useLeftPanelOverlays();

  useEffect(() => {
    if (overlays) {
      close();
    }
    // Only when the screen size changes, so the user can still open the panel
  }, [overlays]);
};
