import { TFunction } from 'i18next';
import { LegendProps, ReferenceLine } from 'recharts';
import theme from 'src/theme';
import { MonthlySummaryAverages } from './MonthlySummaryChart';

interface AverageSeriesOptions {
  t: TFunction;
  averages?: MonthlySummaryAverages;
  incomeName: string;
}

interface AverageLegendOptions extends AverageSeriesOptions {
  formatCurrency: (value: number) => string;
}

const averageDash = '6 4';

// The averages that have a value, each in a darker shade of its bars' color so
// the line shows where it crosses its own bars
const averageSeries = ({ t, averages, incomeName }: AverageSeriesOptions) =>
  [
    {
      key: 'income',
      value: averages?.income,
      name: incomeName,
      color: theme.palette.success.dark,
    },
    {
      key: 'expenses',
      value: averages?.expenses,
      name: t('Expenses'),
      color: theme.palette.error.dark,
    },
  ].flatMap(({ value, ...series }) =>
    value === undefined ? [] : [{ ...series, value }],
  );

// Recharts only finds its own elements among the chart's direct children, so
// this returns ReferenceLine elements instead of being a component. The lines
// have no text; their amounts are in the legend.
export const averageReferenceLines = (options: AverageSeriesOptions) =>
  averageSeries(options).map(({ key, value, color }) => (
    <ReferenceLine
      key={key}
      y={value}
      stroke={color}
      strokeWidth={2}
      strokeDasharray={averageDash}
    />
  ));

const averageLegendItems = ({
  formatCurrency,
  ...options
}: AverageLegendOptions) =>
  averageSeries(options).map(({ value, name, color }) => ({
    value: options.t('{{name}} average: {{amount}}', {
      name,
      amount: formatCurrency(value),
    }),
    type: 'plainline' as const,
    color,
    payload: { strokeDasharray: averageDash },
  }));

interface ChartLegendOptions extends AverageLegendOptions {
  barColors: [string, string];
}

// The bars' legend entries plus one per average
export const chartLegend = ({ barColors, ...options }: ChartLegendOptions) => {
  const averageItems = averageLegendItems(options);
  const legendPayload: LegendProps['payload'] = [
    { value: options.incomeName, type: 'square', color: barColors[0] },
    { value: options.t('Expenses'), type: 'square', color: barColors[1] },
    ...averageItems,
  ];

  return {
    legendPayload,
    // Averages make the legend wrap to several lines on a phone, so then it
    // sits above the chart instead of taking height from the plot
    legendAbove: averageItems.length > 0,
  };
};
