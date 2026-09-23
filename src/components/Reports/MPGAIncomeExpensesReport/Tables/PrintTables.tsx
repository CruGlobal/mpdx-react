import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { useMonthHeaders } from 'src/hooks/useMonthHeaders';
import { zeroAmountFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { LoadingBox, LoadingIndicator } from '../../styledComponents';
import { ReportTypeEnum } from '../Helper/MPGAReportEnum';
import { formatBalance } from '../Helper/formatBalance';
import { useMPGAIncomeExpenses } from '../MPGAIncomeExpensesContext/MPGAIncomeExpensesContext';
import { DataFields } from '../mockData';
import { StyledRow, StyledTypography } from '../styledComponents';

export interface PrintTablesProps {
  type: ReportTypeEnum;
  data?: DataFields[];
  title: string;
}

export const PrintTables: React.FC<PrintTablesProps> = ({
  title,
  data,
  type,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const {
    totals: { income, expenses },
    isFutureMonth,
    dataLoading,
    monthLabels: months,
    firstFutureMonthIndex,
  } = useMPGAIncomeExpenses();

  const isBalance = type === ReportTypeEnum.Balance;
  const summaryColSpan = isBalance ? 2 : 1;

  const emptyMessage = {
    [ReportTypeEnum.Income]: t(
      'No income data available in the last 12 months',
    ),
    [ReportTypeEnum.Expenses]: t(
      'No expenses data available in the last 12 months',
    ),
    [ReportTypeEnum.Balance]: t(
      'No balance data available in the last 12 months',
    ),
  }[type];

  const negativeBalanceSx = (amount: number) => ({
    color: isBalance && amount < 0 ? theme.palette.error.main : undefined,
  });

  const grayColor = theme.palette.text.disabled;
  const futureCellSx = {
    backgroundColor: theme.palette.action.hover,
    WebkitPrintColorAdjust: 'exact',
    printColorAdjust: 'exact',
  };

  const { monthCount, firstMonthFlags, getBorderColor } = useMonthHeaders(
    months,
    {
      first: theme.palette.primary.main,
      second: theme.palette.chartOrange.main,
    },
  );

  return dataLoading ? (
    <LoadingBox>
      <LoadingIndicator
        data-testid="loading-spinner"
        color="primary"
        size={50}
      />
    </LoadingBox>
  ) : (
    <Box mb={2}>
      <Typography variant="h6">{title}</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ borderBottom: 'none', width: 43 }} />
              {monthCount?.flatMap(({ year, count }, index) => {
                const borderColor = getBorderColor(index);
                const firstMonthInYear = firstMonthFlags.find(
                  (month) => month.year === year && month.isFirstOfYear,
                );

                const monthOffset = monthCount
                  .slice(0, index)
                  .reduce((sum, group) => sum + group.count, 0);

                const pastCount =
                  firstFutureMonthIndex !== undefined
                    ? Math.min(count, firstFutureMonthIndex - monthOffset)
                    : count;
                const futureCount = count - pastCount;

                const yearLabel = firstMonthInYear ? (
                  <Typography
                    sx={{ color: borderColor, ml: -2, fontSize: '14px' }}
                  >
                    <strong>{year}</strong>
                  </Typography>
                ) : null;

                return [
                  pastCount > 0 ? (
                    <TableCell
                      key={`${year}-past`}
                      colSpan={pastCount}
                      sx={{
                        borderBottom: `2px solid ${borderColor}`,
                        borderRight: '20px solid transparent',
                      }}
                    >
                      {yearLabel}
                    </TableCell>
                  ) : null,
                  futureCount > 0 ? (
                    <TableCell
                      key={`${year}-future`}
                      colSpan={futureCount}
                      sx={{
                        borderBottom: `2px solid ${grayColor}`,
                        borderRight: '20px solid transparent',
                      }}
                    >
                      {pastCount === 0 ? yearLabel : null}
                    </TableCell>
                  ) : null,
                ];
              })}
              <TableCell
                colSpan={2}
                sx={{
                  borderBottom: `2px solid ${theme.palette.chartGray.main}`,
                }}
              >
                <Typography
                  sx={{
                    color: theme.palette.chartGray.main,
                    ml: -2,
                    fontSize: '12px',
                  }}
                >
                  <strong>{t('Summary')}</strong>
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <StyledTypography>
                  <strong>{t('Description')}</strong>
                </StyledTypography>
              </TableCell>
              {months.map((month, index) => (
                <TableCell key={month}>
                  <StyledTypography
                    sx={isFutureMonth(index) ? { color: grayColor } : undefined}
                  >
                    <strong>{month.split(' ')[0]}</strong>
                  </StyledTypography>
                </TableCell>
              ))}
              <TableCell colSpan={summaryColSpan} sx={{ textAlign: 'right' }}>
                <StyledTypography>
                  <strong>{t('Average')}</strong>
                </StyledTypography>
              </TableCell>
              {!isBalance && (
                <TableCell sx={{ textAlign: 'right' }}>
                  <StyledTypography>
                    <strong>{t('Total')}</strong>
                  </StyledTypography>
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          {data?.length ? (
            <TableBody>
              {data.map((value) => (
                <StyledRow key={value.id}>
                  <TableCell>
                    <StyledTypography>{value.description}</StyledTypography>
                  </TableCell>
                  {months.map((month, index) => {
                    const amount = value.monthly[index] ?? null;
                    return (
                      <TableCell
                        key={month}
                        sx={isFutureMonth(index) ? futureCellSx : undefined}
                      >
                        <StyledTypography sx={negativeBalanceSx(amount ?? 0)}>
                          {isBalance
                            ? formatBalance(amount, locale)
                            : zeroAmountFormat(amount, locale)}
                        </StyledTypography>
                      </TableCell>
                    );
                  })}
                  <TableCell colSpan={summaryColSpan} align="right">
                    <StyledTypography sx={negativeBalanceSx(value.average)}>
                      {isBalance
                        ? formatBalance(value.average, locale)
                        : zeroAmountFormat(value.average, locale)}
                    </StyledTypography>
                  </TableCell>
                  {!isBalance && (
                    <TableCell align="right">
                      <StyledTypography>
                        {zeroAmountFormat(value.total, locale)}
                      </StyledTypography>
                    </TableCell>
                  )}
                </StyledRow>
              ))}
              {!isBalance && (
                <TableRow
                  sx={{
                    '@media print': {
                      backgroundColor: theme.palette.chartBlueLight.main,
                      WebkitPrintColorAdjust: 'exact',
                      printColorAdjust: 'exact',
                    },
                  }}
                >
                  <TableCell>
                    <StyledTypography>
                      <strong>{t('Overall Total')}</strong>
                    </StyledTypography>
                  </TableCell>
                  {months.map((month, index) => (
                    <TableCell
                      key={month}
                      sx={isFutureMonth(index) ? futureCellSx : undefined}
                    >
                      <StyledTypography>
                        <strong>
                          {zeroAmountFormat(
                            data.reduce(
                              (sum, value) => sum + (value.monthly[index] ?? 0),
                              0,
                            ),
                            locale,
                          )}
                        </strong>
                      </StyledTypography>
                    </TableCell>
                  ))}
                  <TableCell align="right">
                    <StyledTypography>
                      <strong>
                        {zeroAmountFormat(
                          data.reduce((sum, value) => sum + value.average, 0),
                          locale,
                        )}
                      </strong>
                    </StyledTypography>
                  </TableCell>
                  <TableCell align="right">
                    <StyledTypography>
                      <strong>
                        {zeroAmountFormat(
                          type === ReportTypeEnum.Income ? income : expenses,
                          locale,
                        )}
                      </strong>
                    </StyledTypography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          ) : (
            <TableBody>
              <TableRow>
                <TableCell colSpan={15} align="center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            </TableBody>
          )}
        </Table>
      </TableContainer>
    </Box>
  );
};
