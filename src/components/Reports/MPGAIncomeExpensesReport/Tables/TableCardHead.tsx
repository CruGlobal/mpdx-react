import React from 'react';
import {
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useMonthHeaders } from 'src/hooks/useMonthHeaders';
import theme from 'src/theme';
import { monthWidth, summaryWidth } from './TableCard';

interface TableCardHeadProps {
  months: string[];
}

export const TableCardHead: React.FC<TableCardHeadProps> = ({ months }) => {
  const { t } = useTranslation();

  const { monthCount, firstMonthFlags, getBorderColor } = useMonthHeaders(
    months,
    {
      first: theme.palette.primary.main,
      second: theme.palette.chartOrange.main,
    },
  );

  return (
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
                  data-year={year}
                  data-color={borderColor}
                  data-count={count}
                  data-width={(monthWidth + 5) * count}
                  sx={{
                    width: (monthWidth + 5) * count,
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
              sx={{
                borderBottom: `2px solid ${theme.palette.chartGray.main}`,
                width: summaryWidth * 2,
                borderRight: `5px solid transparent`,
              }}
            >
              <Typography
                sx={{
                  color: theme.palette.chartGray.main,
                  ml: -2,
                  fontSize: '14px',
                }}
              >
                <strong>{t('Summary')}</strong>
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
      </Table>
    </TableContainer>
  );
};
