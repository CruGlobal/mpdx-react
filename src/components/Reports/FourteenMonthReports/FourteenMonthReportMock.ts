// FourteenMonthReportMock.ts
// Mock data for useFourteenMonthReport tests

export const defaultFourteenMonthReport = {
  currencyType: 'donor',
  salaryCurrency: 'USD',
  currencyGroups: [
    {
      currency: 'CAD',
      totals: {
        year: 300,
        months: [
          { month: '2018-12', total: 100 },
          { month: '2019-01', total: 100 },
          { month: '2019-02', total: 100 },
          { month: '2019-03', total: 100 },
        ],
        average: 50,
        minimum: 100,
      },
      contacts: [
        {
          id: 'contact-1',
          name: 'test name',
          total: 150,
          completeMonthsTotal: 150,
          average: 25,
          minimum: 50,
          months: [
            {
              month: '2018-12',
              total: 50,
              salaryCurrencyTotal: 50,
              donations: [
                {
                  amount: 50,
                  date: '2018-12-15',
                  paymentMethod: 'Check',
                  currency: 'CAD',
                },
              ],
            },
            {
              month: '2019-01',
              total: 50,
              salaryCurrencyTotal: 50,
              donations: [
                {
                  amount: 50,
                  date: '2019-01-15',
                  paymentMethod: 'Check',
                  currency: 'CAD',
                },
              ],
            },
            {
              month: '2019-02',
              total: 50,
              salaryCurrencyTotal: 50,
              donations: [
                {
                  amount: 50,
                  date: '2019-02-15',
                  paymentMethod: 'Check',
                  currency: 'CAD',
                },
              ],
            },
            {
              month: '2019-03',
              total: 50,
              salaryCurrencyTotal: 50,
              donations: [
                {
                  amount: 50,
                  date: '2019-03-15',
                  paymentMethod: 'Check',
                  currency: 'CAD',
                },
              ],
            },
          ],
          accountNumbers: ['12345'],
          lateBy30Days: false,
          lateBy60Days: true,
          pledgeAmount: 100,
          pledgeCurrency: 'CAD',
          pledgeFrequency: 'Monthly',
          status: 'Partner - Financial',
        },
        {
          id: 'contact-2',
          name: 'test name',
          total: 150,
          completeMonthsTotal: 150,
          average: 25,
          minimum: 50,
          months: [
            {
              month: '2018-12',
              total: 50,
              salaryCurrencyTotal: 50,
              donations: [
                {
                  amount: 50,
                  date: '2018-12-15',
                  paymentMethod: 'Check',
                  currency: 'CAD',
                },
              ],
            },
            {
              month: '2019-01',
              total: 50,
              salaryCurrencyTotal: 50,
              donations: [
                {
                  amount: 50,
                  date: '2019-01-15',
                  paymentMethod: 'Check',
                  currency: 'CAD',
                },
              ],
            },
            {
              month: '2019-02',
              total: 50,
              salaryCurrencyTotal: 50,
              donations: [
                {
                  amount: 50,
                  date: '2019-02-15',
                  paymentMethod: 'Check',
                  currency: 'CAD',
                },
              ],
            },
            {
              month: '2019-03',
              total: 50,
              salaryCurrencyTotal: 50,
              donations: [
                {
                  amount: 50,
                  date: '2019-03-15',
                  paymentMethod: 'Check',
                  currency: 'CAD',
                },
              ],
            },
          ],
          accountNumbers: ['67890'],
          lateBy30Days: false,
          lateBy60Days: false,
          pledgeAmount: 100,
          pledgeCurrency: 'CAD',
          pledgeFrequency: 'Monthly',
          status: 'Partner - Financial',
        },
      ],
    },
    {
      currency: 'USD',
      totals: {
        year: 150,
        months: [
          { month: '2018-12', total: 50 },
          { month: '2019-01', total: 50 },
          { month: '2019-02', total: 50 },
          { month: '2019-03', total: 50 },
        ],
        average: 25,
        minimum: 50,
      },
      contacts: [
        {
          id: 'contact-3',
          name: 'test name',
          total: 150,
          completeMonthsTotal: 150,
          average: 25,
          minimum: 50,
          months: [
            {
              month: '2018-12',
              total: 50,
              salaryCurrencyTotal: 50,
              donations: [
                {
                  amount: 50,
                  date: '2018-12-15',
                  paymentMethod: 'Check',
                  currency: 'USD',
                },
              ],
            },
            {
              month: '2019-01',
              total: 50,
              salaryCurrencyTotal: 50,
              donations: [
                {
                  amount: 50,
                  date: '2019-01-15',
                  paymentMethod: 'Check',
                  currency: 'USD',
                },
              ],
            },
            {
              month: '2019-02',
              total: 50,
              salaryCurrencyTotal: 50,
              donations: [
                {
                  amount: 50,
                  date: '2019-02-15',
                  paymentMethod: 'Check',
                  currency: 'USD',
                },
              ],
            },
            {
              month: '2019-03',
              total: 50,
              salaryCurrencyTotal: 50,
              donations: [
                {
                  amount: 50,
                  date: '2019-03-15',
                  paymentMethod: 'Check',
                  currency: 'CAD',
                },
              ],
            },
          ],
          accountNumbers: ['11111'],
          lateBy30Days: false,
          lateBy60Days: false,
          pledgeAmount: 100,
          pledgeCurrency: 'USD',
          pledgeFrequency: 'Monthly',
          status: 'Partner - Financial',
        },
      ],
    },
  ],
};
