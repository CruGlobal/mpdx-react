import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { FinancialAccountProvider } from 'src/components/Reports/FinancialAccountsReport/Context/FinancialAccountsContext';
import {
  DateRangeInput,
  InputMaybe,
  Scalars,
} from 'src/graphql/types.generated';
import { getQueryParam } from 'src/utils/queryParam';

interface Props {
  children?: React.ReactNode;
}

export enum FinancialAccountPageEnum {
  FinancialAccountPage = 'FinancialAccountPage',
  AccountSummaryPage = 'AccountSummaryPage',
  AccountTransactionsPage = 'AccountTransactionsPage',
}

export interface FinancialAccountTransactionFilters {
  dateRange?: InputMaybe<DateRangeInput>;
  categoryId?: InputMaybe<Scalars['String']['input']>;
}

export const FinancialAccountsWrapper: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const { query, replace, pathname, isReady } = router;

  const urlFilters =
    query?.filters && JSON.parse(decodeURI(query.filters as string));

  const [activeFilters, setActiveFilters] =
    useState<FinancialAccountTransactionFilters>(urlFilters ?? {});

  const [financialAccountId, setFinancialAccountId] = useState(
    getQueryParam(query, 'financialAccountId') ?? '',
  );

  const { searchTerm } = query;

  useEffect(() => {
    if (!query.financialAccountId) {
      return;
    }
    if (typeof query.financialAccountId === 'string') {
      setFinancialAccountId(query.financialAccountId);
    }
  }, [query.financialAccountId]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const { filters: _, ...oldQuery } = query;
    replace({
      pathname,
      query: {
        ...oldQuery,
        ...(Object.keys(activeFilters).length
          ? { filters: encodeURI(JSON.stringify(activeFilters)) }
          : undefined),
      },
    });
  }, [activeFilters, isReady]);

  return (
    <FinancialAccountProvider
      urlFilters={urlFilters}
      activeFilters={activeFilters}
      setActiveFilters={setActiveFilters}
      financialAccountId={financialAccountId}
      search={searchTerm}
    >
      {children}
    </FinancialAccountProvider>
  );
};
