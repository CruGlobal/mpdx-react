import React from 'react';
import { Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

interface FormWrapperProps {
  onSubmit: () => void;
  isValid: boolean;
  isSubmitting: boolean;
  children: React.ReactNode;
  buttonText?: string;
}

export const FormWrapper: React.FC<FormWrapperProps> = ({
  onSubmit,
  isValid,
  isSubmitting,
  children,
  buttonText,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <form onSubmit={onSubmit}>
      {children}
      <Button
        variant="contained"
        color="primary"
        sx={{ marginTop: theme.spacing(2) }}
        type="submit"
        disabled={!isValid || isSubmitting}
      >
        {buttonText || t('Save')}
      </Button>
    </form>
  );
};
