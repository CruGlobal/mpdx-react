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
  ResponsiveContainer,
  Text,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { useGetDonationsGraphQuery } from './DonationsGraph.generated';

const GraphContainer = styled(Box)(({ theme }) => ({
  height: 300,
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1),
  overflowX: 'scroll',
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
      <GraphContainer>
        {loading ? (
          <Skeleton
            variant="rounded"
            width="100%"
            height="100%"
            aria-label={t('Loading donations graph')}
          />
        ) : (
          <ResponsiveContainer minWidth={600}>
            <BarChart margin={{ left: 30 }} data={months}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis
                label={
                  <Text dx={10} dy={80} angle={90}>
                    {t('Amount ({{amount}})', { amount: convertedCurrency })}
                  </Text>
                }
              />
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
          </ResponsiveContainer>
        )}
      </GraphContainer>
    </>
  );
};
