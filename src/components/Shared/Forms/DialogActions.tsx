import React from 'react';
import { DialogActions, DialogActionsProps } from '@mui/material';

export const DialogActionsLeft: React.FC<DialogActionsProps> = ({
  children,
  ...props
}) => {
  return (
    <DialogActions
      {...props}
      style={{ justifyContent: 'flex-start', marginTop: 10 }}
    >
      {children}
    </DialogActions>
  );
};
