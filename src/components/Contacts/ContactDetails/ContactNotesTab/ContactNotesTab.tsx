import React from 'react';
import { TextField } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

export const ContactNotesTab: React.FC = () => {
  const { t } = useTranslation();

  return (
    <TextField
      fullWidth
      multiline
      placeholder={t('Add contact notes')}
      rows="10"
      variant="outlined"
    />
  );
};
