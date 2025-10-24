import React, { useMemo, useState } from 'react';
import { Box, useMediaQuery } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import Loading from 'src/components/Loading/Loading';
import { Notification } from 'src/components/Notification/Notification';
import { EmptyReport } from 'src/components/Reports/EmptyReport/EmptyReport';
import { FourteenMonthReportHeader as Header } from './Layout/Header/Header';
import {
  FourteenMonthReportTable as Table,
  FourteenMonthReportTableProps as TableProps,
} from './Layout/Table/Table';
import { calculateTotals, sortContacts } from './Layout/Table/helpers';
import { useCsvData } from './useCsvData';
import { useFourteenMonthReport } from './useFourteenMonthReport';
import type { Order } from '../Reports.type';
import type { OrderBy } from './Layout/Table/TableHead/TableHead';

export interface CurrencyTable
  extends Pick<TableProps, 'totals' | 'orderedContacts'> {
  currency: string;
}
interface Props {
  accountListId: string;
  designationAccounts?: string[];
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  title: string;
  currencyType: FourteenMonthReportCurrencyType;
}

export enum FourteenMonthReportCurrencyType {
  Salary = 'salary',
  Donor = 'donor',
}

export interface MonthTotal {
  total: number;
  month: string;
}

export const FourteenMonthReport: React.FC<Props> = ({
  accountListId,
  currencyType,
  designationAccounts,
  isNavListOpen,
  title,
  onNavListToggle,
}) => {
  const [isExpanded, setExpanded] = useState<boolean>(false);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<OrderBy | null>(null);

  const { t } = useTranslation();

  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm'),
  );

  const isPrint = useMediaQuery('print');

  const { fourteenMonthReport, loading, error } = useFourteenMonthReport(
    accountListId,
    currencyType,
    designationAccounts,
  );

  // Generate a table for each currency group in the report
  const currencyTables = useMemo<CurrencyTable[]>(
    () =>
      fourteenMonthReport?.currencyGroups.map((currencyGroup) => ({
        currency: currencyGroup.currency,
        orderedContacts: sortContacts(currencyGroup.contacts, orderBy, order),
        totals: calculateTotals(currencyGroup.contacts),
      })) ?? [],
    [fourteenMonthReport, orderBy, order],
  );

  const handleExpandToggle = (): void => {
    setExpanded((prevExpanded) => !prevExpanded);
  };

  const handlePrint = () => window.print();

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: OrderBy,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const csvData = useCsvData(currencyTables);

  return (
    <Box>
      <Header
        csvData={csvData}
        currencyType={currencyType}
        isExpanded={isExpanded}
        isMobile={isMobile}
        isNavListOpen={isNavListOpen}
        onExpandToggle={handleExpandToggle}
        onNavListToggle={onNavListToggle}
        onPrint={handlePrint}
        title={title}
      />
      {loading ? (
        <Loading />
      ) : error ? (
        <Notification type="error" message={error.message} />
      ) : currencyTables.length > 0 ? (
        <Box display="flex" flexDirection="column" gap={isPrint ? 1 : 4}>
          {currencyTables.map(({ currency, orderedContacts, totals }) => (
            <Table
              key={currency}
              isExpanded={isExpanded}
              onRequestSort={handleRequestSort}
              order={order}
              orderBy={orderBy}
              orderedContacts={orderedContacts}
              salaryCurrency={currency}
              totals={totals}
            />
          ))}
        </Box>
      ) : (
        <EmptyReport
          title={t(
            'You have received no donations in the last fourteen months',
          )}
          subTitle={t(
            'You can setup an organization account to import them or add a new donation.',
          )}
        />
      )}
    </Box>
  );
};
