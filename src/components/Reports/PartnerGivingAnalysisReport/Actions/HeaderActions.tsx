import React from 'react';
import PrintIcon from '@mui/icons-material/Print';
import { Button, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface HeaderActionsProps {
  onPrint: () => void;
  loading?: boolean;
}

export const HeaderActions: React.FC<HeaderActionsProps> = ({
  onPrint,
  loading = false,
}) => {
  const { t } = useTranslation();

  return (
    <Button
      startIcon={loading ? <CircularProgress size={20} /> : <PrintIcon />}
      onClick={onPrint}
      variant="outlined"
      disabled={loading}
    >
      {loading ? t('Loading...') : t('Print')}
    </Button>
  );
};
