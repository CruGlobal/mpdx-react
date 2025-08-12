import { useMemo } from 'react';
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
import { ReportTypeEnum } from '../Helper/MPGAReportEnum';
import { DataFields } from '../mockData';
import {
  LoadingBox,
  LoadingIndicator,
  StyledRow,
  StyledTypography,
} from '../styledComponents';

export interface PrintTablesProps {
  type: ReportTypeEnum;
  data?: DataFields[];
  overallTotal: number | undefined;
  title: string;
  months: string[];
  loading?: boolean;
}

export const PrintTables: React.FC<PrintTablesProps> = ({
  title,
  months,
  overallTotal,
  loading,
  data,
  type,
}) => {
  const { t } = useTranslation();

  const getBorderColor = (index: number): string => {
    if (index === 0) {
      return '#05699B';
    } else {
      return '#F08020';
    }
  };

  const monthCount = useMemo(() => {
    const yearsObj = months.reduce<Record<string, number>>((acc, monthYear) => {
      const year = monthYear.split(' ')[1];
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(yearsObj).map(([year, count]) => ({
      year,
      count,
    }));
  }, [months]);

  const getFirstMonth = useMemo(
    () =>
      months.map((monthYear, index) => {
        const [month, year] = monthYear.split(' ');
        const isFirstOfYear =
          index === 0 ||
          monthYear.split(' ')[1] !== months[index - 1].split(' ')[1];
        const isLastOfYear =
          index === months.length - 1 ||
          monthYear.split(' ')[1] !== months[index + 1].split(' ')[1];

        return { month, year, isFirstOfYear, isLastOfYear };
      }),
    [months],
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
              {monthCount &&
                monthCount.map(({ year, count }, index) => {
                  const borderColor = getBorderColor(index);
                  const firstMonthInYear = getFirstMonth.find(
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
                      {firstMonthInYear ? (
                        <Typography
                          sx={{
                            color: borderColor,
                            ml: -2,
                            fontSize: '14px',
                          }}
                        >
                          <strong>{year}</strong>
                        </Typography>
                      ) : null}
                    </TableCell>
                  );
                })}
              <TableCell
                colSpan={2}
                sx={{
                  borderBottom: '2px solid #565652',
                }}
              >
                <Typography sx={{ color: '#565652', ml: -2, fontSize: '12px' }}>
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
              {data.map((data) => (
                <StyledRow key={data.id}>
                  <TableCell>
                    <StyledTypography>{data.description}</StyledTypography>
                  </TableCell>
                  {data.monthly.map((amount, index) => (
                    <TableCell key={index}>
                      <StyledTypography>
                        {amount.toLocaleString() === '0'
                          ? '-'
                          : amount.toLocaleString()}
                      </StyledTypography>
                    </TableCell>
                  ))}
                  <TableCell align="right">
                    <StyledTypography>
                      {data.average.toLocaleString()}
                    </StyledTypography>
                  </TableCell>
                  <TableCell align="right">
                    <StyledTypography>
                      {data.total.toLocaleString()}
                    </StyledTypography>
                  </TableCell>
                </StyledRow>
              ))}
              <TableRow
                sx={{
                  '@media print': {
                    backgroundColor: '#BBDEFB !important',
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
                        {data
                          .reduce((sum, data) => sum + data.monthly[index], 0)
                          .toLocaleString() === '0'
                          ? '-'
                          : data
                              .reduce(
                                (sum, data) => sum + data.monthly[index],
                                0,
                              )
                              .toLocaleString()}
                      </strong>
                    </StyledTypography>
                  </TableCell>
                ))}
                <TableCell align="right">
                  <StyledTypography>
                    <strong>
                      {data
                        .reduce((sum, data) => sum + data.average, 0)
                        .toLocaleString()}
                    </strong>
                  </StyledTypography>
                </TableCell>
                <TableCell align="right">
                  <StyledTypography>
                    <strong>{overallTotal?.toLocaleString()}</strong>
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
