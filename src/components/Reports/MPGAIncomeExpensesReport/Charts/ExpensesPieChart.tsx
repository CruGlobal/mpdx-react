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
          <Cell key="cell-0" fill="#05699B" />
          <Cell key="cell-1" fill="#00C0D8" />
          <Cell key="cell-2" fill="#F08020" />
          <Cell key="cell-3" fill="#FFCF07" />
        </Pie>
        <Legend iconSize={15} />
      </PieChart>
    </CardSkeleton>
  );
};
