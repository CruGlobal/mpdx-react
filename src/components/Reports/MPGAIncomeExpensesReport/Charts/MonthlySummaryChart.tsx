import { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { DataFields } from '../mockData';

interface MonthlySummaryChartProps {
  incomeData: DataFields[];
  expenseData: DataFields[];
  months: string[];
  aspect: number;
  width: number;
  currency: string;
}

const chartColors = [
  theme.palette.statusSuccess.main,
  theme.palette.chipRedDark.main,
];

export const MonthlySummaryChart: React.FC<MonthlySummaryChartProps> = ({
  incomeData,
  expenseData,
  months,
  aspect,
  width,
  currency,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

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
      return { name, income, expenses, difference: income - expenses };
    });
  }, [incomeData, expenseData, months]);

  return (
    <ResponsiveContainer width={`${width}%`} aspect={aspect}>
      <BarChart
        data={monthlyTotals}
        margin={{ top: 15, right: 30, left: 20, bottom: 5 }}
      >
        <XAxis dataKey="name" tickFormatter={(value) => value.split(' ')[0]} />
        <YAxis
          tickFormatter={(value) => currencyFormat(value, currency, locale)}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) {
              return null;
            }
            const income = Number(
              payload.find((entry) => entry.dataKey === 'income')?.value ?? 0,
            );
            const expenses = Number(
              payload.find((entry) => entry.dataKey === 'expenses')?.value ?? 0,
            );
            const net = income - expenses;

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
                <Typography variant="body1">
                  {t('Month')}: {label}
                </Typography>
                <Typography variant="body1">
                  {t('Income')}: {currencyFormat(income, currency, locale)}
                </Typography>
                <Typography variant="body1">
                  {t('Expenses')}: {currencyFormat(expenses, currency, locale)}
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
        <Bar dataKey="expenses" name={t('Expenses')} fill={chartColors[1]} />
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
                  <span
                    className="legend-swatch"
                    style={{
                      width: 14,
                      height: 14,
                      backgroundColor: entry.color,
                      marginRight: 5,
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
          payload={[
            { value: t('Income'), type: 'square', color: chartColors[0] },
            { value: t('Expenses'), type: 'square', color: chartColors[1] },
          ]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
