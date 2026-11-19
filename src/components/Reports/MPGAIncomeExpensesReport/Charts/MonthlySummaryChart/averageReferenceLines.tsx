import { TFunction } from 'i18next';
import { ReferenceLine } from 'recharts';
import theme from 'src/theme';
import { MonthlySummaryAverages } from './MonthlySummaryChart';

interface AverageSeriesOptions {
  t: TFunction;
  averages?: MonthlySummaryAverages;
  incomeName: string;
}

export interface AverageSeries {
  key: string;
  value: number;
  name: string;
  color: string;
}

export const averageDash = '6 4';

// The averages that have a value, each in a darker shade of its bars' color so
// the line shows where it crosses its own bars
export const averageSeries = ({
  t,
  averages,
  incomeName,
}: AverageSeriesOptions): AverageSeries[] =>
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
// have no text; their amounts are in the key above the chart.
export const averageReferenceLines = (series: AverageSeries[]) =>
  series.map(({ key, value, color }) => (
    <ReferenceLine
      key={key}
      y={value}
      stroke={color}
      strokeWidth={2}
      strokeDasharray={averageDash}
    />
  ));
