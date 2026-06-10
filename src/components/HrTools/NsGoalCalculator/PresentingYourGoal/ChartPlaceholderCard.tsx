import React from 'react';
import { Box, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from 'recharts';
import theme from 'src/theme';
import { PresentationCard } from '../../Shared/GoalPresentation/PresentationCard';

const ChartContainer = styled(Box)({
  '@media print': {
    pageBreakInside: 'avoid',
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

interface ChartPlaceholderCardProps {
  title: string;
}

/**
 * Placeholder pie chart shown until the charts are wired up to real goal
 * data. Renders generic series so the page layout matches the design.
 */
export const ChartPlaceholderCard: React.FC<ChartPlaceholderCardProps> = ({
  title,
}) => {
  const { t } = useTranslation();

  const placeholderData = [
    { name: t('Series {{number}}', { number: 1 }), value: 40 },
    { name: t('Series {{number}}', { number: 2 }), value: 30 },
    { name: t('Series {{number}}', { number: 3 }), value: 20 },
    { name: t('Series {{number}}', { number: 4 }), value: 10 },
  ];

  const chartColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.info.main,
  ];

  return (
    <PresentationCard title={title}>
      <ChartContainer height={300} data-testid="chart-placeholder">
        <ResponsiveContainer width="100%">
          <PieChart>
            <Pie
              data={placeholderData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              cornerRadius={theme.shape.borderRadius}
            >
              {placeholderData.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={chartColors[index % chartColors.length]}
                />
              ))}
            </Pie>
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              wrapperStyle={{
                fontSize: theme.typography.subtitle1.fontSize,
                maxWidth: 200,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </PresentationCard>
  );
};
