import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CardSkeleton } from '../Card/CardSkeleton';
import { DataFields } from '../mockData';
import {
  LoadingBox,
  LoadingIndicator,
  StyledRow,
  StyledTypography,
} from '../styledComponents';

export interface TablesProps {
  data?: DataFields[];
  overallTotal: number | undefined;
  emptyPlaceholder: React.ReactElement;
  title: string;
  months: string[];
  years: string[];
  loading?: boolean;
}

export const Tables: React.FC<TablesProps> = ({
  title,
  months,
  years,
  overallTotal,
  loading,
  data,
  emptyPlaceholder,
}) => {
  const { t } = useTranslation();

  const getBorderColor = (index: number): string => {
    if (index === 0) {
      return '#05699B';
    } else if (index === 1) {
      return '#F08020';
    } else {
      return 'black';
    }
  };

  return loading ? (
    <LoadingBox>
      <LoadingIndicator
        data-testid="loading-spinner"
        color="primary"
        size={50}
      />
    </LoadingBox>
  ) : data?.length ? (
    <CardSkeleton title={title} subtitle={t('Last 12 Months')}>
      <Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ borderBottom: 'none' }} />
                {months.map((monthYear, index) => {
                  const [month, year] = monthYear.split(' ');
                  const isFirstOfYear =
                    index === 0 ||
                    monthYear.split(' ')[1] !== months[index - 1].split(' ')[1];
                  const isLastOfYear =
                    index === months.length - 1 ||
                    monthYear.split(' ')[1] !== months[index + 1].split(' ')[1];

                  const borderColor = getBorderColor(years.indexOf(year));

                  return (
                    <TableCell
                      key={`${month}-${year}`}
                      sx={{
                        borderBottom: isLastOfYear
                          ? `2px solid transparent`
                          : `2px solid ${borderColor}`,
                        position: 'relative',
                        '&::after': isLastOfYear
                          ? {
                              content: '""',
                              position: 'absolute',
                              bottom: -2,
                              left: 0,
                              width: '70%',
                              borderBottom: `2px solid ${borderColor}`,
                            }
                          : {},
                      }}
                    >
                      {isFirstOfYear ? (
                        <StyledTypography
                          sx={{
                            color: borderColor,
                            ml: -2,
                          }}
                        >
                          <strong>{year}</strong>
                        </StyledTypography>
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
                  <StyledTypography sx={{ color: '#565652', ml: -2 }}>
                    {t('Summary')}
                  </StyledTypography>
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
              <TableRow sx={{ backgroundColor: '#BBDEFB' }}>
                <TableCell>
                  <StyledTypography>
                    <strong>{t('Total')}</strong>
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
          </Table>
        </TableContainer>
      </Box>
    </CardSkeleton>
  ) : (
    <CardSkeleton title={title} subtitle={t('Last 12 Months')}>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
        {emptyPlaceholder}
      </Box>
    </CardSkeleton>
  );
};
