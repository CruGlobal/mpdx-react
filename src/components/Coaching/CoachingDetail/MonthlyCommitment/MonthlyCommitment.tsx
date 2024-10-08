import React from 'react';
import {
  Box,
  CardContent,
  CardHeader,
  Skeleton,
  Typography,
} from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Text,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import AnimatedCard from 'src/components/AnimatedCard';
import { useLocale } from 'src/hooks/useLocale';
import theme from 'src/theme';
import { useGetReportsPledgeHistoriesQuery } from './MonthlyCommitment.generated';

interface MonthlyCommitmentProps {
  coachingId: string;
  goal?: number;
  currencyCode?: string;
}
export const MonthlyCommitment: React.FC<MonthlyCommitmentProps> = ({
  coachingId,
  goal = 0,
  currencyCode = 'USD',
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const { data, loading } = useGetReportsPledgeHistoriesQuery({
    variables: { coachingId },
  });

  const pledges =
    data?.reportPledgeHistories?.map((pledge) => {
      const startDate = pledge?.startDate
        ? DateTime.fromISO(pledge.startDate)
            .toJSDate()
            .toLocaleDateString(locale, {
              month: 'short',
              year: '2-digit',
            })
        : '';
      const received = Math.round(pledge?.received ?? 0);
      const committed = Math.round(pledge?.pledged ?? 0);
      return { startDate, received, committed };
    }) ?? [];

  const averageCommitments =
    pledges.length > 0
      ? pledges.reduce((sum, pledge) => sum + pledge.committed, 0) /
        pledges.length
      : 0;

  const domainMax = Math.max(
    ...pledges.map((pledge) => pledge.received),
    ...pledges.map((pledge) => pledge.committed),
    goal,
  );
  return (
    <AnimatedCard>
      <CardHeader
        title={
          <Box>
            <Typography variant="h6">{t('Monthly Commitments')}</Typography>
          </Box>
        }
      />
      <CardContent sx={{ overflowX: 'scroll' }}>
        <ResponsiveContainer minWidth={600}>
          {loading ? (
            <>
              <Skeleton variant="text" />
              <Skeleton />
              <Skeleton />
              <Skeleton />
              <Skeleton />
              <Skeleton />
              <Skeleton />
              <Skeleton />
              <Skeleton />
              <Skeleton />
              <Skeleton />
              <Skeleton />
            </>
          ) : (
            <BarChart data={pledges} margin={{ left: 20, right: 20 }}>
              <YAxis
                domain={[0, domainMax]}
                label={
                  <Text x={0} y={0} dx={20} dy={150} offset={0} angle={-90}>
                    {t('Amount ({{ currencyCode }})', { currencyCode })}
                  </Text>
                }
              />
              <Tooltip />
              <Legend />
              <CartesianGrid vertical={false} />
              {goal && (
                <ReferenceLine
                  y={goal}
                  stroke={theme.palette.mpdxBlue.main}
                  strokeWidth={3}
                />
              )}
              <ReferenceLine
                y={averageCommitments}
                stroke={theme.palette.progressBarOrange.main}
                strokeWidth={2}
              />
              <XAxis tickLine={false} dataKey="startDate" />
              <Bar
                name={t('Received')}
                dataKey="received"
                stackId={1}
                barSize={30}
                fill={theme.palette.mpdxGreen.main}
              />
              <Bar
                name={t('Committed')}
                dataKey="committed"
                stackId={1}
                barSize={30}
                fill={theme.palette.progressBarOrange.main}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </AnimatedCard>
  );
};
