import React from 'react';
import { Download } from '@mui/icons-material';
import { Button, ButtonGroup, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { ReportType } from '../Helpers/StaffReportEnum';
import { Transaction } from '../StaffExpenseReport';
import { downloadCsv } from './downloadReport';

const StyledButtonGroup = styled(ButtonGroup)(({ theme }) => ({
  backgroundColor: 'white',
  borderColor: 'black',
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  color: 'black',
  borderColor: 'black',
  fontSize: '0.75rem',
  padding: '4px 8px',
  '& .MuiButton-startIcon': {
    marginRight: '4px',
  },
  '&:hover': {
    backgroundColor: '#f5f5f5',
    borderColor: 'black',
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
  enqueueSnackbar: (message: string, options?: object) => void;
}

export const DownloadButtonGroup: React.FC<DownloadButtonGroupProps> = ({
  transactions,
  enqueueSnackbar,
}) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width:600px)');

  const expenses = transactions.filter((transaction) => transaction.total < 0);
  const incomes = transactions.filter((transaction) => transaction.total > 0);

  return transactions.length === 0 ? null : (
    <StyledButtonGroup
      variant="outlined"
      orientation={isMobile ? 'vertical' : 'horizontal'}
    >
      {incomes.length > 0 ? (
        <StyledButton
          startIcon={<StyledDownloadIcon />}
          onClick={() =>
            downloadCsv(ReportType.Income, enqueueSnackbar, transactions, t)
          }
        >
          {t('Income Report')}
        </StyledButton>
      ) : null}
      {expenses.length > 0 ? (
        <StyledButton
          startIcon={<StyledDownloadIcon />}
          onClick={() =>
            downloadCsv(ReportType.Expense, enqueueSnackbar, transactions, t)
          }
        >
          {t('Expense Report')}
        </StyledButton>
      ) : null}
      {expenses.length > 0 && incomes.length ? (
        <StyledButton
          startIcon={<StyledDownloadIcon />}
          onClick={() =>
            downloadCsv(ReportType.Combined, enqueueSnackbar, transactions, t)
          }
        >
          {t('Combined Report')}
        </StyledButton>
      ) : null}
    </StyledButtonGroup>
  );
};
