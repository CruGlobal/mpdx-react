import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Cell, Legend, Pie, PieChart } from 'recharts';
import { CardSkeleton } from '../Card/CardSkeleton';

interface ExpensesPieChartProps {
  ministryExpenses: number | undefined;
  healthcareExpenses: number | undefined;
  misc: number | undefined;
  other: number | undefined;
}

const chartColors = ['#05699B', '#00C0D8', '#F08020', '#FFCF07'];

export const ExpensesPieChart: React.FC<ExpensesPieChartProps> = ({
  ministryExpenses,
  healthcareExpenses,
  misc,
  other,
}) => {
  const { t } = useTranslation();

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return (
    <CardSkeleton
      title={t('Expenses Categories')}
      subtitle={t('Last 12 Months')}
    >
      <PieChart width={400} height={300}>
        <Pie
          data={[
            { name: t('Ministry'), value: ministryExpenses ?? 0 },
            { name: t('Healthcare'), value: healthcareExpenses ?? 0 },
            { name: t('Miscellaneous'), value: misc ?? 0 },
            { name: t('Assessment, Benefits, Salary'), value: other ?? 0 },
          ]}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
            const RADIAN = Math.PI / 180;
            const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
            const x = cx + radius * Math.cos(-midAngle * RADIAN);
            const y = cy + radius * Math.sin(-midAngle * RADIAN);

            return (
              <text
                x={x}
                y={y}
                fill="#000000"
                textAnchor="middle"
                dominantBaseline="central"
              >
                {(percent * 100).toFixed(0)}%
              </text>
            );
          }}
          outerRadius={100}
          dataKey="value"
        >
          <Cell key="cell-0" fill={chartColors[0]} />
          <Cell key="cell-1" fill={chartColors[1]} />
          <Cell key="cell-2" fill={chartColors[2]} />
          <Cell key="cell-3" fill={chartColors[3]} />
        </Pie>
        <Legend
          wrapperStyle={{ marginTop: 5 }}
          content={({ payload }) => (
            <ul
              style={{
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap',
                listStyle: 'none',
                gap: '0.5rem',
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
        />
      </PieChart>
    </CardSkeleton>
  );
};
