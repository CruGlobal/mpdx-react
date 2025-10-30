import React from 'react';
import PrintIcon from '@mui/icons-material/Print';
import { Button, ButtonGroup, SvgIcon } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface HeaderActionsProps {
  onPrint: (event: React.MouseEvent<unknown>) => void;
}

export const HeaderActions: React.FC<HeaderActionsProps> = ({ onPrint }) => {
  const { t } = useTranslation();

  return (
    <ButtonGroup aria-label={t('Report header button group')}>
      <Button
        startIcon={
          <SvgIcon fontSize="small">
            <PrintIcon titleAccess={t('Print')} />
          </SvgIcon>
        }
        onClick={onPrint}
      >
        {t('Print')}
      </Button>
    </ButtonGroup>
  );
};
