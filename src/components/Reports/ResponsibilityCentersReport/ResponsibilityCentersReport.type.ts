import { FinancialAccountsQuery } from './GetFinancialAccounts.generated';

export type FinancialAccount =
  | FinancialAccountsQuery['financialAccounts']['nodes'][0]
  | undefined;

export type PreFinancialAccountsGroup = {
  [organizationName: string]: FinancialAccount[];
};

export type FinancialAccountsGroup = {
  organizationName: string;
  financialAccounts: FinancialAccount[];
};
