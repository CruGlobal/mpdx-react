import { renderHook } from '@testing-library/react-hooks';
import { StatusEnum } from 'src/graphql/types.generated';
import {
  CurrencyTable,
  FourteenMonthReportCurrencyType,
} from './FourteenMonthReport';
import { Contact } from './Layout/Table/TableHead/TableHead';
import { buildContact, monthly } from './monthlyEquivalentsTestContact';
import { useCsvData } from './useCsvData';

const mockContact = (mocks?: Partial<Contact>): Contact => ({
  id: 'contact-1',
  name: 'Test Contact',
  total: 100,
  average: 25,
  minimum: 50,
  completeMonthsTotal: 100,
  accountNumbers: ['12345'],
  lateBy30Days: false,
  lateBy60Days: false,
  pledgeAmount: 100,
  pledgeCurrency: 'USD',
  pledgeFrequency: 'Monthly',
  status: 'PARTNER_FINANCIAL',
  months: [
    {
      month: '2021-01',
      total: 25,
      salaryCurrencyTotal: 25,
      donations: [
        {
          amount: 25,
          date: '2021-01-15',
          paymentMethod: 'Check',
          currency: 'USD',
        },
      ],
    },
  ],
  ...mocks,
});

// Newest first, like the report
const reportMonths = [
  '2020-12-01',
  '2020-11-01',
  '2020-10-01',
  '2020-09-01',
  '2020-08-01',
  '2020-07-01',
  '2020-06-01',
  '2020-05-01',
  '2020-04-01',
  '2020-03-01',
  '2020-02-01',
  '2020-01-01',
  '2019-12-01',
  '2019-11-01',
];

const mockMonths = (totals: number[]): Contact['months'] =>
  totals.map((total, index) => ({
    total,
    month: reportMonths[index],
    salaryCurrencyTotal: total,
    donations: [],
  }));

const mockTables = (): CurrencyTable[] => [
  {
    currency: 'USD',
    totals: [
      100, 200, 150, 100, 200, 150, 100, 200, 150, 100, 200, 150, 100, 200,
    ].map((total, index) => ({ total, month: reportMonths[index] })),
    orderedContacts: [
      // Partner pledged for $450/quarter but who gave $275/month average over the last quarter
      mockContact({
        name: 'Quarterly Partner',
        status: StatusEnum.PartnerFinancial,
        pledgeAmount: 450,
        pledgeCurrency: 'USD',
        pledgeFrequency: '3.0',
        months: mockMonths([0, 350, 300, 250, 200, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
      }),

      // Partner pledged for $1200/year but who gave $75/month average over the last quarter
      mockContact({
        name: 'Annual Partner',
        status: StatusEnum.PartnerFinancial,
        pledgeAmount: 1200,
        pledgeCurrency: 'USD',
        pledgeFrequency: '12.0',
        months: mockMonths([
          0, 100, 0, 200, 0, 100, 0, 200, 0, 100, 0, 200, 0, 100,
        ]),
      }),
    ],
  },
  {
    currency: 'CAD',
    totals: [
      { total: 100, month: '2020-03-01' },
      { total: 200, month: '2020-02-01' },
      { total: 150, month: '2020-01-01' },
    ],
    orderedContacts: [],
  },
];

describe('useCsvData', () => {
  it('generates CSV data', async () => {
    const { result } = renderHook(
      () => useCsvData(mockTables(), FourteenMonthReportCurrencyType.Donor),
      {},
    );

    expect(result.current).toEqual([
      ['Currency', 'USD', '$'],
      [
        'Partner',
        'Status',
        'Commitment Amount',
        'Commitment Currency',
        'Commitment Frequency',
        'Committed Monthly Equivalent',
        'In Hand Monthly Equivalent',
        'Missing In Hand Monthly Equivalent',
        'In Hand Special Gifts',
        'In Hand Date Range',
        'Dec 20',
        'Nov 20',
        'Oct 20',
        'Sep 20',
        'Aug 20',
        'Jul 20',
        'Jun 20',
        'May 20',
        'Apr 20',
        'Mar 20',
        'Feb 20',
        'Jan 20',
        'Dec 19',
        'Nov 19',
        'Total (last month excluded from total)',
      ],
      [
        'Quarterly Partner',
        'Partner - Financial',
        450,
        'USD',
        'Quarterly',
        150,
        150,
        -0,
        500,
        'Aug 20 - Nov 20',
        0,
        350,
        300,
        250,
        200,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        100,
      ],
      [
        'Annual Partner',
        'Partner - Financial',
        1200,
        'USD',
        'Annual',
        100,
        75,
        -25,
        0,
        'Dec 19 - Nov 20',
        0,
        100,
        0,
        200,
        0,
        100,
        0,
        200,
        0,
        100,
        0,
        200,
        0,
        100,
        100,
      ],
      [
        'Totals',
        '',
        '',
        '',
        '',
        250,
        225,
        -25,
        500,
        '',
        100,
        200,
        150,
        100,
        200,
        150,
        100,
        200,
        150,
        100,
        200,
        150,
        100,
        200,
        2100,
      ],
      ['Currency', 'CAD', '$'],
      [
        'Partner',
        'Status',
        'Commitment Amount',
        'Commitment Currency',
        'Commitment Frequency',
        'Committed Monthly Equivalent',
        'In Hand Monthly Equivalent',
        'Missing In Hand Monthly Equivalent',
        'In Hand Special Gifts',
        'In Hand Date Range',
        'Mar 20',
        'Feb 20',
        'Jan 20',
        'Total (last month excluded from total)',
      ],
      ['Totals', '', '', '', '', 0, 0, 0, 0, '', 100, 200, 150, 450],
    ]);
  });

  it('puts Solid Monthly Support for each currency at the top of the salary currency export', () => {
    const { result } = renderHook(
      () => useCsvData(mockTables(), FourteenMonthReportCurrencyType.Salary),
      {},
    );

    // Quarterly: $1,100 / 12 = $92. Annual: $900 / 12 = $75.
    expect(result.current[0]).toEqual(['Solid Monthly Support', 167, 'USD']);
    expect(result.current[1]).toEqual(['Solid Monthly Support', 0, 'CAD']);

    // The rest of the file matches the partner currency export
    const { result: donorResult } = renderHook(
      () => useCsvData(mockTables(), FourteenMonthReportCurrencyType.Donor),
      {},
    );
    expect(result.current.slice(2)).toEqual(donorResult.current);
  });

  it('names the partners Solid Monthly Support could not convert', () => {
    const contact = buildContact({
      name: 'Euro Partner',
      pledgeCurrency: 'EUR',
      gifts: [0, ...monthly(100, 12)],
    });
    const tables = [{ ...mockTables()[0], orderedContacts: [contact] }];
    const { result } = renderHook(
      () => useCsvData(tables, FourteenMonthReportCurrencyType.Salary),
      {},
    );

    expect(result.current[0]).toEqual([
      'Solid Monthly Support',
      0,
      'USD',
      'Not counted, no gift on the report was in their commitment currency: Euro Partner',
    ]);
  });

  it('leaves Solid Monthly Support off the partner currency export', () => {
    const { result } = renderHook(
      () => useCsvData(mockTables(), FourteenMonthReportCurrencyType.Donor),
      {},
    );

    expect(result.current[0]).toEqual(['Currency', 'USD', '$']);
    expect(result.current.flat()).not.toContain('Solid Monthly Support');
  });
});
