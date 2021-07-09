import React from 'react';
import { Box, Typography, styled, Divider, Tooltip } from '@material-ui/core';
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

const HeaderWrapper = styled(Box)(({}) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  padding: 24,
}));

const ProgressBarWrapper = styled(Box)(({}) => ({
  width: 450,
  display: 'flex',
  flexDirection: 'row',
  height: 35,
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

  return (
    <Box>
      <HeaderWrapper>
        <Typography variant="h4">{t('Expected Monthly Total')}</Typography>
        {!empty ? (
          <ProgressBarWrapper>
            <Tooltip
              title={
                <Typography>
                  {Math.round(totalDonations) + ' ' + currency}
                </Typography>
              }
              arrow
            >
              <ProgressBarSection
                style={{
                  backgroundColor: theme.palette.progressBarYellow.main,
                  width: `${calculateWidth(totalDonations)}%`,
                }}
              >
                <Typography style={{ marginTop: 4 }}>
                  {t('Received')}
                </Typography>
              </ProgressBarSection>
            </Tooltip>
            <Tooltip
              title={
                <Typography>
                  {Math.round(totalLikely) + ' ' + currency}
                </Typography>
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
                <Typography>
                  {Math.round(totalUnlikely) + ' ' + currency}
                </Typography>
              }
              arrow
            >
              <ProgressBarSection
                style={{
                  backgroundColor: theme.palette.progressBarGray.main,
                  width: `${calculateWidth(totalUnlikely)}%`,
                }}
              >
                <Typography style={{ marginTop: 4 }}>
                  {t('Possible')}
                </Typography>
              </ProgressBarSection>
            </Tooltip>
          </ProgressBarWrapper>
        ) : null}
      </HeaderWrapper>
      <Divider style={{ marginBottom: 8 }} variant="middle"></Divider>
    </Box>
  );
};
