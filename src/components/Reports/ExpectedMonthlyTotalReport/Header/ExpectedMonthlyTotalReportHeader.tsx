import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import theme from '../../../../theme';

interface Props {
  empty: boolean;
  totalDonations: number;
  totalLikely: number;
  totalUnlikely: number;
  total: number;
  currency: string;
}

const ProgressBarWrapper = styled(Box)(({ theme }) => ({
  width: 450,
  display: 'flex',
  flexDirection: 'row',
  height: 35,
  marginRight: theme.spacing(0.5),
  border: '2px solid inherit',
  borderRadius: 30,
  overflow: 'hidden',
}));

const ProgressBarSection = styled(Box)(({}) => ({
  height: '100%',
  textAlign: 'center',
  color: 'white',
  flexGrow: 1,
}));

export const ExpectedMonthlyTotalReportHeader: React.FC<Props> = ({
  empty,
  totalDonations,
  totalLikely,
  totalUnlikely,
  total,
  currency,
}) => {
  const { t } = useTranslation();

  const calculateWidth = (amount: number) => {
    return (amount / total) * 100;
  };

  return !empty ? (
    <ProgressBarWrapper data-testid="progressBarWrapper">
      <Tooltip
        title={
          <Typography>{Math.round(totalDonations) + ' ' + currency}</Typography>
        }
        arrow
      >
        <ProgressBarSection
          style={{
            backgroundColor: theme.palette.progressBarYellow.main,
            width: `${calculateWidth(totalDonations)}%`,
          }}
        >
          <Typography style={{ marginTop: 4 }}>{t('Received')}</Typography>
        </ProgressBarSection>
      </Tooltip>
      <Tooltip
        title={
          <Typography>{Math.round(totalLikely) + ' ' + currency}</Typography>
        }
        arrow
      >
        <ProgressBarSection
          style={{
            backgroundColor: theme.palette.progressBarOrange.main,
            width: `${calculateWidth(totalLikely)}%`,
          }}
        >
          <Typography style={{ marginTop: 4 }}>{t('Likely')}</Typography>
        </ProgressBarSection>
      </Tooltip>
      <Tooltip
        title={
          <Typography>{Math.round(totalUnlikely) + ' ' + currency}</Typography>
        }
        arrow
      >
        <ProgressBarSection
          style={{
            backgroundColor: theme.palette.progressBarGray.main,
            width: `${calculateWidth(totalUnlikely)}%`,
          }}
        >
          <Typography style={{ marginTop: 4 }}>{t('Possible')}</Typography>
        </ProgressBarSection>
      </Tooltip>
    </ProgressBarWrapper>
  ) : null;
};
