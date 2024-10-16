import { FinancialAccountEntryTypeEnum } from './AccountTransactionTable/AccountTransactionTable';
import { FinancialAccountEntriesQuery } from './financialAccountTransactions.generated';

export const financialAccountEntriesMock: FinancialAccountEntriesQuery = {
  financialAccountEntries: {
    entries: [
      {
        __typename: 'FinancialAccountEntry',
        id: 'entry1',
        amount: '-7047.28',
        currency: 'UAH',
        code: 'code1',
        description: 'description1',
        entryDate: '2024-08-09',
        type: FinancialAccountEntryTypeEnum.Credit,
        category: {
          __typename: 'FinancialAccountCategory',
          id: 'category1',
          code: 'category1Code',
          name: 'category1Name',
        },
      },
      {
        __typename: 'FinancialAccountEntry',
        id: 'entry2',
        amount: '15008.0',
        currency: 'UAH',
        code: 'code2',
        description: 'description2',
        entryDate: '2024-08-08',
        type: FinancialAccountEntryTypeEnum.Debit,
        category: {
          __typename: 'FinancialAccountCategory',
          id: 'category1',
          code: 'category1Code',
          name: 'category1Name',
        },
      },
      {
        __typename: 'FinancialAccountEntry',
        id: 'entry3',
        amount: '-36.2',
        currency: 'UAH',
        code: 'code3',
        description: 'description3',
        entryDate: '2024-08-07',
        type: FinancialAccountEntryTypeEnum.Credit,
        category: {
          __typename: 'FinancialAccountCategory',
          id: 'category2',
          code: 'category2Code',
          name: 'category2Name',
        },
      },
    ],
    metaData: {
      __typename: 'FinancialAccountMetaData',
      credits: '-307518.87',
      debits: '229344.0',
      difference: '-78174.87',
      currency: 'UAH',
      closingBalance: '-280413.99',
      openingBalance: '-202239.12',
    },
  },
};
