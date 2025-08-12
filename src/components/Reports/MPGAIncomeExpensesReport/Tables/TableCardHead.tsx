import React, { useMemo } from 'react';
import {
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { monthWidth, summaryWidth } from './TableCard';

interface TableCardHeadProps {
  months: string[];
}

export const TableCardHead: React.FC<TableCardHeadProps> = ({ months }) => {
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

  return (
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
              sx={{
                borderBottom: '2px solid #565652',
                width: summaryWidth * 2,
                borderRight: `5px solid transparent`,
              }}
            >
              <Typography sx={{ color: '#565652', ml: -2, fontSize: '14px' }}>
                <strong>{t('Summary')}</strong>
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
      </Table>
    </TableContainer>
  );
};
