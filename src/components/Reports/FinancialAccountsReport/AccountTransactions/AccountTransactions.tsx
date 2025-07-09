import { useRouter } from 'next/router';
import React, { useContext, useEffect, useMemo } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { buildURI } from 'react-csv/lib/core';
import { useTranslation } from 'react-i18next';
import { Panel } from 'pages/accountLists/[accountListId]/reports/helpers';
import { headerHeight } from 'src/components/Shared/Header/ListHeader';
import { useUrlFilters } from 'src/components/common/UrlFiltersProvider/UrlFiltersProvider';
import { useDebouncedValue } from 'src/hooks/useDebounce';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormatShort } from 'src/lib/intlFormat';
import {
  FinancialAccountContext,
  FinancialAccountType,
} from '../Context/FinancialAccountsContext';
import { TransactionsHeader } from '../Header/TransactionsHeader';
import {
  AccountTransactionTable,
  FinancialAccountEntryTypeEnum,
} from './AccountTransactionTable/AccountTransactionTable';
import { formatTransactionAmount } from './AccountTransactionsHelper';
import { useFinancialAccountEntriesQuery } from './financialAccountTransactions.generated';

const Container = styled(Box)(() => ({
  height: `calc(100vh - ${headerHeight})`,
  overflowY: 'auto',
}));

const formatDateRange = (startDate?: DateTime, endDate?: DateTime) => {
  const minDate =
    startDate ?? DateTime.local().minus({ months: 1 }).plus({ days: 1 });
  const maxDate = endDate ?? DateTime.local();
  return `${minDate.toISODate()}..${maxDate.toISODate()}`;
};

export const AccountTransactions: React.FC = () => {
  const { query } = useRouter();
  const { t } = useTranslation();
  const locale = useLocale();
  const { accountListId, financialAccountId, setPanelOpen } = useContext(
    FinancialAccountContext,
  ) as FinancialAccountType;

  const {
    activeFilters = {},
    setActiveFilters,
    isFiltered,
    searchTerm = '',
  } = useUrlFilters();

  const { appName } = useGetAppSettings();

  useEffect(() => {
    setPanelOpen(Panel.Filters);

    return () => {
      setPanelOpen(null);
      setActiveFilters({});
    };
  }, [setPanelOpen]);

  const defaultDateRange = useMemo(() => formatDateRange(), []);
  const defaultStartDate = defaultDateRange.split('..')[0];
  const defaultEndDate = defaultDateRange.split('..')[1];

  useEffect(() => {
    if (!isFiltered && !query?.filters) {
      setActiveFilters({
        dateRange: {
          min: defaultStartDate,
          max: defaultEndDate,
        },
      });
    }
  }, [
    isFiltered,
    query?.filters,
    setActiveFilters,
    defaultStartDate,
    defaultEndDate,
  ]);

  const dateRange = useMemo(() => {
    if (!activeFilters?.dateRange?.min || !activeFilters?.dateRange?.max) {
      return defaultDateRange;
    }
    return formatDateRange(
      DateTime.fromISO(activeFilters.dateRange.min),
      DateTime.fromISO(activeFilters.dateRange.max),
    );
  }, [activeFilters?.dateRange, defaultDateRange]);

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
    const csvLines = data.financialAccountEntries.entries.reduce(
      (csvLines, entry) => {
        return [
          ...csvLines,
          [
            entry.entryDate
              ? dateFormatShort(DateTime.fromISO(entry.entryDate), locale)
              : 'No entry date',
            entry.description ?? '',
            entry.category?.name ?? entry.category?.code ?? '',
            entry.type === FinancialAccountEntryTypeEnum.Debit
              ? `${formatTransactionAmount(entry.amount, true)}`
              : '',
            entry.type === FinancialAccountEntryTypeEnum.Credit
              ? `${formatTransactionAmount(entry.amount)}`
              : '',
          ],
        ];
      },
      [columnHeaders],
    );

    // Convert Array to CSV format
    const csvBlob = buildURI(csvLines, true);

    // Create a link and trigger download
    const link = document.createElement('a');
    link.setAttribute('href', csvBlob);
    link.setAttribute('download', `${appName}-entries-export${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container>
      <TransactionsHeader
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
