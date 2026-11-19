import { TFunction } from 'i18next';
import { ReferenceLine } from 'recharts';
import theme from 'src/theme';

export interface MonthlySummaryAverages {
  income?: number;
  expenses?: number;
}

interface AverageReferenceLinesOptions {
  t: TFunction;
  averages: MonthlySummaryAverages;
  incomeName: string;
  formatAmount: (value: number) => string | undefined;
}

// Recharts only finds its own elements among the chart's direct children, so
// this returns ReferenceLine elements instead of being a component.
export const averageReferenceLines = ({
  t,
  averages,
  incomeName,
  formatAmount,
}: AverageReferenceLinesOptions) =>
  [
    {
      key: 'income',
      value: averages.income,
      name: incomeName,
      color: theme.palette.success.main,
      labelPosition: 'insideTopLeft' as const,
    },
    {
      key: 'expenses',
      value: averages.expenses,
      name: t('Expenses'),
      color: theme.palette.error.main,
      labelPosition: 'insideBottomLeft' as const,
    },
  ].map(({ key, value, name, color, labelPosition }) =>
    value === undefined ? null : (
      <ReferenceLine
        key={key}
        y={value}
        stroke={color}
        strokeWidth={2}
        strokeDasharray="6 4"
        label={{
          value: t('{{name}} 12-month avg: {{amount}}', {
            name,
            amount: formatAmount(value),
          }),
          position: labelPosition,
          fill: color,
          fontSize: theme.typography.body2.fontSize,
        }}
      />
    ),
  );
