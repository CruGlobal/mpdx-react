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
  loading?: boolean;
}

export const PrintTables: React.FC<PrintTablesProps> = ({
  title,
  months,
  loading,
  data,
  type,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { incomeTotal, expensesTotal } = useTotals();

  const overallTotal =
    type === ReportTypeEnum.Income ? incomeTotal : expensesTotal;

  const { monthCount, firstMonthFlags, getBorderColor } = useMonthHeaders(
    months,
    {
      first: theme.palette.primary.main,
      second: theme.palette.chartOrange.main,
    },
  );

  return loading ? (
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
              {monthCount?.map(({ year, count }, index) => {
                const borderColor = getBorderColor(index);
                const firstMonthInYear = firstMonthFlags.find(
                  (month) => month.year === year && month.isFirstOfYear,
                );

                return (
                  <TableCell
                    key={`${year}-${count}`}
                    colSpan={count}
                    sx={{
                      borderBottom: `2px solid ${borderColor}`,
                      borderRight: `20px solid transparent`,
                    }}
                  >
                    {firstMonthInYear && (
                      <Typography
                        sx={{
                          color: borderColor,
                          ml: -2,
                          fontSize: '14px',
                        }}
                      >
                        <strong>{year}</strong>
                      </Typography>
                    )}
                  </TableCell>
                );
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
              {months.map((month) => (
                <TableCell key={month}>
                  <StyledTypography>
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
                    <TableCell key={index}>
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
                  <TableCell key={index}>
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
                  {t(`No ${type} data available in the last 12 months`, {
                    type: ReportTypeEnum[type],
                  })}
                </TableCell>
              </TableRow>
            </TableBody>
          )}
        </Table>
      </TableContainer>
    </Box>
  );
};
