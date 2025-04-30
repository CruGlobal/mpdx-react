import { TwelveMonthReportQuery } from './GetTwelveMonthReport.generated';

export const twelveMonthReportMock = {
  data: {
    attributes: {
      currency_groups: {
        usd: {
          totals: {
            year: '4032.36',
            year_converted: 4032.36,
            months: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '329.36', '3703.0', 0, 0],
          },
          donation_infos: [
            {
              contact_id: 'abaf06b6-7fbf-4c5a-b4cb-d039f6e0c68d',
              total: 1329.36,
              average: 189.9085714285714,
              minimum: 36.0,
              maximum: 800.0,
              months: [
                {
                  total: 0,
                  donations: [],
                },
                {
                  total: 0,
                  donations: [],
                },
                {
                  total: 0,
                  donations: [],
                },
                {
                  total: 0,
                  donations: [],
                },
                {
                  total: 0,
                  donations: [],
                },
                {
                  total: 0,
                  donations: [],
                },
                {
                  total: 0,
                  donations: [],
                },
                {
                  total: 0,
                  donations: [],
                },
                {
                  total: 0,
                  donations: [],
                },
                {
                  total: 0,
                  donations: [],
                },
                {
                  total: '450',
                  donations: [
                    {
                      amount: '450.0',
                      contact_id: 'abaf06b6-7fbf-4c5a-b4cb-d039f6e0c68d',
                      contact_name: 'John Doe',
                      converted_amount: 450.0,
                      converted_currency: 'USD',
                      currency: 'USD',
                      donation_date: '2024-01-24',
                      donation_id: 'e6201a6d-c7bf-48c8-9ba7-6594f0fc4902',
                      likelihood_type: 'received',
                      payment_method: null,
                    },
                  ],
                },
                {
                  total: '1000.0',
                  donations: [
                    {
                      amount: '1000.0',
                      contact_id: 'abaf06b6-7fbf-4c5a-b4cb-d039f6e0c68d',
                      contact_name: 'John Doe',
                      converted_amount: 1000.0,
                      converted_currency: 'USD',
                      currency: 'USD',
                      donation_date: '2023-12-18',
                      donation_id: '4f389397-7ba2-4f65-8f20-8419a68c9f2c',
                      likelihood_type: 'received',
                      payment_method: null,
                    },
                  ],
                },
                {
                  total: 0,
                  donations: [],
                },
                {
                  total: 0,
                  donations: [],
                },
              ],
            },
          ],
        },
      },
      default_currency: 'USD',
      donor_infos: [
        {
          account_numbers: ['pipTheCat'],
          contact_id: 'abaf06b6-7fbf-4c5a-b4cb-d039f6e0c68d',
          contact_name: 'John Doe',
          late_by_30_days: false,
          late_by_60_days: true,
          pledge_amount: '90.0',
          pledge_currency: 'USD',
          pledge_frequency: '1.0',
          status: 'partner_financial',
        },
      ],
      months: [
        '2024-11-01',
        '2024-10-01',
        '2024-09-01',
        '2024-08-01',
        '2024-07-01',
        '2024-06-01',
        '2024-05-01',
        '2024-04-01',
        '2024-03-01',
        '2024-02-01',
        '2024-01-01',
        '2023-12-01',
        '2023-11-01',
        '2023-10-01',
      ],
      salary_currency: 'USD',
      updated_at: null,
      updated_in_db_at: null,
    },
    relationships: {
      account_list: {
        data: {
          id: '1ebb5ce4-410e-4100-8fdb-735b1f6c11d9',
          type: 'account_lists',
        },
      },
    },
  },
};

export const twelveMonthReportRestMock = {
  data: {
    id: '',
    type: 'reports_donor_currency_donations',
    attributes: {
      created_at: '',
      currency_groups: {
        cad: {
          totals: { months: ['1836.32', '1836.32', '1836.32', '1836.32'] },
          donation_infos: [
            {
              average: '86',
              contact_id: 'contact-1',
              maximum: '86',
              minimum: '85',
              months: [
                {
                  total: '50',
                  donations: [
                    {
                      amount: '85',
                      contact_id: 'contact-1',
                      contact_name: 'test name',
                      converted_amount: '85',
                      converted_currency: 'CAD',
                      currency: 'CAD',
                      donation_date: '2020-07-15',
                      donation_id: '',
                      likelihood_type: '',
                      payment_method: 'BANK_TRANS',
                    },
                  ],
                },
                {
                  total: '50',
                  donations: [
                    {
                      amount: '85',
                      contact_id: 'contact-1',
                      contact_name: 'test name',
                      converted_amount: '85',
                      converted_currency: 'CAD',
                      currency: 'CAD',
                      donation_date: '2020-11-15',
                      donation_id: '',
                      likelihood_type: '',
                      payment_method: 'BANK_TRANS',
                    },
                  ],
                },
                {
                  total: '50',
                  donations: [
                    {
                      amount: '85',
                      contact_id: 'contact-1',
                      contact_name: 'test name',
                      converted_amount: '85',
                      converted_currency: 'CAD',
                      currency: 'CAD',
                      donation_date: '2020-12-15',
                      donation_id: '',
                      likelihood_type: '',
                      payment_method: 'BANK_TRANS',
                    },
                  ],
                },
                {
                  total: '50',
                  donations: [
                    {
                      amount: '85',
                      contact_id: 'contact-1',
                      contact_name: 'test name',
                      converted_amount: '85',
                      converted_currency: 'CAD',
                      currency: 'CAD',
                      donation_date: '2021-1-15',
                      donation_id: '',
                      likelihood_type: '',
                      payment_method: 'BANK_TRANS',
                    },
                  ],
                },
              ],
              total: '1290',
            },
            {
              average: '86',
              contact_id: 'contact-2',
              maximum: '86',
              minimum: '85',
              months: [
                {
                  total: '50',
                  donations: [
                    {
                      amount: '85',
                      contact_id: 'contact-2',
                      contact_name: 'test name',
                      converted_amount: '85',
                      converted_currency: 'CAD',
                      currency: 'CAD',
                      donation_date: '2020-07-15',
                      donation_id: '',
                      likelihood_type: '',
                      payment_method: 'BANK_TRANS',
                    },
                  ],
                },
                {
                  total: '50',
                  donations: [
                    {
                      amount: '85',
                      contact_id: 'contact-2',
                      contact_name: 'test name',
                      converted_amount: '85',
                      converted_currency: 'CAD',
                      currency: 'CAD',
                      donation_date: '2020-11-15',
                      donation_id: '',
                      likelihood_type: '',
                      payment_method: 'BANK_TRANS',
                    },
                  ],
                },
                {
                  total: '50',
                  donations: [
                    {
                      amount: '85',
                      contact_id: 'contact-2',
                      contact_name: 'test name',
                      converted_amount: '85',
                      converted_currency: 'CAD',
                      currency: 'CAD',
                      donation_date: '2020-12-15',
                      donation_id: '',
                      likelihood_type: '',
                      payment_method: 'BANK_TRANS',
                    },
                  ],
                },
                {
                  total: '50',
                  donations: [
                    {
                      amount: '85',
                      contact_id: 'contact-2',
                      contact_name: 'test name',
                      converted_amount: '85',
                      converted_currency: 'CAD',
                      currency: 'CAD',
                      donation_date: '2021-1-15',
                      donation_id: '',
                      likelihood_type: '',
                      payment_method: 'BANK_TRANS',
                    },
                  ],
                },
              ],
              total: '1290',
            },
          ],
        },
        usd: {
          totals: { months: ['1836.32', '1836.32', '1836.32', '1836.32'] },
          donation_infos: [
            {
              average: '86',
              contact_id: 'contact-1',
              maximum: '86',
              minimum: '85',
              months: [
                {
                  total: '50',
                  donations: [
                    {
                      amount: '85',
                      contact_id: 'contact-1',
                      contact_name: 'test name',
                      converted_amount: '85',
                      converted_currency: 'USD',
                      currency: 'USD',
                      donation_date: '2020-07-15',
                      donation_id: '',
                      likelihood_type: '',
                      payment_method: 'BANK_TRANS',
                    },
                  ],
                },
                {
                  total: '50',
                  donations: [
                    {
                      amount: '85',
                      contact_id: 'contact-1',
                      contact_name: 'test name',
                      converted_amount: '85',
                      converted_currency: 'USD',
                      currency: 'USD',
                      donation_date: '2020-11-15',
                      donation_id: '',
                      likelihood_type: '',
                      payment_method: 'BANK_TRANS',
                    },
                  ],
                },
                {
                  total: '50',
                  donations: [
                    {
                      amount: '85',
                      contact_id: 'contact-1',
                      contact_name: 'test name',
                      converted_amount: '85',
                      converted_currency: 'USD',
                      currency: 'USD',
                      donation_date: '2020-12-15',
                      donation_id: '',
                      likelihood_type: '',
                      payment_method: 'BANK_TRANS',
                    },
                  ],
                },
                {
                  total: '50',
                  donations: [
                    {
                      amount: '85',
                      contact_id: 'contact-1',
                      contact_name: 'test name',
                      converted_amount: '85',
                      converted_currency: 'USD',
                      currency: 'USD',
                      donation_date: '2021-1-15',
                      donation_id: '',
                      likelihood_type: '',
                      payment_method: 'BANK_TRANS',
                    },
                  ],
                },
              ],
              total: '1290',
            },
          ],
        },
      },
      default_currency: '',
      donor_infos: [
        {
          account_numbers: ['10182'],
          contact_id: 'contact-1',
          contact_name: 'test name',
          late_by_30_days: false,
          late_by_60_days: false,
          pledge_amount: null,
          pledge_currency: 'CAD',
          pledge_frequency: null,
          status: null,
        },
        {
          account_numbers: ['10182'],
          contact_id: 'contact-2',
          contact_name: 'test name',
          late_by_30_days: false,
          late_by_60_days: false,
          pledge_amount: null,
          pledge_currency: 'CAD',
          pledge_frequency: null,
          status: null,
        },
        {
          account_numbers: ['101823'],
          contact_id: 'contact-1',
          contact_name: 'test name',
          late_by_30_days: false,
          late_by_60_days: false,
          pledge_amount: null,
          pledge_currency: 'USD',
          pledge_frequency: null,
          status: null,
        },
      ],
      months: ['2020-10-01', '2020-11-01', '2020-12-01', '2021-1-01'],
      salary_currency: 'CAD',
      updated_at: null,
      updated_in_db_at: null,
    },
    relationships: {
      account_list: { data: { id: '', type: 'account_lists' } },
    },
  },
};

export const defaultTwelveMonthReport = {
  twelveMonthReport: {
    currencyGroups: [
      {
        contacts: [
          {
            accountNumbers: ['11609'],
            average: 258,
            id: 'contact-1',
            lateBy30Days: false,
            lateBy60Days: true,
            months: [
              {
                donations: [
                  {
                    amount: 255,
                    currency: 'CAD',
                    date: '2020-06-04',
                    paymentMethod: 'BANK_TRANS',
                  },
                ],
                month: '2020-10-01',
                total: 255,
              },
              {
                donations: [
                  {
                    amount: 255,
                    currency: 'CAD',
                    date: '2020-06-04',
                    paymentMethod: 'BANK_TRANS',
                  },
                ],
                month: '2020-11-01',
                total: 255,
              },
              {
                donations: [
                  {
                    amount: 255,
                    currency: 'CAD',
                    date: '2020-06-04',
                    paymentMethod: 'BANK_TRANS',
                  },
                ],
                month: '2020-12-01',
                total: 255,
              },
              {
                donations: [
                  {
                    amount: 255,
                    currency: 'CAD',
                    date: '2020-06-04',
                    paymentMethod: 'BANK_TRANS',
                  },
                ],
                month: '2021-1-01',
                total: 255,
              },
            ],
            minimum: 255,
            name: 'test name',
            pledgeAmount: null,
            status: null,
            total: 3366,
          },
          {
            accountNumbers: ['11610'],
            average: 258,
            id: 'contact-2',
            lateBy30Days: false,
            lateBy60Days: false,
            months: [
              {
                donations: [
                  {
                    amount: 255,
                    currency: 'CAD',
                    date: '2020-06-04',
                    paymentMethod: 'BANK_TRANS',
                  },
                ],
                month: '2020-10-01',
                total: 255,
              },
              {
                donations: [
                  {
                    amount: 255,
                    currency: 'CAD',
                    date: '2020-06-04',
                    paymentMethod: 'BANK_TRANS',
                  },
                ],
                month: '2020-11-01',
                total: 255,
              },
              {
                donations: [
                  {
                    amount: 255,
                    currency: 'CAD',
                    date: '2020-06-04',
                    paymentMethod: 'BANK_TRANS',
                  },
                ],
                month: '2020-12-01',
                total: 255,
              },
              {
                donations: [
                  {
                    amount: 255,
                    currency: 'CAD',
                    date: '2020-06-04',
                    paymentMethod: 'BANK_TRANS',
                  },
                ],
                month: '2021-1-01',
                total: 255,
              },
            ],
            minimum: 255,
            name: 'name again',
            pledgeAmount: 15.65,
            pledgeCurrency: 'USD',
            status: null,
            total: 3366,
          },
        ],
        currency: 'cad',
        totals: {
          average: 1831,
          minimum: 1583,
          months: [
            {
              month: '2020-10-01',
              total: 1836.32,
            },
            {
              month: '2020-11-01',
              total: 1486.99,
            },
            {
              month: '2020-12-01',
              total: 1836.32,
            },
            {
              month: '2021-1-01',
              total: 1836.32,
            },
          ],
          year: 24613,
        },
      },
    ],
  },
} as unknown as TwelveMonthReportQuery;
