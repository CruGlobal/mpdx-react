import React from 'react';
import { Card, CardContent, CardHeader, useTheme } from '@mui/material';
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
import { BarChartSkeleton } from 'src/components/common/BarChartSkeleton/BarChartSkeleton';
import { LegendReferenceLine } from 'src/components/common/LegendReferenceLine/LegendReferenceLine';
import { useGraphData } from './useGraphData';

interface HealthIndicatorGraphProps {
  accountListId: string;
}

export const HealthIndicatorGraph: React.FC<HealthIndicatorGraphProps> = ({
  accountListId,
}) => {
  const { t } = useTranslation();
  const { palette } = useTheme();

  const { loading, average, periods } = useGraphData(accountListId);

  const stacks = [
    {
      field: 'ownership',
      label: t('Ownership'),
      color: palette.cruYellow.main,
    },
    { field: 'success', label: t('Success'), color: palette.graphBlue1.main },
    {
      field: 'consistency',
      label: t('Consistency'),
      color: palette.graphBlue2.main,
    },
    { field: 'depth', label: t('Depth'), color: palette.graphBlue3.main },
  ];

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
              name={t('Average')}
              value={average}
              color={palette.graphTeal.main}
            />
          )
        }
      />
      <CardContent>
        <ResponsiveContainer minWidth={600} height={400}>
          <BarChart
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
                stroke={palette.graphTeal.main}
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
            {stacks.map(({ field, label, color }) => (
              <Bar
                key={field}
                dataKey={field + 'Scaled'}
                name={label}
                stackId="a"
                fill={color}
                barSize={30}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
