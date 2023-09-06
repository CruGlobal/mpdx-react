import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface PersPrefFormWrapperProps {
  formAttrs?: { action?: string; method?: string };
  children: React.ReactNode;
}

export const PersPrefFormWrapper: React.FC<PersPrefFormWrapperProps> = ({
  formAttrs = {},
  children,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <form {...formAttrs}>
      {children}
      <Button
        variant="contained"
        color="primary"
        sx={{ marginTop: theme.spacing(2) }}
      >
        {t('Save')}
      </Button>
    </form>
  );
};
