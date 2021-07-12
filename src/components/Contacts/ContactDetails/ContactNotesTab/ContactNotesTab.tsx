import React from 'react';
import { TextField } from '@material-ui/core';

export const ContactNotesTab: React.FC = () => {
  return (
    <TextField
      fullWidth
      multiline
      placeholder="Add contact notes"
      rows="10"
      variant="outlined"
    />
  );
};
