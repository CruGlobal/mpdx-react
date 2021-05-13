/* eslint-disable eqeqeq */
import { Box, styled, Typography } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { DateTime } from 'luxon';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import theme from '../../../../../theme';
import { useGetDonationsGraphQuery } from './DonationsGraph.generated';

const LegendText = styled(Typography)(({ theme }) => ({
  margin: theme.spacing(3, 0),
  writingMode: 'vertical-rl',
  textOrientation: 'mixed',
}));

const GraphContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  margin: theme.spacing(0, 2, 0, 0),
}));

const GraphLoadingPlaceHolder = styled(Skeleton)(({ theme }) => ({
  width: '400',
  height: '24px',
  margin: theme.spacing(2, 0),
}));

interface DonationsGraphProps {
  accountListId: string;
  donorAccountIds: string[];
  convertedCurrency: string;
}

export const DonationsGraph: React.FC<DonationsGraphProps> = ({
  accountListId,
  donorAccountIds,
  convertedCurrency,
}) => {
  const { t } = useTranslation();
  const { data, loading } = useGetDonationsGraphQuery({
    variables: {
      accountListId: accountListId,
      donorAccountIds: donorAccountIds,
    },
  });

  const contactDonationsMap = [...Array(12)].map((x, i) => {
    const mapDate = DateTime.now().minus({ month: i });
    let lastYearCurrencyConvertedTotal = 0;
    let thisYearCurrencyConvertedTotal = 0;
    data?.reportsDonationHistories.periods.forEach((period) => {
      const periodDate = DateTime.fromISO(period.startDate);
      if (periodDate.month === mapDate.month) {
        if (periodDate.year === mapDate.year) {
          thisYearCurrencyConvertedTotal += period.convertedTotal;
        } else {
          lastYearCurrencyConvertedTotal += period.convertedTotal;
        }
      }
    });
    return {
      month: mapDate.monthShort,
      lastYear: lastYearCurrencyConvertedTotal,
      thisYear: thisYearCurrencyConvertedTotal,
    };
  });

  return (
    <GraphContainer>
      {loading ? (
        <Box style={{ width: '100%' }} role="alert">
          <GraphLoadingPlaceHolder />
          <GraphLoadingPlaceHolder />
          <GraphLoadingPlaceHolder />
        </Box>
      ) : (
        <>
          <LegendText variant="body1" role="banner">{`${t(
            'Curreny',
          )} (${convertedCurrency})`}</LegendText>
          <BarChart width={600} height={300} data={contactDonationsMap}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="thisYear" fill={theme.palette.secondary.main} />
            <Bar dataKey="lastYear" fill={theme.palette.secondary.dark} />
          </BarChart>
        </>
      )}
    </GraphContainer>
  );
};
