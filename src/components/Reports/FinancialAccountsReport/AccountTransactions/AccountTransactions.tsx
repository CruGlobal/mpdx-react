import { useRouter } from 'next/router';
import React, { useContext, useEffect, useMemo } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { Panel } from 'pages/accountLists/[accountListId]/reports/helpers';
import { headerHeight } from 'src/components/Shared/Header/ListHeader';
import { useDebouncedValue } from 'src/hooks/useDebounce';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormatShort } from 'src/lib/intlFormat';
import { formatNumber } from '../AccountSummary/AccountSummaryHelper';
import {
  FinancialAccountContext,
  FinancialAccountType,
} from '../Context/FinancialAccountsContext';
import { FinancialAccountHeader } from '../Header/Header';
import {
  AccountTransactionTable,
  FinancialAccountEntryTypeEnum,
} from './AccountTransactionTable/AccountTransactionTable';
import { useFinancialAccountEntriesQuery } from './financialAccountTransactions.generated';

const Container = styled(Box)(() => ({
  height: `calc(100vh - ${headerHeight})`,
  overflowY: 'auto',
}));

const formatDateRange = (startDate?: DateTime, endDate?: DateTime) => {
  if (!startDate) {
    startDate = DateTime.local().minus({ months: 1 }).plus({ days: 1 });
  }
  if (!endDate) {
    endDate = DateTime.local();
  }
  return `${startDate.toISODate()}..${endDate.toISODate()}`;
};

const defaultDateRange = formatDateRange();
export const defaultStartDate = defaultDateRange.split('..')[0];
export const defaultEndDate = defaultDateRange.split('..')[1];

export const AccountTransactions: React.FC = () => {
  const { query } = useRouter();
  const { t } = useTranslation();
  const locale = useLocale();
  const {
    accountListId,
    financialAccountId,
    activeFilters,
    setActiveFilters,
    hasActiveFilters,
    searchTerm,
    setPanelOpen,
  } = useContext(FinancialAccountContext) as FinancialAccountType;
  const { appName } = useGetAppSettings();

  useEffect(() => {
    // On loading the transactions page, open the filters panel and reset the active filters.
    // We need to reset the active filters to ensure the date range is set to the date range in the URL if it exists.
    const urlFilters =
      query?.filters && JSON.parse(decodeURI(query.filters as string));
    setPanelOpen(Panel.Filters);
    setActiveFilters(urlFilters ?? {});
    return () => {
      setPanelOpen(null);
      setActiveFilters({});
    };
  }, [query?.filters]);

  useEffect(() => {
    if (!hasActiveFilters && !query?.filters) {
      setActiveFilters({
        dateRange: {
          min: defaultStartDate,
          max: defaultEndDate,
        },
      });
    }
  }, [hasActiveFilters]);

  const dateRange = useMemo(() => {
    if (!activeFilters?.dateRange?.min || !activeFilters?.dateRange?.max) {
      return defaultDateRange;
    }
    return formatDateRange(
      DateTime.fromISO(activeFilters.dateRange.min),
      DateTime.fromISO(activeFilters.dateRange.max),
    );
  }, [activeFilters]);
  const categoryId =
    activeFilters?.categoryId && activeFilters?.categoryId !== 'all-categories'
      ? activeFilters?.categoryId
      : '';
  const wildcardSearch = useDebouncedValue(searchTerm, 500);

  const { data, loading } = useFinancialAccountEntriesQuery({
    variables: {
      input: {
        accountListId,
        financialAccountId: financialAccountId ?? '',
        dateRange,
        categoryId,
        wildcardSearch,
      },
    },
  });

  const handleExportCSV = () => {
    if (!data) {
      return;
    }
    const columnHeaders = [
      t('Date'),
      t('Payee'),
      t('Memo'),
      t('Outflow'),
      t('Inflow'),
    ];
    const convertDataToArray = data.financialAccountEntries.entries.reduce(
      (array, entry) => {
        return [
          ...array,
          [
            entry.entryDate
              ? dateFormatShort(DateTime.fromISO(entry.entryDate), locale)
              : 'No entry date',
            entry.description ?? '',
            entry.category?.name ?? entry.category?.code ?? '',
            entry.type === FinancialAccountEntryTypeEnum.Debit
              ? currencyFormat(
                  formatNumber(entry.amount),
                  entry.currency,
                  locale,
                ).replace(/[\xA0\u2000-\u200B\uFEFF]/g, ' ')
              : '',
            entry.type === FinancialAccountEntryTypeEnum.Credit
              ? currencyFormat(
                  formatNumber(entry.amount),
                  entry.currency,
                  locale,
                ).replace(/[\xA0\u2000-\u200B\uFEFF]/g, ' ')
              : '',
          ],
        ];
      },
      [columnHeaders],
    );

    // Convert Array to CSV format
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      convertDataToArray
        .map((row) =>
          row
            .map((field) => `"${String(field).replace(/"/g, '""')}"`)
            .join(','),
        )
        .join('\n');

    // Create a link and trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${appName}-entries-export${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container>
      <FinancialAccountHeader
        onTransactionPage
        disableExportCSV={loading}
        handleExportCSV={handleExportCSV}
      />

      {!data && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <CircularProgress data-testid="LoadingRC" />
        </Box>
      )}

      {data && (
        <Box pl={2} pr={2}>
          <AccountTransactionTable
            financialAccountEntries={data.financialAccountEntries}
            defaultStartDate={defaultStartDate}
            defaultEndDate={defaultEndDate}
          />
        </Box>
      )}
    </Container>
  );
};
