import { useEffect, useState } from 'react';
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

interface SummaryBarChartProps {
  incomeTotal: number | undefined;
  expensesTotal: number | undefined;
  aspect: number;
  width: number;
}

const chartColors = ['#05699B', '#00C0D8'];

export const SummaryBarChart: React.FC<SummaryBarChartProps> = ({
  incomeTotal,
  expensesTotal,
  aspect,
  width,
}) => {
  const { t } = useTranslation();

  const data = [
    { name: t('Income'), total: incomeTotal },
    {
      name: t('Expenses'),
      total: expensesTotal,
    },
  ];

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return (
    <ResponsiveContainer width={`${width}%`} aspect={aspect}>
      <BarChart
        data={data}
        margin={{ top: 15, right: 30, left: 20, bottom: 5 }}
      >
        <XAxis dataKey="name" />
        <YAxis
          tickFormatter={(value) =>
            value.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
            })
          }
        />
        <Bar dataKey="total">
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                index === 0
                  ? chartColors[0]
                  : index === 1
                  ? chartColors[1]
                  : 'white'
              }
            />
          ))}
          <LabelList
            dataKey="total"
            position="top"
            style={{ fill: '#000000' }}
            formatter={(value: number) =>
              value.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
              })
            }
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
