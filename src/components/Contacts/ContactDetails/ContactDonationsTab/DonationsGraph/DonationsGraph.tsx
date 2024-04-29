import React, { useMemo } from 'react';
import { Box, Skeleton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
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
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
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
  const locale = useLocale();
  const { data, loading } = useGetDonationsGraphQuery({
    variables: {
      accountListId: accountListId,
      donorAccountIds: donorAccountIds,
    },
  });

  const monthFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: 'short',
      }),
    [locale],
  );

  const months = Object.values(
    data?.reportsDonationHistories.periods.reduce<{
      [month: string]: { month: string; lastYear: number; thisYear: number };
    }>((acc, period) => {
      const date = DateTime.fromISO(period.startDate);
      const month = monthFormatter.format(date.toJSDate());
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
    <>
      {data && (
        <Typography
          variant="h6"
          align="center"
          sx={(theme) => ({ paddingBottom: theme.spacing(1) })}
        >
          {t('Average: {{average}}', {
            average: currencyFormat(
              data.reportsDonationHistories.averageIgnoreCurrent,
              data.accountList.currency,
              locale,
            ),
          })}
          {' | '}
          {t('Gift Average: {{average}}', {
            average: currencyFormat(
              data.reportsDonationHistories.averageIgnoreCurrentAndZero,
              data.accountList.currency,
              locale,
            ),
          })}
        </Typography>
      )}
      <GraphContainer fontFamily={theme.typography.fontFamily}>
        {loading ? (
          <Box style={{ width: '100%' }} role="alert">
            <GraphLoadingPlaceHolder />
            <GraphLoadingPlaceHolder />
            <GraphLoadingPlaceHolder />
          </Box>
        ) : (
          <>
            <LegendText variant="body1" role="textbox">
              {t('Amount ({{amount}})', { amount: convertedCurrency })}
            </LegendText>
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
    </>
  );
};
