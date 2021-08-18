import { FinancialAccountsQuery } from './GetFinancialAccounts.generated';

export type FinancialAccount =
  | FinancialAccountsQuery['financialAccounts']['edges'][0]['node']
  | undefined;

export type PreFinancialAccountsGroup = {
  [organizationName: string]: FinancialAccount[];
};

export type FinancialAccountsGroup = {
  organizationName: string;
  financialAccounts: FinancialAccount[];
};
