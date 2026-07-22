import { useMemo } from 'react';
import { Box, GlobalStyles, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  LabelList,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { useReport } from '../../ReportContext/ReportContext';
import { ChartFrame } from '../ChartFrame';
import { ChartLegendContent } from '../ChartLegendContent/ChartLegendContent';

interface MonthlySummaryChartProps {
  aspect: number;
  width: number;
}

interface MonthlyTotal {
  name: string;
  income: number;
  expenses: number;
  net: number;
  tallest: number;
}

const chartColors = [theme.palette.success.main, theme.palette.error.main];

export const MonthlySummaryChart: React.FC<MonthlySummaryChartProps> = ({
  aspect,
  width,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const {
    allData: data,
    dataLoading,
    monthLabels: months,
    currency,
  } = useReport();
  const incomeData = data.income ?? [];
  const expenseData = data.expenses ?? [];

  const monthlyTotals = useMemo(() => {
    return months.map((name, index) => {
      const income = incomeData.reduce(
        (sum, item) => sum + (item.monthly[index] ?? 0),
        0,
      );
      const expenses = expenseData.reduce(
        (sum, item) => sum + Math.abs(item.monthly[index] ?? 0),
        0,
      );
      return {
        name,
        income,
        expenses,
        net: income - expenses,
        tallest: Math.max(income, expenses),
      };
    });
  }, [incomeData, expenseData, months]);

  return (
    <>
      <GlobalStyles
        styles={{
          '.labels-print-only .recharts-label-list': { display: 'none' },
          '@media print': {
            '.labels-print-only .recharts-label-list': { display: 'block' },
          },
        }}
      />
      <Box className="labels-print-only">
        <ChartFrame width={width} aspect={aspect} loading={dataLoading}>
          <BarChart
            data={monthlyTotals}
            barGap={0}
            margin={{ top: 15, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis
              dataKey="name"
              tickFormatter={(value) => value.split(' ')[0]}
            />
            <XAxis dataKey="name" xAxisId="net" hide />
            <YAxis
              tickFormatter={(value) => currencyFormat(value, currency, locale)}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) {
                  return null;
                }

                const { income, expenses, net } = payload[0]
                  .payload as MonthlyTotal;

                return (
                  <Box
                    sx={{
                      bgcolor: 'background.paper',
                      p: 1,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 'bold',
                      }}
                    >
                      {label}
                    </Typography>
                    <Typography variant="body1">
                      {t('Income')}: {currencyFormat(income, currency, locale)}
                    </Typography>
                    <Typography variant="body1">
                      {t('Expenses')}:{' '}
                      {currencyFormat(expenses, currency, locale)}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 'bold',
                        color:
                          net === 0
                            ? 'inherit'
                            : net > 0
                              ? chartColors[0]
                              : chartColors[1],
                      }}
                    >
                      {t('Net')}: {currencyFormat(net, currency, locale)}
                    </Typography>
                  </Box>
                );
              }}
            />
            <Bar dataKey="income" name={t('Income')} fill={chartColors[0]} />
            <Bar
              dataKey="expenses"
              name={t('Expenses')}
              fill={chartColors[1]}
            />
            <Bar
              dataKey="tallest"
              xAxisId="net"
              shape={() => <g />}
              isAnimationActive={false}
            >
              <LabelList
                dataKey="net"
                position="top"
                style={{
                  fill: theme.palette.chartBlack.main,
                  fontSize: theme.typography.body2.fontSize,
                }}
                formatter={(value: number) =>
                  currencyFormat(value, currency, locale)
                }
              />
            </Bar>
            <Legend
              verticalAlign="top"
              align="center"
              wrapperStyle={{ marginBottom: 5 }}
              content={({ payload }) => (
                <ChartLegendContent payload={payload} />
              )}
              payload={[
                {
                  value: t('Income'),
                  type: 'square',
                  color: chartColors[0],
                },
                {
                  value: t('Expenses'),
                  type: 'square',
                  color: chartColors[1],
                },
              ]}
            />
          </BarChart>
        </ChartFrame>
      </Box>
    </>
  );
};
