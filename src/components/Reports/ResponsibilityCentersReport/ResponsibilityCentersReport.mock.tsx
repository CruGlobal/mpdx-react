import { MockedResponse } from '@apollo/client/testing';
import {
  FinancialAccountsDocument,
  FinancialAccountsQuery,
} from './GetFinancialAccounts.generated';

export const financialAccountsMock = (
  accountListId: string,
): MockedResponse => {
  const data: FinancialAccountsQuery = {
    financialAccounts: {
      edges: [
        {
          node: {
            active: false,
            balance: {
              conversionDate: '2/2/2021',
              convertedAmount: 3500,
              convertedCurrency: 'CAD',
            },
            code: '13212',
            id: 'test-id-111',
            name: 'Test Account',
            organization: {
              id: '111-2222-3333',
              name: 'test org 01',
            },
            updatedAt: '2/2/2021',
          },
        },
      ],
    },
  };
  return {
    request: {
      query: FinancialAccountsDocument,
      variables: {
        accountListId,
      },
    },
    result: {
      data,
    },
  };
};

export const financialAccountsEmptyMock = (
  accountListId: string,
): MockedResponse => {
  return {
    request: {
      query: FinancialAccountsDocument,
      variables: {
        accountListId,
      },
    },
    result: {
      data: {
        financialAccounts: { edges: [] },
      },
    },
  };
};

export const financialAccountsLoadingMock = (
  accountListId: string,
): MockedResponse => {
  return {
    ...financialAccountsMock(accountListId),
    delay: 100931731455,
  };
};

export const financialAccountsErrorMock = (
  accountListId: string,
): MockedResponse => {
  return {
    request: {
      query: FinancialAccountsDocument,
      variables: {
        accountListId,
      },
    },
    error: { name: 'error', message: 'Error loading data.  Try again.' },
  };
};
