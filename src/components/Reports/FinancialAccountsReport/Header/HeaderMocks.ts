import { FinancialAccountQuery } from '../Context/FinancialAccount.generated';

export const defaultFinancialAccount: FinancialAccountQuery = {
  financialAccount: {
    id: 'abc123',
    code: 'accountCode',
    name: 'Account 1',
    balance: {
      convertedAmount: 1000,
      convertedCurrency: 'USD',
    },
    categories: {
      nodes: [
        {
          id: '1',
          code: '100',
          entryType: 'CREDIT',
          name: 'Category 1',
        },
        {
          id: '2',
          code: '200',
          entryType: 'DEBIT',
          name: 'Category 2',
        },
      ],
    },
    organization: {
      id: '1',
      name: 'Organization 1',
    },
  },
};
