import React from 'react';
import { Download } from '@mui/icons-material';
import { Button, ButtonGroup, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { ReportType } from '../Helpers/StaffReportEnum';
import { Transaction } from '../Helpers/filterTransactions';
import { createCsvReport } from './downloadReport';

const StyledButtonGroup = styled(ButtonGroup)(({ theme }) => ({
  borderColor: theme.palette.cruGrayDark.main,
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  color: theme.palette.cruGrayDark.main,
  backgroundColor: 'white',
  fontSize: '0.75rem',
  padding: '4px 8px',
  '& .MuiButton-startIcon': {
    marginRight: '4px',
  },
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
  },
  [theme.breakpoints.up('sm')]: {
    fontSize: '1rem',
    padding: null,
    '& .MuiButton-startIcon': {
      marginRight: null,
    },
  },
}));

const StyledDownloadIcon = styled(Download)(({ theme }) => ({
  fontSize: '1.25rem',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1rem',
  },
}));

export interface DownloadButtonGroupProps {
  transactions: Transaction[];
}

export const DownloadButtonGroup: React.FC<DownloadButtonGroupProps> = ({
  transactions,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const isMobile = useMediaQuery('(max-width:600px)');

  const expenses = transactions.filter((transaction) => transaction.amount < 0);
  const incomes = transactions.filter((transaction) => transaction.amount > 0);

  return (
    <StyledButtonGroup
      variant="contained"
      orientation={isMobile ? 'vertical' : 'horizontal'}
      disabled={!transactions || transactions.length === 0}
    >
      <StyledButton
        startIcon={<StyledDownloadIcon />}
        onClick={() => createCsvReport(ReportType.Income, incomes, t, locale)}
        disabled={incomes.length === 0}
      >
        {t('Income Report')}
      </StyledButton>

      <StyledButton
        startIcon={<StyledDownloadIcon />}
        onClick={() => createCsvReport(ReportType.Expense, expenses, t, locale)}
        disabled={expenses.length === 0}
      >
        {t('Expense Report')}
      </StyledButton>

      <StyledButton
        startIcon={<StyledDownloadIcon />}
        onClick={() =>
          createCsvReport(ReportType.Combined, transactions, t, locale)
        }
        disabled={expenses.length === 0 || incomes.length === 0}
      >
        {t('Combined Report')}
      </StyledButton>
    </StyledButtonGroup>
  );
};
