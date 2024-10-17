export const creditByCategories = [
  {
    amount: '-5000',
    category: {
      id: '111',
      name: 'Category 1',
      code: 'Code 1',
    },
  },
  {
    amount: '-5000',
    category: {
      id: '222',
      name: null,
      code: 'Code 2',
    },
  },
];
const debitByCategories = [
  {
    amount: '9000',
    category: {
      id: '333',
      name: 'Negative Category 1',
      code: 'Negative Code 1',
    },
  },
  {
    amount: '4000',
    category: {
      id: '444',
      name: null,
      code: 'Negative Code 2',
    },
  },
];

export const defaultFinancialAccountSummary = {
  financialAccountSummary: [
    {
      id: '1',
      closingBalance: '-7000',
      credits: '-5555',
      debits: '2895',
      difference: '5684',
      endDate: '2024-01-31',
      openingBalance: '-10001.25',
      startDate: '2024-01-01',
      creditByCategories,
      debitByCategories,
    },
    {
      id: '2',
      closingBalance: '-8000',
      credits: '-6666',
      debits: '1689',
      difference: '1864',
      endDate: '2024-02-29',
      openingBalance: '-9005',
      startDate: '2024-02-01',
      creditByCategories: [
        {
          ...creditByCategories[0],
          amount: '-3000',
        },
        {
          ...creditByCategories[1],
          amount: '-6000',
        },
      ],
      debitByCategories: [
        {
          ...debitByCategories[0],
          amount: '4000',
        },
        {
          ...debitByCategories[1],
          amount: '1000',
        },
      ],
    },
    {
      id: '3',
      closingBalance: '-10000',
      credits: '-3333',
      debits: '2689',
      difference: '3864',
      endDate: '2024-03-31',
      openingBalance: '-12000',
      startDate: '2024-03-01',
      creditByCategories: [
        {
          ...creditByCategories[0],
          amount: '-4500',
        },
        {
          ...creditByCategories[1],
          amount: '-3000',
        },
      ],
      debitByCategories: [
        {
          ...debitByCategories[0],
          amount: '2000',
        },
        {
          ...debitByCategories[1],
          amount: '4000',
        },
      ],
    },
    {
      id: '4',
      closingBalance: '-25000',
      credits: '-14444',
      debits: '5689',
      difference: '6864',
      endDate: '2024-03-31',
      openingBalance: '-31000',
      startDate: '2024-01-01',
      creditByCategories: [
        {
          ...creditByCategories[0],
          amount: '-19000',
        },
        {
          ...creditByCategories[1],
          amount: '-23000',
        },
      ],
      debitByCategories: [
        {
          ...debitByCategories[0],
          amount: '19500',
        },
        {
          ...debitByCategories[1],
          amount: '23000',
        },
      ],
    },
  ],
};
