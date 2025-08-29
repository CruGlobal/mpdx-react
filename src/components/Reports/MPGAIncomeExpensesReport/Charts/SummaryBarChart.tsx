import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { useTotals } from '../TotalsContext/TotalsContext';

interface SummaryBarChartProps {
  aspect: number;
  width: number;
  currency: string;
}

const chartColors = [theme.palette.primary.main, theme.palette.chartBlue.main];

export const SummaryBarChart: React.FC<SummaryBarChartProps> = ({
  aspect,
  width,
  currency,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const { incomeTotal, expensesTotal } = useTotals();

  const data = [
    { name: t('Income'), total: incomeTotal },
    {
      name: t('Expenses'),
      total: expensesTotal,
    },
  ];

  return (
    <ResponsiveContainer width={`${width}%`} aspect={aspect}>
      <BarChart
        data={data}
        margin={{ top: 15, right: 30, left: 20, bottom: 5 }}
      >
        <XAxis dataKey="name" />
        <YAxis
          tickFormatter={(value) => currencyFormat(value, currency, locale)}
        />
        <Bar dataKey="total">
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
    </ResponsiveContainer>
  );
};
