import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { FinancialAccountProvider } from 'src/components/Reports/FinancialAccountsReport/Context/FinancialAccountsContext';
import { UrlFiltersProvider } from 'src/components/common/UrlFiltersProvider/UrlFiltersProvider';
import { getQueryParam } from 'src/utils/queryParam';

interface Props {
  children?: React.ReactNode;
}

export enum FinancialAccountPageEnum {
  FinancialAccountPage = 'FinancialAccountPage',
  AccountSummaryPage = 'AccountSummaryPage',
  AccountTransactionsPage = 'AccountTransactionsPage',
}

export const FinancialAccountsWrapper: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const { query } = router;

  const [financialAccountId, setFinancialAccountId] = useState(
    getQueryParam(query, 'financialAccountId') ?? '',
  );

  useEffect(() => {
    if (!query.financialAccountId) {
      return;
    }
    if (typeof query.financialAccountId === 'string') {
      setFinancialAccountId(query.financialAccountId);
    }
  }, [query.financialAccountId]);

  return (
    <UrlFiltersProvider>
      <FinancialAccountProvider financialAccountId={financialAccountId}>
        {children}
      </FinancialAccountProvider>
    </UrlFiltersProvider>
  );
};
