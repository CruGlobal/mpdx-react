import React from 'react';
import { FinancialAccountPageEnum } from 'pages/accountLists/[accountListId]/reports/financialAccounts/Wrapper';
import { DynamicAccountSummary } from '../AccountSummary/DynamicAccountSummary';
import { DynamicAccountTransactions } from '../AccountTransactions/DynamicAccountTransactions';
import {
  FinancialAccountContext,
  FinancialAccountType,
} from '../Context/FinancialAccountsContext';
import { DynamicFinancialAccounts } from '../FinancialAccounts/DynamicFinancialAccounts';

export const MainContent: React.FC = () => {
  const { page } = React.useContext(
    FinancialAccountContext,
  ) as FinancialAccountType;

  return page === FinancialAccountPageEnum.AccountSummaryPage ? (
    <DynamicAccountSummary />
  ) : page === FinancialAccountPageEnum.AccountTransactionsPage ? (
    <DynamicAccountTransactions />
  ) : (
    <DynamicFinancialAccounts />
  );
};
