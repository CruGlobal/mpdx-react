import { TFunction } from 'i18next';
import { ReferenceLine } from 'recharts';
import theme from 'src/theme';
import { MonthlySummaryAverages } from './MonthlySummaryChart';

interface AverageReferenceLinesOptions {
  t: TFunction;
  averages?: MonthlySummaryAverages;
  incomeName: string;
  formatCurrency: (value: number) => string;
}

// Recharts only finds its own elements among the chart's direct children, so
// this returns ReferenceLine elements instead of being a component.
export const averageReferenceLines = ({
  t,
  averages,
  incomeName,
  formatCurrency,
}: AverageReferenceLinesOptions) => {
  if (!averages) {
    return [];
  }

  // The higher line's label sits above it and the lower one's below, so the
  // two labels never share the gap between close lines. A lone line's label
  // sits above it.
  const incomeOnTop =
    (averages.income ?? -Infinity) >= (averages.expenses ?? -Infinity);

  return [
    {
      key: 'income',
      value: averages.income,
      name: incomeName,
      // Darker than the bars so the line shows where it crosses its own bars
      color: theme.palette.success.dark,
      above: incomeOnTop,
    },
    {
      key: 'expenses',
      value: averages.expenses,
      name: t('Expenses'),
      color: theme.palette.error.dark,
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
            amount: formatCurrency(value),
          }),
          // On a flat line, "insideBottom" sits above it and "insideTop" below
          position: above ? 'insideBottomRight' : 'insideTopRight',
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
