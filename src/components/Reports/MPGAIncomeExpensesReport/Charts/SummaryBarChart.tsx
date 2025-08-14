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

interface SummaryBarChartProps {
  incomeTotal: number | undefined;
  expensesTotal: number | undefined;
  aspect: number;
  width: number;
}

const chartColors = [
  theme.palette.primary.main,
  theme.palette.chartBlueLight.main,
];

export const SummaryBarChart: React.FC<SummaryBarChartProps> = ({
  incomeTotal,
  expensesTotal,
  aspect,
  width,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const currency = 'USD';

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
            style={{ fill: '#000000' }}
            formatter={(value: number) =>
              currencyFormat(value, currency, locale)
            }
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
