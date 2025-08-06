import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bar, BarChart, Cell, Legend, Tooltip, XAxis, YAxis } from 'recharts';
import { CardSkeleton } from '../Card/CardSkeleton';
import { DataFields } from '../mockData';

interface MonthlySummaryChartProps {
  incomeData: DataFields[];
  expenseData: DataFields[];
  months: string[];
}

const chartColors = ['#88E4B6', '#EA657F'];

export const MonthlySummaryChart: React.FC<MonthlySummaryChartProps> = ({
  incomeData,
  expenseData,
  months,
}) => {
  const { t } = useTranslation();

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const combinedData = useMemo(() => {
    const transformedExpenseData = expenseData.map((item) => ({
      ...item,
      monthly: item.monthly.map((value) => -Math.abs(value)),
    }));

    return [...incomeData, ...transformedExpenseData];
  }, [incomeData, expenseData]);

  const monthlyTotals = useMemo(() => {
    const totals: {
      [key: string]: { income: number; expense: number; total: number };
    } = {};

    combinedData.forEach((item) => {
      item.monthly.forEach((value, index) => {
        const month = months[index];
        if (!totals[month]) {
          totals[month] = { income: 0, expense: 0, total: 0 };
        }

        if (item.monthly[0] >= 0) {
          totals[month].income += value;
        } else {
          totals[month].expense += value;
        }
      });
    });

    return months.map((month) => {
      const { income = 0, expense = 0 } = totals[month] || {};
      return {
        name: month,
        income,
        expense,
        net: income + expense,
      };
    });
  }, [combinedData, months]);

  if (!hasMounted) {
    return null;
  }

  return (
    <CardSkeleton title={t('Monthly Summary')} subtitle={t('Last 12 Months')}>
      <BarChart
        width={1100}
        height={500}
        data={monthlyTotals}
        margin={{ top: 15, right: 30, left: 20, bottom: 5 }}
      >
        <XAxis dataKey="name" tickFormatter={(value) => value.split(' ')[0]} />
        <YAxis
          tickFormatter={(value) =>
            value.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
            })
          }
        />
        <Tooltip
          formatter={(value: number | string): [string, string] => [
            `${Number(value).toLocaleString('en-US', {
              minimumFractionDigits: 0,
              style: 'currency',
              currency: 'USD',
            })}`,
            'Total',
          ]}
          labelFormatter={(label: string) => `Month: ${label}`}
        />
        <Bar dataKey="net">
          {monthlyTotals.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.net >= 0 ? chartColors[0] : chartColors[1]}
            />
          ))}
        </Bar>
        <Legend
          verticalAlign="top"
          align="center"
          wrapperStyle={{ marginBottom: 5 }}
          content={({ payload }) => (
            <ul
              style={{
                display: 'flex',
                justifyContent: 'center',
                listStyle: 'none',
                gap: '1rem',
                padding: 0,
              }}
            >
              {payload?.map((entry, index) => (
                <li
                  key={`item-${index}`}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      backgroundColor: entry.color,
                      marginRight: 5,
                    }}
                  />
                  <span style={{ color: '#000000' }}>{entry.value}</span>
                </li>
              ))}
            </ul>
          )}
          payload={[
            { value: 'Income', type: 'square', color: chartColors[0] },
            { value: 'Expenses', type: 'square', color: chartColors[1] },
          ]}
        />
      </BarChart>
    </CardSkeleton>
  );
};
