import React from 'react';
import PrintIcon from '@mui/icons-material/Print';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const HeaderActions: React.FC = () => {
  const { t } = useTranslation();

  const onPrint = () => {
    window.print();
  };

  return (
    <Button startIcon={<PrintIcon />} onClick={onPrint} variant="outlined">
      {t('Print')}
    </Button>
  );
};
