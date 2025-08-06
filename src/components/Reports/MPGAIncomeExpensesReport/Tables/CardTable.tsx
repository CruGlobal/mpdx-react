import { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DataFields } from '../mockData';
import {
  LoadingBox,
  LoadingIndicator,
  StyledRow,
  StyledTypography,
} from '../styledComponents';

export interface CardTableProps {
  data?: DataFields[];
  emptyPlaceholder: React.ReactElement;
  title: string;
  loading?: boolean;
}

export const CardTable: React.FC<CardTableProps> = ({
  title,
  loading,
  data,
  emptyPlaceholder,
}) => {
  const { t } = useTranslation();

  const getLast12Months = (): string[] => {
    const result: string[] = [];
    const date = new Date();

    for (let i = 0; i < 12; i++) {
      const month = new Date(date.getFullYear(), date.getMonth() - i, 1);
      const formatted = month.toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      });
      result.push(formatted);
    }

    return result.reverse();
  };
  const last12Months = useMemo(() => getLast12Months(), []);

  const uniqueYears = [...new Set(last12Months.map((m) => m.split(' ')[1]))];

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
    <Card sx={{ width: '100%' }}>
      <CardHeader title={title} subheader={t('Last 12 Months')} />
      <Divider />
      <CardContent>
        <Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ borderBottom: 'none' }} />
                  {last12Months.map((monthYear, index) => {
                    const [month, year] = monthYear.split(' ');
                    const isFirstOfYear =
                      index === 0 ||
                      monthYear.split(' ')[1] !==
                        last12Months[index - 1].split(' ')[1];
                    const isLastOfYear =
                      index === last12Months.length - 1 ||
                      monthYear.split(' ')[1] !==
                        last12Months[index + 1].split(' ')[1];

                    const borderColor = getBorderColor(
                      uniqueYears.indexOf(year),
                    );

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
                  {last12Months.map((month) => (
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
                      <strong>
                        {data
                          .reduce((sum, data) => sum + data.total, 0)
                          .toLocaleString()}
                      </strong>
                    </StyledTypography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </CardContent>
    </Card>
  ) : (
    <Card>
      <CardHeader title={title} subheader={t('Last 12 Months')} />
      <Divider />
      <CardContent>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          {emptyPlaceholder}
        </Box>
      </CardContent>
    </Card>
  );
};
