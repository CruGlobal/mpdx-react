import { useMemo } from 'react';
import { Box, GlobalStyles, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  LabelList,
  Legend,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { ChartFrame } from '../ChartFrame';
import { ChartLegendContent } from '../ChartLegendContent/ChartLegendContent';

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
  // Draws a dashed line at each average, labelled with its amount
  averages?: MonthlySummaryAverages;
}

interface MonthlyTotal extends MonthlySummaryChartData {
  tallest: number;
}

const chartColors = [theme.palette.success.main, theme.palette.error.main];

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

  const formatAmount = (value: number) =>
    maskAmounts
      ? noDataLabel
      : currencyFormat(value, currency, locale, { showTrailingZeros: true });

  const incomeName = overrideIncomeText ?? t('Income');

  const averageLines = maskAmounts
    ? []
    : [
        {
          key: 'income',
          value: averages?.income,
          name: incomeName,
          color: chartColors[0],
          labelPosition: 'insideTopLeft' as const,
        },
        {
          key: 'expenses',
          value: averages?.expenses,
          name: t('Expenses'),
          color: chartColors[1],
          labelPosition: 'insideBottomLeft' as const,
        },
      ];

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
                  formatter={(value: number) =>
                    currencyFormat(value, currency, locale, {
                      showTrailingZeros: true,
                    })
                  }
                />
              )}
            </Bar>
            {averageLines.map(({ key, value, name, color, labelPosition }) =>
              value === undefined ? null : (
                <ReferenceLine
                  key={key}
                  y={value}
                  stroke={color}
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  label={{
                    value: t('{{name}} 12-month avg: {{amount}}', {
                      name,
                      amount: formatAmount(value),
                    }),
                    position: labelPosition,
                    fill: color,
                    fontSize: theme.typography.body2.fontSize,
                  }}
                />
              ),
            )}
            <Legend
              verticalAlign="top"
              align="center"
              wrapperStyle={{ marginBottom: 5 }}
              content={({ payload }) => (
                <ChartLegendContent payload={payload} />
              )}
              payload={[
                {
                  value: incomeName,
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
