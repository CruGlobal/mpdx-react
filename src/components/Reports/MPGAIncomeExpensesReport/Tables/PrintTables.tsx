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
import { useTotals } from '../TotalsContext/TotalsContext';
import { DataFields } from '../mockData';
import { StyledRow, StyledTypography } from '../styledComponents';

export interface PrintTablesProps {
  type: ReportTypeEnum;
  data?: DataFields[];
  title: string;
  months: string[];
  firstFutureMonthIndex?: number;
}

export const PrintTables: React.FC<PrintTablesProps> = ({
  title,
  months,
  data,
  type,
  firstFutureMonthIndex,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { incomeTotal, expensesTotal, dataLoading } = useTotals();

  const overallTotal =
    type === ReportTypeEnum.Income ? incomeTotal : expensesTotal;

  const grayColor = theme.palette.text.disabled;
  const isFutureMonth = (index: number) =>
    firstFutureMonthIndex !== undefined && index >= firstFutureMonthIndex;
  const futureCellSx = {
    backgroundColor: theme.palette.action.hover,
    WebkitPrintColorAdjust: 'exact',
    printColorAdjust: 'exact',
  } as const;

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

                // Split the year underline into a past segment (year color) and
                // a future segment (gray) at the exact column boundary, so it
                // lines up with the columns regardless of their widths.
                const futureStart =
                  firstFutureMonthIndex !== undefined
                    ? Math.max(
                        0,
                        Math.min(count, firstFutureMonthIndex - monthOffset),
                      )
                    : count;
                const pastCount = futureStart;
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
              <TableCell sx={{ textAlign: 'right' }}>
                <StyledTypography>
                  <strong>{t('Average')}</strong>
                </StyledTypography>
              </TableCell>
              <TableCell sx={{ textAlign: 'right' }}>
                <StyledTypography>
                  <strong>{t('Total')}</strong>
                </StyledTypography>
              </TableCell>
            </TableRow>
          </TableHead>
          {data?.length ? (
            <TableBody>
              {data.map((value) => (
                <StyledRow key={value.id}>
                  <TableCell>
                    <StyledTypography>{value.description}</StyledTypography>
                  </TableCell>
                  {value.monthly.map((amount, index) => (
                    <TableCell
                      key={index}
                      sx={isFutureMonth(index) ? futureCellSx : undefined}
                    >
                      <StyledTypography>
                        {zeroAmountFormat(amount, locale)}
                      </StyledTypography>
                    </TableCell>
                  ))}
                  <TableCell align="right">
                    <StyledTypography>
                      {zeroAmountFormat(value.average, locale)}
                    </StyledTypography>
                  </TableCell>
                  <TableCell align="right">
                    <StyledTypography>
                      {zeroAmountFormat(value.total, locale)}
                    </StyledTypography>
                  </TableCell>
                </StyledRow>
              ))}
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
                {data[0].monthly.map((_, index) => (
                  <TableCell
                    key={index}
                    sx={isFutureMonth(index) ? futureCellSx : undefined}
                  >
                    <StyledTypography>
                      <strong>
                        {zeroAmountFormat(
                          data.reduce(
                            (sum, value) => sum + value.monthly[index],
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
                    <strong>{zeroAmountFormat(overallTotal, locale)}</strong>
                  </StyledTypography>
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              <TableRow>
                <TableCell colSpan={15} align="center">
                  {type === ReportTypeEnum.Income
                    ? t('No income data available in the last 12 months')
                    : t('No expenses data available in the last 12 months')}
                </TableCell>
              </TableRow>
            </TableBody>
          )}
        </Table>
      </TableContainer>
    </Box>
  );
};
