import React, { useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, useMediaQuery } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { mapFourteenMonthReport } from 'pages/api/Schema/reports/fourteenMonth/datahandler';
import { FourteenMonthReport as FourteenMonthReportQueryResponse } from 'pages/api/graphql-rest.page.generated';
import { Notification } from 'src/components/Notification/Notification';
import { EmptyReport } from 'src/components/Reports/EmptyReport/EmptyReport';
import { FourteenMonthReportCurrencyType } from 'src/graphql/types.generated';
import { useRequiredSession } from 'src/hooks/useRequiredSession';
import { getFourteenMonthReportDateRange } from 'src/lib/dateRangeHelpers';
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
  onNavListToggle,
}) => {
  const [isExpanded, setExpanded] = useState<boolean>(false);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<OrderBy | null>(null);
  const [fourteenMonthReport, setFourteenMonthReport] = useState<
    FourteenMonthReportQueryResponse | undefined
  >(undefined);
  const [fourteenMonthReportError, setFourteenMonthReportError] =
    useState<string>('');

  const { t } = useTranslation();
  const { apiToken } = useRequiredSession();

  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm'),
  );

  const isPrint = useMediaQuery('print');

  useEffect(() => {
    (async () => {
      try {
        setFourteenMonthReportError('');
        const designationAccountFilter = designationAccounts?.length
          ? `&filter[designation_account_id]=${designationAccounts.join(',')}`
          : '';
        const requestUrl = `${
          currencyType === 'salary'
            ? 'salary_currency_donations'
            : 'donor_currency_donations'
        }?filter[account_list_id]=${accountListId}${designationAccountFilter}&filter[month_range]=${getFourteenMonthReportDateRange()}`;

        const response = await fetch(
          `${process.env.REST_API_URL}reports/${requestUrl}`,
          {
            headers: {
              authorization: `Bearer ${apiToken}`,
              'Content-Type': 'application/vnd.api+json',
            },
          },
        );

        const { data } = await response.json();

        setFourteenMonthReport(mapFourteenMonthReport(data, currencyType));
      } catch (error: unknown) {
        if (error instanceof Error) {
          setFourteenMonthReportError(error.message);
        } else {
          setFourteenMonthReportError(String(error));
        }
      }
    })();
  }, [accountListId, designationAccounts, currencyType]);

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
      {!fourteenMonthReport && !fourteenMonthReportError ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <CircularProgress data-testid="LoadingFourteenMonthReport" />
        </Box>
      ) : fourteenMonthReportError ? (
        <Notification type="error" message={fourteenMonthReportError} />
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
