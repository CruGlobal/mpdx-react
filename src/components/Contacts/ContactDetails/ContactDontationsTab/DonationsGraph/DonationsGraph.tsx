/* eslint-disable eqeqeq */
import { Box, styled, Typography } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
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

  const months = Object.values(
    data?.reportsDonationHistories.periods.reduce<{
      [month: string]: { month: string; lastYear: number; thisYear: number };
    }>((acc, period) => {
      const date = DateTime.fromISO(period.startDate);
      const month = date.monthShort;
      return {
        ...acc,
        [month]: {
          ...acc[month],
          month,
          ...(date.diff(DateTime.now().startOf('month'), 'years').years <= -1
            ? { lastYear: period.convertedTotal }
            : { thisYear: period.convertedTotal }),
        },
      };
    }, {}) ?? {},
  );

  return (
    <GraphContainer fontFamily={theme.typography.fontFamily}>
      {loading ? (
        <Box style={{ width: '100%' }} role="alert">
          <GraphLoadingPlaceHolder />
          <GraphLoadingPlaceHolder />
          <GraphLoadingPlaceHolder />
        </Box>
      ) : (
        <>
          <LegendText variant="body1" role="textbox">{`${t(
            'Amount',
          )} (${convertedCurrency})`}</LegendText>
          <BarChart width={600} height={300} data={months}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              name={t('Last Year')}
              dataKey="lastYear"
              fill={theme.palette.secondary.dark}
            />
            <Bar
              name={t('This Year')}
              dataKey="thisYear"
              fill={theme.palette.secondary.main}
            />
          </BarChart>
        </>
      )}
    </GraphContainer>
  );
};
