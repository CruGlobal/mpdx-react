import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface FormWrapperProps {
  onSubmit: () => void;
  isValid: boolean;
  isSubmitting: boolean;
  formAttrs?: { action?: string; method?: string };
  children: React.ReactNode;
}

export const FormWrapper: React.FC<FormWrapperProps> = ({
  onSubmit,
  isValid,
  isSubmitting,
  formAttrs = {},
  children,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // TODO - Add Formik to this.

  return (
    <form {...formAttrs} onSubmit={onSubmit}>
      {children}
      <Button
        variant="contained"
        color="primary"
        sx={{ marginTop: theme.spacing(2) }}
        type="submit"
        disabled={!isValid || isSubmitting}
      >
        {t('Save')}
      </Button>
    </form>
  );
};
