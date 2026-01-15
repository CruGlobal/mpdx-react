import React from 'react';
import { Download, PriceCheckSharp } from '@mui/icons-material';
import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { useLandingData } from '../useLandingData';
import { PendingRequestActions } from './components/PendingRequestActions';
import { PendingRequestTimeline } from './components/PendingRequestTimeline';

export const PendingRequestCard: React.FC = () => {
  const { t } = useTranslation();
  const {
    calculation,
    requestedOn,
    processedOn,
    feedback,
    salaryData: { currentGrossSalary },
  } = useLandingData();

  const locale = useLocale();

  const handleDownload = () => {
    // TODO: Download functionality to be done in MPDX-9204
  };

  return (
    <Card sx={{ marginBlock: theme.spacing(3) }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'orange.main' }}>
            <PriceCheckSharp sx={{ color: 'white.main' }} />
          </Avatar>
        }
        title={t('Pending Salary Calculation Form')}
        titleTypographyProps={{ variant: 'h6' }}
        action={
          <IconButton aria-label={t('Download')} onClick={handleDownload}>
            <Download />
          </IconButton>
        }
      />
      <CardContent>
        <Typography
          variant="body1"
          sx={{ fontWeight: 'bold' }}
          data-testid="gross-salary-label"
        >
          {t('Gross Salary Requested')?.toUpperCase()}
        </Typography>
        <Typography
          variant="h3"
          fontWeight="bold"
          sx={{ color: 'primary.main' }}
          data-testid="gross-salary-amount"
        >
          {currencyFormat(currentGrossSalary, 'USD', locale, {
            showTrailingZeros: true,
          })}
        </Typography>
        <PendingRequestTimeline
          calculation={calculation}
          requestedOn={requestedOn}
          processedOn={processedOn}
          feedback={feedback}
        />
      </CardContent>
      <PendingRequestActions calculation={calculation} />
    </Card>
  );
};
