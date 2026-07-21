import React from 'react';
import { Box, styled } from '@mui/material';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useContainerWidth } from 'src/hooks/useContainerWidth';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, percentageFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';

const ChartContainer = styled(Box)({
  '@media print': {
    width: '100% !important',
    height: '350px !important',
    '.recharts-wrapper': {
      height: '100px !important',
      width: '100% !important',
    },
    '.recharts-surface': {
      height: '350px !important',
      width: '100% !important',
    },
    '.recharts-legend-wrapper': {
      fontSize: '16px !important',
      paddingRight: '20px !important',
      textAlign: 'center !important',
      top: '100px !important',
    },
  },

  '.recharts-legend-item .recharts-surface': {
    width: '16px !important',
    height: '16px !important',
    top: '2px',
  },

  '.recharts-legend-item text': {
    dominantBaseline: 'middle',
  },
});

// Consider adding more brand colors to theme.
const chartColors = [
  theme.palette.primary.main,
  theme.palette.secondary.main,
  theme.palette.success.main,
  theme.palette.warning.main,
  theme.palette.error.main,
  theme.palette.info.main,
];

/** One pie slice: a named support-needs category and its dollar amount. */
export interface NeedsCategory {
  title: string;
  amount: number;
}

export interface SupportNeedsChartProps {
  /** The categories to plot, one slice each (e.g. monthly needs or special needs). */
  needsCategories: NeedsCategory[];
}

/**
 * Pie chart of support-needs categories. Presentational only — callers build
 * the category rows (e.g. `useMonthlyNeedsRows` for the monthly goal, or the
 * special-needs cost lines) and pass them in.
 */
export const SupportNeedsChart: React.FC<SupportNeedsChartProps> = ({
  needsCategories,
}) => {
  const locale = useLocale();
  const { containerRef, width } = useContainerWidth();

  // In narrower containers, the pie shrinks and the legend moves below the chart
  const isCompact = typeof width === 'number' && width < 700;

  const total = needsCategories.reduce((sum, row) => sum + row.amount, 0);

  return (
    <ChartContainer ref={containerRef} height={500}>
      <ResponsiveContainer width="100%">
        <PieChart>
          <Pie
            data={needsCategories}
            dataKey="amount"
            nameKey="title"
            cx="50%"
            cy="50%"
            outerRadius={isCompact ? 130 : 180}
            cornerRadius={theme.shape.borderRadius}
          >
            {needsCategories.map((row, index) => (
              <Cell
                key={row.title}
                fill={chartColors[index % chartColors.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) =>
              `${currencyFormat(Number(value), 'USD', locale)} (${percentageFormat(
                Number(value) / total,
                locale,
              )})`
            }
          />
          <Legend
            layout="vertical"
            align={isCompact ? 'center' : 'right'}
            verticalAlign={isCompact ? 'bottom' : 'middle'}
            wrapperStyle={{
              fontSize: isCompact
                ? theme.typography.subtitle1.fontSize
                : theme.typography.h5.fontSize,
              maxWidth: isCompact ? 600 : 300,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
