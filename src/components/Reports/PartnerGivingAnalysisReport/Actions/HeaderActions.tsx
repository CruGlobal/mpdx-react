import React from 'react';
import PrintIcon from '@mui/icons-material/Print';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface HeaderActionsProps {
  onPrint: (event: React.MouseEvent<unknown>) => void;
}

export const HeaderActions: React.FC<HeaderActionsProps> = ({ onPrint }) => {
  const { t } = useTranslation();

  return (
    <Button
      startIcon={<PrintIcon titleAccess={t('Print')} />}
      onClick={onPrint}
      variant="outlined"
    >
      {t('Print')}
    </Button>
  );
};
