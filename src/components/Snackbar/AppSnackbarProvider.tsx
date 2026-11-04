import React from 'react';
import { Theme, useMediaQuery } from '@mui/material';
import { SnackbarOrigin, SnackbarProvider } from 'notistack';
import { makeStyles } from 'tss-react/mui';

const phoneAnchorOrigin: SnackbarOrigin = {
  vertical: 'top',
  horizontal: 'center',
};
const desktopAnchorOrigin: SnackbarOrigin = {
  vertical: 'bottom',
  horizontal: 'left',
};

const useStyles = makeStyles()(() => ({
  // Keep phone toasts below the notch when the app runs full screen
  topCenter: {
    marginTop: 'env(safe-area-inset-top)',
  },
}));

interface AppSnackbarProviderProps {
  children: React.ReactNode;
}

export const AppSnackbarProvider: React.FC<AppSnackbarProviderProps> = ({
  children,
}) => {
  const { classes } = useStyles();
  // On phones, toasts at the bottom cover dialog action buttons, so show fewer
  // of them at the top instead
  const isPhone = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  return (
    <SnackbarProvider
      maxSnack={isPhone ? 2 : 3}
      anchorOrigin={isPhone ? phoneAnchorOrigin : desktopAnchorOrigin}
      classes={{ containerAnchorOriginTopCenter: classes.topCenter }}
      preventDuplicate
    >
      {children}
    </SnackbarProvider>
  );
};
