import { FinancialAccountsDocument } from './FinancialAccounts.generated';

export const FinancialAccountsMock = {
  FinancialAccounts: {
    financialAccounts: {
      nodes: [
        {
          active: true,
          balance: {
            conversionDate: '2021-02-02',
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
          updatedAt: '2021-02-02',
        },
      ],
    },
  },
};

export const FinancialAccountsErrorMock = {
  request: {
    query: FinancialAccountsDocument,
  },
  error: { name: 'error', message: 'Error loading data.  Try again.' },
};

export const FinancialAccountsEmptyMock = {
  FinancialAccounts: {
    financialAccounts: {
      nodes: [],
    },
  },
};
