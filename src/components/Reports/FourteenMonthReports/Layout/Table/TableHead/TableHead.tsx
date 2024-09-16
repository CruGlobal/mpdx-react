import React, { FC, useMemo } from 'react';
import { TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { Totals } from '../../../FourteenMonthReport';
import { FourteenMonthReportQuery } from '../../../GetFourteenMonthReport.generated';
import { StyledTableCell } from '../StyledComponents';
import { TableHeadCell } from './TableHeadCell/TableHeadCell';
import type { Order, Unarray } from '../../../../Reports.type';

export type Contacts =
  FourteenMonthReportQuery['fourteenMonthReport']['currencyGroups'][0]['contacts'];
export type Contact = Contacts[0];
export type Months = Contact['months'];
export type Month = Unarray<Months>;
export type OrderBy = keyof Contact | keyof Unarray<Months>;

export interface FourteenMonthReportTableHeadProps {
  isExpanded: boolean;
  totals: Totals[] | undefined;
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

export const FourteenMonthReportTableHead: FC<
  FourteenMonthReportTableHeadProps
> = ({ isExpanded, totals, salaryCurrency, order, orderBy, onRequestSort }) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const createSortHandler =
    (property: OrderBy | number) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  const allYears = useMemo(() => {
    return totals?.map((month) => month.month.split('-')[0]);
  }, [totals]);

  const monthCount = useMemo(() => {
    const yearsObj = allYears?.reduce<{
      [key: string]: number;
    }>(
      (count, year) => ({
        ...count,
        [year]: (count[year] || 0) + 1,
      }),
      {},
    );
    return Object.entries(yearsObj ?? {})
      .map(([key, value]) => ({ year: key, count: value }))
      .reverse();
  }, [allYears]);

  return (
    <TableHead data-testid="SalaryReportTableHead">
      <TableRow>
        <StyledTableCell>
          <Typography variant="h6">{salaryCurrency}</Typography>
        </StyledTableCell>
        {isExpanded && (
          <>
            <YearTableCell />
            <YearTableCell />
            <YearTableCell />
            <YearTableCell />
          </>
        )}
        {monthCount &&
          monthCount.map((year) => (
            <YearTableCell
              key={year.year}
              colSpan={year.count}
              align="center"
              data-testid="tableHeaderCell"
            >
              <YearTypography variant="h6">{year.year}</YearTypography>
            </YearTableCell>
          ))}
        <StyledTableCell />
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
          <>
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
          </>
        )}
        {totals?.map((month, index) => (
          <TableHeadCell
            key={index}
            isActive={orderBy === index}
            align="center"
            sortDirection={orderBy === index ? order : false}
            direction={orderBy === index ? order : 'asc'}
            onClick={createSortHandler(index)}
          >
            {DateTime.fromISO(month.month)
              .toJSDate()
              .toLocaleDateString(locale, { month: 'short' })}
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
