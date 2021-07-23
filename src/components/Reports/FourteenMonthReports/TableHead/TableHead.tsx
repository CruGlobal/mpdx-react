import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';
import {
  styled,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
// eslint-disable-next-line import/extensions
import { FourteenMonthReportQuery } from '../GetFourteenMonthReport.generated';
import { TableHeadCell } from './TableHeadCell/TableHeadCell';

export type Unarray<T> = T extends Array<infer U> ? U : T;
export type Contacts = FourteenMonthReportQuery['fourteenMonthReport']['currencyGroups'][0]['contacts'];
export type Contact = Contacts[number];
export type Months = Contact['months'];
export type Month = Unarray<Months>;
export type Order = 'asc' | 'desc';
export type OrderBy = keyof Contact | keyof Unarray<Months>;

interface FourteenMonthReportTableHeadProps {
  totals:
    | FourteenMonthReportQuery['fourteenMonthReport']['currencyGroups'][0]['totals']
    | undefined;
  salaryCurrency:
    | FourteenMonthReportQuery['fourteenMonthReport']['salaryCurrency']
    | undefined;
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: OrderBy | number,
  ) => void;
  order: Order;
  orderBy: string | number | null;
}

const YearTableCell = styled(TableCell)(({}) => ({
  paddingLeft: 0,
}));

const YearTypography = styled(Typography)(({ theme }) => ({
  borderLeft: `1px solid ${theme.palette.cruGrayLight.main}`,
}));

export const FourteenMonthReportTableHead: React.FC<FourteenMonthReportTableHeadProps> = ({
  totals,
  salaryCurrency,
  order,
  orderBy,
  onRequestSort,
}) => {
  const { t } = useTranslation();

  const createSortHandler = (property: OrderBy | number) => (
    event: React.MouseEvent<unknown>,
  ) => {
    onRequestSort(event, property);
  };

  const allYears = useMemo(() => {
    return totals?.months.map((month) => month.month.split('-')[0]);
  }, [totals]);

  const monthCount = useMemo(() => {
    return allYears?.reduce<{
      [key: string]: number;
    }>(
      (count, year) => ({
        ...count,
        [year]: (count[year] || 0) + 1,
      }),
      {},
    );
  }, [allYears]);

  return (
    <TableHead data-testid="SalaryReportTableHead">
      <TableRow>
        <TableCell>
          <Typography variant="h6">{salaryCurrency}</Typography>
        </TableCell>
        {monthCount &&
          Object.entries(monthCount).map(([year, count]) => (
            <YearTableCell key={year} colSpan={count} align="center">
              <YearTypography variant="h6">{year}</YearTypography>
            </YearTableCell>
          ))}
        <TableCell />
      </TableRow>
      <TableRow>
        <TableHeadCell
          isActive={orderBy === 'name'}
          sortDirection={orderBy === 'name' ? order : false}
          direction={orderBy === 'name' ? order : 'asc'}
          onClick={createSortHandler('name')}
        >
          {t('Partner')}
        </TableHeadCell>
        {totals?.months.map((month, i: number) => (
          <TableHeadCell
            key={i}
            isActive={orderBy === i}
            align="center"
            sortDirection={orderBy === i ? order : false}
            direction={orderBy === i ? order : 'asc'}
            onClick={createSortHandler(i)}
          >
            {DateTime.fromISO(month.month).toFormat('LLL')}
          </TableHeadCell>
        ))}

        <TableHeadCell
          align="right"
          isActive={orderBy === 'total'}
          sortDirection={orderBy === 'total' ? order : false}
          direction={orderBy === 'total' ? order : 'asc'}
          onClick={createSortHandler('total')}
        >
          {t('Total')}
        </TableHeadCell>
      </TableRow>
    </TableHead>
  );
};
