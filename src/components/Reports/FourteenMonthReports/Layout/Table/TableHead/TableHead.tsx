import React, { FC, useMemo } from 'react';
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
import { FourteenMonthReportQuery } from '../../../GetFourteenMonthReport.generated';
import type { Order, Unarray } from '../../../../Reports.type';
import { TableHeadCell } from './TableHeadCell/TableHeadCell';

export type Contacts = FourteenMonthReportQuery['fourteenMonthReport']['currencyGroups'][0]['contacts'];
export type Contact = Contacts[0];
export type Months = Contact['months'];
export type Month = Unarray<Months>;
export type OrderBy = keyof Contact | keyof Unarray<Months>;

export interface FourteenMonthReportTableHeadProps {
  isExpanded: boolean;
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

export const FourteenMonthReportTableHead: FC<FourteenMonthReportTableHeadProps> = ({
  isExpanded,
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
        {isExpanded && (
          <React.Fragment>
            <TableHeadCell
              isActive={orderBy === 'status'}
              sortDirection={orderBy === 'status' ? order : false}
              direction={orderBy === 'status' ? order : 'asc'}
              onClick={createSortHandler('status')}
            >
              {t('Status')}
            </TableHeadCell>
            <TableHeadCell
              isActive={orderBy === 'pledgeAmount'}
              sortDirection={orderBy === 'pledgeAmount' ? order : false}
              direction={orderBy === 'pledgeAmount' ? order : 'asc'}
              onClick={createSortHandler('pledgeAmount')}
            >
              {t('Commitment')}
            </TableHeadCell>
            <TableHeadCell
              isActive={orderBy === 'average'}
              sortDirection={orderBy === 'average' ? order : false}
              direction={orderBy === 'average' ? order : 'asc'}
              onClick={createSortHandler('average')}
            >
              {t('Avg')}
            </TableHeadCell>
            <TableHeadCell
              isActive={orderBy === 'minimum'}
              sortDirection={orderBy === 'minimum' ? order : false}
              direction={orderBy === 'minimum' ? order : 'asc'}
              onClick={createSortHandler('minimum')}
            >
              {t('Min')}
            </TableHeadCell>
          </React.Fragment>
        )}
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
