import { useTranslation } from 'react-i18next';
import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from 'recharts';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { useReport } from '../../ReportContext/ReportContext';
import { ChartFrame } from '../ChartFrame';

interface SummaryBarChartProps {
  aspect: number;
  width: number;
}

const chartColors = [
  theme.palette.statusSuccess.main,
  theme.palette.chipRedDark.main,
];

export const SummaryBarChart: React.FC<SummaryBarChartProps> = ({
  aspect,
  width,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const { incomeTotal, expensesTotal, dataLoading, currency } = useReport();

  const data = [
    { name: t('Income'), total: incomeTotal },
    {
      name: t('Expenses'),
      total: expensesTotal,
    },
  ];

  return (
    <ChartFrame width={width} aspect={aspect} loading={dataLoading}>
      <BarChart
        data={data}
        margin={{ top: 15, right: 30, left: 20, bottom: 5 }}
      >
        <XAxis dataKey="name" />
        <YAxis
          tickFormatter={(value) => currencyFormat(value, currency, locale)}
        />
        <Bar dataKey="total" maxBarSize={125}>
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={index === 0 ? chartColors[0] : chartColors[1]}
            />
          ))}
          <LabelList
            dataKey="total"
            position="top"
            style={{ fill: theme.palette.chartBlack.main }}
            formatter={(value: number) =>
              currencyFormat(value, currency, locale)
            }
          />
        </Bar>
      </BarChart>
    </ChartFrame>
  );
};
