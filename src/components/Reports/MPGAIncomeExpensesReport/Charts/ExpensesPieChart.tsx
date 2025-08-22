import { useTranslation } from 'react-i18next';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from 'recharts';
import theme from 'src/theme';
import { useTotals } from '../TotalsContext/TotalsContext';

interface ExpensesPieChartProps {
  aspect: number;
  width: number;
}

const chartColors = [
  theme.palette.primary.main,
  theme.palette.chartBlue.main,
  theme.palette.chartOrange.main,
  theme.palette.secondary.main,
];

export const ExpensesPieChart: React.FC<ExpensesPieChartProps> = ({
  aspect,
  width,
}) => {
  const { t } = useTranslation();
  const { ministryTotal, healthcareTotal, miscTotal, otherTotal } = useTotals();

  const data = [
    { name: t('Ministry'), value: ministryTotal ?? 0 },
    { name: t('Healthcare'), value: healthcareTotal ?? 0 },
    { name: t('Miscellaneous'), value: miscTotal ?? 0 },
    { name: t('Assessment, Benefits, Salary'), value: otherTotal ?? 0 },
  ];

  return (
    <ResponsiveContainer width={`${width}%`} aspect={aspect}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
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
          outerRadius="80%"
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
                  <span
                    className="legend-swatch"
                    style={{
                      width: 14,
                      height: 14,
                      backgroundColor: entry.color,
                      marginRight: 6,
                      WebkitPrintColorAdjust: 'exact',
                      printColorAdjust: 'exact',
                    }}
                  />
                  <span style={{ color: theme.palette.chartBlack.main }}>
                    {entry.value}
                  </span>
                </li>
              ))}
            </ul>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
