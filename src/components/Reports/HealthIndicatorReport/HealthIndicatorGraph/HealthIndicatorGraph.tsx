import React from 'react';
import { Card, CardContent, CardHeader, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Text,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChartSkeleton } from 'src/components/common/BarChartSkeleton/BarChartSkeleton';
import { LegendReferenceLine } from 'src/components/common/LegendReferenceLine/LegendReferenceLine';
import { StyledBarChart } from 'src/components/common/StyledBarChart/StyledBarChart';
import { useIndicatorColors } from '../useIndicatorColors';
import { useGraphData } from './useGraphData';

interface HealthIndicatorGraphProps {
  accountListId: string;
}

export const HealthIndicatorGraph: React.FC<HealthIndicatorGraphProps> = ({
  accountListId,
}) => {
  const { t } = useTranslation();
  const { palette } = useTheme();
  const colors = useIndicatorColors();

  const { loading, average, periods } = useGraphData(accountListId);

  const stacks = [
    { field: 'ownership', label: t('Ownership') },
    { field: 'success', label: t('Success') },
    { field: 'consistency', label: t('Consistency') },
    { field: 'depth', label: t('Depth') },
  ];
  const averageColor = palette.graphite.main;

  if (periods?.length === 0) {
    // The account has no account list entries
    return null;
  }

  if (loading && !periods) {
    // The account list is loading
    return (
      <Card>
        <CardContent sx={{ height: 400 }}>
          <BarChartSkeleton bars={12} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        data-testid="HealthIndicatorGraphHeader"
        title={
          average && (
            <LegendReferenceLine
              name={t('Overall average')}
              value={average}
              color={averageColor}
            />
          )
        }
      />
      <CardContent>
        <ResponsiveContainer minWidth={600} height={400}>
          <StyledBarChart
            data={periods ?? undefined}
            margin={{
              left: 20,
              right: 20,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray={5} />
            <Legend />
            <Tooltip
              // Recover the original unscaled value to display in the tooltip
              // If dataKey is "ownershipHiScaled", for example, the value is in the "ownershipHi" field
              formatter={(scaledValue, _name, item) =>
                typeof item.dataKey === 'string' &&
                item.dataKey.endsWith('Scaled')
                  ? item.payload[item.dataKey.slice(0, -6)]
                  : scaledValue
              }
            />
            {average !== null && (
              <ReferenceLine
                y={average}
                stroke={averageColor}
                strokeWidth={3}
              />
            )}
            <XAxis tickLine={false} dataKey="month" />
            <YAxis
              domain={[0, 100]}
              scale="linear"
              label={
                <Text x={0} y={0} dx={20} dy={150} offset={0}>
                  (%)
                </Text>
              }
            />
            {stacks.map(({ field, label }) => (
              <Bar
                key={field}
                dataKey={field + 'Scaled'}
                name={label}
                stackId="a"
                fill={colors[field]}
                barSize={30}
              />
            ))}
          </StyledBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
