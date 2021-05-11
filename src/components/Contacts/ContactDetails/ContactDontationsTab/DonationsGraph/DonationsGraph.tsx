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
  width: '100%',
  height: '24px',
  margin: theme.spacing(2, 0),
}));

interface DonationsGraphProps {
  accountListId: string;
  designationAccountIds: string[];
  donorAccountIds: string[];
  convertedCurrency: string;
}

export const DonationsGraph: React.FC<DonationsGraphProps> = ({
  accountListId,
  designationAccountIds,
  donorAccountIds,
  convertedCurrency,
}) => {
  const { t } = useTranslation();
  const thisYearsData = useGetDonationsGraphQuery({
    variables: {
      accountListId: accountListId,
      designationAccountIds: designationAccountIds,
      donorAccountIds: donorAccountIds,
      endDate: DateTime.now().toISO(),
    },
  });

  const lastYearsData = useGetDonationsGraphQuery({
    variables: {
      accountListId: accountListId,
      designationAccountIds: designationAccountIds,
      donorAccountIds: donorAccountIds,
      endDate: DateTime.now().minus({ year: 1 }).toISO(),
    },
  });

  const loading = thisYearsData.loading || lastYearsData.loading;
  const contactDonationsMap = [...Array(12)].map((x, i) => {
    const mapDate = DateTime.now().plus({ month: i });
    let lastYearCurrencyConvertedTotal = 0;
    let thisYearCurrencyConvertedTotal = 0;
    thisYearsData.data?.reportsDonationHistories.periods.forEach((period) => {
      if (DateTime.fromISO(period.startDate).month === mapDate.month) {
        thisYearCurrencyConvertedTotal += period.convertedTotal;
      }
    });
    lastYearsData.data?.reportsDonationHistories.periods.forEach((period) => {
      if (DateTime.fromISO(period.startDate).month === mapDate.month) {
        lastYearCurrencyConvertedTotal += period.convertedTotal;
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
        <>
          <GraphLoadingPlaceHolder />
          <GraphLoadingPlaceHolder />
          <GraphLoadingPlaceHolder />
        </>
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
