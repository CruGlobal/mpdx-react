import React, { useMemo, useState } from 'react';
import { Box, CircularProgress, useMediaQuery } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { Notification } from 'src/components/Notification/Notification';
import { EmptyReport } from 'src/components/Reports/EmptyReport/EmptyReport';
import { FourteenMonthReportCurrencyType } from 'src/graphql/types.generated';
import { useFourteenMonthReportQuery } from './GetFourteenMonthReport.generated';
import { FourteenMonthReportHeader as Header } from './Layout/Header/Header';
import {
  FourteenMonthReportTable as Table,
  FourteenMonthReportTableProps as TableProps,
} from './Layout/Table/Table';
import { calculateTotals, sortContacts } from './Layout/Table/helpers';
import { useCsvData } from './useCsvData';
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
  getContactUrl: (contactId: string) => string;
}

export interface MonthTotal {
  total: number;
  month: string;
}

export const FourteenMonthReport: React.FC<Props> = ({
  accountListId,
  designationAccounts,
  currencyType,
  isNavListOpen,
  title,
  getContactUrl,
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

  const { data, error } = useFourteenMonthReportQuery({
    variables: {
      accountListId,
      designationAccountIds: designationAccounts?.length
        ? designationAccounts
        : null,
      currencyType,
    },
  });

  // Generate a table for each currency group in the report
  const currencyTables = useMemo<CurrencyTable[]>(
    () =>
      data?.fourteenMonthReport.currencyGroups.map((currencyGroup) => ({
        currency: currencyGroup.currency,
        orderedContacts: sortContacts(currencyGroup.contacts, orderBy, order),
        totals: calculateTotals(currencyGroup.contacts),
      })) ?? [],
    [data, orderBy, order],
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
      {!data && !error ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <CircularProgress data-testid="LoadingFourteenMonthReport" />
        </Box>
      ) : error ? (
        <Notification type="error" message={error.toString()} />
      ) : currencyTables.length > 0 ? (
        <Box display="flex" flexDirection="column" gap={isPrint ? 1 : 4}>
          {currencyTables.map(({ currency, orderedContacts, totals }) => (
            <Table
              key={currency}
              isExpanded={isExpanded}
              getContactUrl={getContactUrl}
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
