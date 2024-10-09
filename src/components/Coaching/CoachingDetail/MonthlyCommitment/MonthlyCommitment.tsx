import React from 'react';
import {
  Box,
  CardContent,
  CardHeader,
  Skeleton,
  Typography,
} from '@mui/material';
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
import { AccountList, Maybe } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { AccountListTypeEnum } from '../CoachingDetail';
import { CoachingLink } from '../CoachingLink';
import { useGetReportsPledgeHistoriesQuery } from './MonthlyCommitment.generated';
import { calculateMonthlyCommitmentGoal, formatStartDate } from './helpers';
import { useMonthlyCommitmentAverage } from './useMonthlyCommitmentAverage';

export interface MonthlyCommitmentProps {
  coachingId: string;
  accountListType: AccountListTypeEnum;
  currencyCode?: string;
  mpdInfo: Maybe<
    Pick<
      AccountList,
      | 'activeMpdMonthlyGoal'
      | 'activeMpdStartAt'
      | 'activeMpdFinishAt'
      | 'monthlyGoal'
    >
  >;
}

export const MonthlyCommitment: React.FC<MonthlyCommitmentProps> = ({
  coachingId,
  accountListType,
  currencyCode = 'USD',
  mpdInfo,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const { data, loading } = useGetReportsPledgeHistoriesQuery({
    variables: { coachingId },
  });

  const { average: monthlyCommitmentAverage, loading: averageLoading } =
    useMonthlyCommitmentAverage(coachingId, mpdInfo);

  const monthlyCommitmentGoal = mpdInfo
    ? calculateMonthlyCommitmentGoal(mpdInfo)
    : null;

  const pledges =
    data?.reportPledgeHistories?.map((pledge) => ({
      startDate: formatStartDate(pledge?.startDate, locale),
      received: Math.round(pledge?.received ?? 0),
      committed: Math.round(pledge?.pledged ?? 0),
    })) ?? [];

  const averageCommitments =
    pledges.length > 0
      ? pledges.reduce((sum, pledge) => sum + pledge.committed, 0) /
        pledges.length
      : 0;

  const domainMax = Math.max(
    ...pledges.map((pledge) => pledge.received),
    ...pledges.map((pledge) => pledge.committed),
    mpdInfo?.monthlyGoal ?? 0,
  );

  return (
    <AnimatedCard>
      <CardHeader
        title={
          <Box textAlign="center">
            {mpdInfo &&
            (!mpdInfo.activeMpdStartAt ||
              !mpdInfo.activeMpdFinishAt ||
              !mpdInfo.activeMpdMonthlyGoal) ? (
              <CoachingLink
                href={`/accountLists/${coachingId}/settings/preferences`}
                accountListType={accountListType}
                underline="hover"
              >
                {t('MPD info not set up on account list')}
              </CoachingLink>
            ) : !mpdInfo || averageLoading ? (
              <Skeleton
                variant="text"
                data-testid="MonthlyCommitmentSkeleton"
              />
            ) : (
              <Typography data-testid="MonthlyCommitmentSummary">
                {t('Monthly Commitment Average: ')}
                <strong style={{ color: theme.palette.progressBarOrange.main }}>
                  {currencyFormat(
                    Math.round(monthlyCommitmentAverage ?? 0),
                    currencyCode,
                    locale,
                  )}
                </strong>
                {' | '}
                {t('Monthly Commitment Goal: ')}
                <strong style={{ color: theme.palette.mpdxBlue.main }}>
                  {currencyFormat(
                    Math.round(monthlyCommitmentGoal ?? 0),
                    currencyCode,
                    locale,
                  )}
                </strong>
              </Typography>
            )}
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
              {mpdInfo?.monthlyGoal && (
                <ReferenceLine
                  y={mpdInfo.monthlyGoal}
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
