import { useTranslation } from 'react-i18next';
import { Cell, Legend, Pie, PieChart } from 'recharts';
import theme from 'src/theme';
import { useReport } from '../../ReportContext/ReportContext';
import { ChartFrame } from '../ChartFrame';
import { ChartLegendContent } from '../ChartLegendContent/ChartLegendContent';

interface ExpensesPieChartProps {
  aspect: number;
  width: number;
}

const chartColors = [
  theme.palette.primary.main,
  theme.palette.chartBlue.main,
  theme.palette.chartPink.main,
  theme.palette.chartOrange.main,
  theme.palette.secondary.main,
  theme.palette.mpdxGrayMedium.main,
];

export const ExpensesPieChart: React.FC<ExpensesPieChartProps> = ({
  aspect,
  width,
}) => {
  const { t } = useTranslation();
  const {
    ministryTotal,
    healthcareTotal,
    assessmentTotal,
    benefitsTotal,
    salaryTotal,
    otherTotal,
    dataLoading,
  } = useReport();

  const data = [
    { name: t('Ministry'), value: ministryTotal ?? 0 },
    { name: t('Healthcare'), value: healthcareTotal ?? 0 },
    { name: t('Assessment'), value: assessmentTotal ?? 0 },
    { name: t('Benefits'), value: benefitsTotal ?? 0 },
    { name: t('Salary'), value: salaryTotal ?? 0 },
    { name: t('Other'), value: otherTotal ?? 0 },
  ];

  const noData = data.every((item) => item.value === 0);

  return (
    <ChartFrame width={width} aspect={aspect} loading={dataLoading}>
      <PieChart>
        {noData ? (
          <text
            x="50%"
            y="40%"
            textAnchor="middle"
            dominantBaseline="central"
            fill={theme.palette.chartBlack.main}
          >
            {t('You have no data at this time.')}
          </text>
        ) : (
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({
              cx,
              cy,
              midAngle,
              innerRadius,
              outerRadius,
              percent,
            }) => {
              const RADIAN = Math.PI / 180;
              const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
              const x = cx + radius * Math.cos(-midAngle * RADIAN);
              const y = cy + radius * Math.sin(-midAngle * RADIAN);

              const percentage = (percent * 100).toFixed(0);

              return (
                <text
                  x={x}
                  y={y}
                  fill={theme.palette.chartBlack.main}
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {percentage === '0' ? null : `${percentage}%`}
                </text>
              );
            }}
            outerRadius="80%"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={chartColors[index]} />
            ))}
          </Pie>
        )}
        <Legend
          wrapperStyle={{ marginTop: 5 }}
          payload={data.map((entry, index) => ({
            value: entry.name,
            type: 'square',
            color: chartColors[index],
          }))}
          content={({ payload }) => <ChartLegendContent payload={payload} />}
        />
      </PieChart>
    </ChartFrame>
  );
};
