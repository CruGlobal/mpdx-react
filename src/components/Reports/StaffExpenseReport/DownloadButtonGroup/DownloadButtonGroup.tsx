import React from 'react';
import { Download } from '@mui/icons-material';
import { Button, ButtonGroup } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Transaction } from '../StaffExpenseReport';
import { downloadCsv } from '../downloadReport';

export interface DownloadButtonGroupProps {
  transactions: Transaction[];
}

export const DownloadButtonGroup: React.FC<DownloadButtonGroupProps> = ({
  transactions,
}) => {
  const { t } = useTranslation();

  return (
    <ButtonGroup
      variant="outlined"
      sx={{ backgroundColor: 'white', borderColor: 'black' }}
    >
      <Button
        startIcon={<Download />}
        sx={{
          color: 'black',
          borderColor: 'black',
          '&:hover': {
            backgroundColor: '#f5f5f5',
            borderColor: 'black',
          },
        }}
        onClick={() => downloadCsv(transactions, 'income')}
      >
        {t('Income Report')}
      </Button>
      <Button
        startIcon={<Download />}
        sx={{
          color: 'black',
          borderColor: 'black',
          '&:hover': {
            backgroundColor: '#f5f5f5',
            borderColor: 'black',
          },
        }}
        onClick={() => downloadCsv(transactions, 'expense')}
      >
        {t('Expense Report')}
      </Button>
      <Button
        startIcon={<Download />}
        sx={{
          color: 'black',
          borderColor: 'black',
          '&:hover': {
            backgroundColor: '#f5f5f5',
            borderColor: 'black',
          },
        }}
        onClick={() => downloadCsv(transactions, 'combined')}
      >
        {t('Combined Report')}
      </Button>
    </ButtonGroup>
  );
};
