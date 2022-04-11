import { Skeleton } from '@material-ui/lab';
import { DateTime } from 'luxon';
import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  Bar,
  Legend,
  CartesianGrid,
  Tooltip,
  YAxis,
  Text,
  ReferenceLine,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { Box, CardContent, CardHeader, Typography } from '@material-ui/core';
import { useGetReportsPledgeHistoriesQuery } from './MonthlyCommitment.generated';
import AnimatedCard from 'src/components/AnimatedCard';
import { currencyFormat } from 'src/lib/intlFormat';

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
  const { data, loading } = useGetReportsPledgeHistoriesQuery({
    variables: { coachingId },
  });

  const pledges = data?.reportPledgeHistories?.map((pledge) => {
    const pledgeData: {
      [key: string]: string | number;
      startDate: string;
      received: number;
      committed: number;
    } = {
      startDate: DateTime.fromISO(
        pledge?.startDate ? pledge.startDate : '',
      ).toFormat('LLL yy'),
      received: pledge?.recieved ? pledge.recieved : 0,
      committed: pledge?.pledged ? pledge.pledged : 0,
    };
    return pledgeData;
  });

  const { t } = useTranslation();

  const domainMax = Math.max(
    ...(pledges?.map((pledge) => pledge.received) || []),
    ...(pledges?.map((pledge) => pledge.committed) || []),
    goal ?? 0,
  );
  return (
    <AnimatedCard>
      <CardHeader
        title={
          <Box>
            <Typography>
              {t('Monthly Commitment') +
                ' | ' +
                t('Monthly Commitment Goal') +
                ': ' +
                currencyFormat(goal, currencyCode)}
            </Typography>
          </Box>
        }
      />
      <CardContent>
        <ResponsiveContainer>
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
                    {
                      t('Amount ({{ currencyCode }})', {
                        currencyCode,
                      }) as string
                    }
                  </Text>
                }
              />
              <Tooltip />
              <Legend />
              <CartesianGrid vertical={false} />
              {goal && (
                <ReferenceLine y={goal} stroke="#17AEBF" strokeWidth={3} />
              )}
              <XAxis tickLine={false} dataKey="startDate" />
              <Bar dataKey="committed" barSize={30} fill="#DDE52F" />
              <Bar dataKey="received" barSize={30} fill="#4E885C" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </AnimatedCard>
  );
};
