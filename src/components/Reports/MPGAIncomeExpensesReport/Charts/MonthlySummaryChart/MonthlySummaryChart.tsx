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
import { ChartFrame } from '../ChartFrame';
import { ChartLegendContent } from '../ChartLegendContent/ChartLegendContent';
import { averageReferenceLines, chartLegend } from './averageReferenceLines';

export interface MonthlySummaryChartData {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

export interface MonthlySummaryAverages {
  income?: number;
  expenses?: number;
}

interface MonthlySummaryChartProps {
  data: MonthlySummaryChartData[];
  currency: string;
  loading?: boolean;
  aspect: number;
  width: number;
  overrideIncomeText?: string;
  noDataLabel?: string;
  // Draws a dashed line at each average and lists its amount in the legend
  averages?: MonthlySummaryAverages;
}

interface MonthlyTotal extends MonthlySummaryChartData {
  tallest: number;
}

const chartColors: [string, string] = [
  theme.palette.success.main,
  theme.palette.error.main,
];

export const MonthlySummaryChart: React.FC<MonthlySummaryChartProps> = ({
  data,
  currency,
  loading,
  aspect,
  width,
  overrideIncomeText,
  noDataLabel,
  averages,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const maskAmounts = noDataLabel !== undefined;

  const formatCurrency = (value: number) =>
    currencyFormat(value, currency, locale, { showTrailingZeros: true });

  const formatAmount = (value: number) =>
    maskAmounts ? noDataLabel : formatCurrency(value);

  const incomeName = overrideIncomeText ?? t('Income');

  // Masked amounts hide the averages too
  const averageOptions = {
    t,
    averages: maskAmounts ? undefined : averages,
    incomeName,
  };

  const { legendPayload, legendAbove } = chartLegend({
    ...averageOptions,
    formatCurrency,
    barColors: chartColors,
  });

  const monthlyTotals = useMemo(
    (): MonthlyTotal[] =>
      data.map((month) => ({
        ...month,
        tallest: Math.max(month.income, month.expenses),
      })),
    [data],
  );

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
        {legendAbove && <ChartLegendContent payload={legendPayload} />}
        <ChartFrame width={width} aspect={aspect} loading={loading}>
          <BarChart
            data={monthlyTotals}
            barGap={0}
            margin={{ top: 15, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis
              dataKey="month"
              tickFormatter={(value) =>
                typeof value === 'string' ? value.split(' ')[0] : value
              }
            />
            <XAxis dataKey="month" xAxisId="net" hide />
            <YAxis
              hide={maskAmounts}
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
                      {incomeName}: {formatAmount(income)}
                    </Typography>
                    <Typography variant="body1">
                      {t('Expenses')}: {formatAmount(expenses)}
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
                      {t('Net')}: {formatAmount(net)}
                    </Typography>
                  </Box>
                );
              }}
            />
            <Bar dataKey="income" name={incomeName} fill={chartColors[0]} />
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
              {!maskAmounts && (
                <LabelList
                  dataKey="net"
                  position="top"
                  style={{
                    fill: theme.palette.chartBlack.main,
                    fontSize: theme.typography.body2.fontSize,
                  }}
                  formatter={formatCurrency}
                />
              )}
            </Bar>
            {averageReferenceLines(averageOptions)}
            {!legendAbove && (
              <Legend
                verticalAlign="top"
                align="center"
                wrapperStyle={{ marginBottom: 5 }}
                content={({ payload }) => (
                  <ChartLegendContent payload={payload} />
                )}
                payload={legendPayload}
              />
            )}
          </BarChart>
        </ChartFrame>
      </Box>
    </>
  );
};
