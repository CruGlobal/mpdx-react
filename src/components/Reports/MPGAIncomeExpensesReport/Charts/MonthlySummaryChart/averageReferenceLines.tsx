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
}: AverageReferenceLinesOptions) => {
  // The higher line's label sits above it and the lower one's below, so the
  // two labels never share the gap between close lines.
  const incomeOnTop = (averages.income ?? 0) >= (averages.expenses ?? 0);

  return [
    {
      key: 'income',
      value: averages.income,
      name: incomeName,
      color: theme.palette.success.main,
      above: incomeOnTop,
    },
    {
      key: 'expenses',
      value: averages.expenses,
      name: t('Expenses'),
      color: theme.palette.error.main,
      above: !incomeOnTop,
    },
  ].map(({ key, value, name, color, above }) =>
    value === undefined ? null : (
      <ReferenceLine
        key={key}
        y={value}
        stroke={color}
        strokeWidth={2}
        strokeDasharray="6 4"
        label={{
          value: t('{{name}} average: {{amount}}', {
            name,
            amount: formatAmount(value),
          }),
          position: above ? 'insideTopRight' : 'insideBottomRight',
          fill: color,
          fontSize: theme.typography.body2.fontSize,
          // A white outline keeps the label readable where it crosses a bar
          stroke: theme.palette.common.white,
          strokeWidth: 4,
          paintOrder: 'stroke',
        }}
      />
    ),
  );
};
