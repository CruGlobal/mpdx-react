import React from 'react';
import { Download } from '@mui/icons-material';
import { Button, ButtonGroup } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { ReportType } from '../Helpers/StaffReportEnum';
import { Transaction } from '../StaffExpenseReport';
import { downloadCsv } from './downloadReport';

export interface DownloadButtonGroupProps {
  transactions: Transaction[];
  enqueueSnackbar: (message: string, options?: object) => void;
}

export const DownloadButtonGroup: React.FC<DownloadButtonGroupProps> = ({
  transactions,
  enqueueSnackbar,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const buttonSx = {
    color: 'black',
    borderColor: 'black',
    fontSize: isMobile ? '0.75rem' : '1rem',
    padding: isMobile ? '4px 8px' : undefined,
    '& .MuiButton-startIcon': {
      marginRight: isMobile ? '4px' : undefined,
    },
    '&:hover': {
      backgroundColor: '#f5f5f5',
      borderColor: 'black',
    },
  };

  const iconFontSize = isMobile ? 'small' : 'medium';

  return (
    <ButtonGroup
      variant="outlined"
      orientation={isMobile ? 'vertical' : 'horizontal'}
      sx={{
        backgroundColor: 'white',
        borderColor: 'black',
        ...(isMobile && { width: '100%' }),
      }}
    >
      <Button
        startIcon={<Download fontSize={iconFontSize} />}
        sx={buttonSx}
        onClick={() =>
          downloadCsv(ReportType.Income, enqueueSnackbar, transactions, locale)
        }
      >
        {t('Income Report')}
      </Button>
      <Button
        startIcon={<Download fontSize={iconFontSize} />}
        sx={buttonSx}
        onClick={() =>
          downloadCsv(ReportType.Expense, enqueueSnackbar, transactions)
        }
      >
        {t('Expense Report')}
      </Button>
      <Button
        startIcon={<Download fontSize={iconFontSize} />}
        sx={buttonSx}
        onClick={() =>
          downloadCsv(ReportType.Combined, enqueueSnackbar, transactions)
        }
      >
        {t('Combined Report')}
      </Button>
    </ButtonGroup>
  );
};
