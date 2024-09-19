import { renderHook } from '@testing-library/react-hooks';
import { ErgonoMockShape } from 'graphql-ergonomock';
import { DeepPartial } from 'ts-essentials';
import { gqlMock } from '__tests__/util/graphqlMocking';
import {
  LoadConstantsDocument,
  LoadConstantsQuery,
} from 'src/components/Constants/LoadConstants.generated';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import { StatusEnum } from 'src/graphql/types.generated';
import { CurrencyTable } from './FourteenMonthReport';
import {
  FourteenMonthReportContactFragment,
  FourteenMonthReportContactFragmentDoc,
} from './GetFourteenMonthReport.generated';
import { useCsvData } from './useCsvData';

jest.mock('src/components/Constants/UseApiConstants.tsx');

// Mock useApiConstants to make the data available synchronously instead of having to wait for the GraphQL call
(useApiConstants as jest.MockedFn<typeof useApiConstants>).mockReturnValue(
  gqlMock<LoadConstantsQuery>(LoadConstantsDocument, {
    mocks: {
      constant: {
        pledgeCurrency: [
          {
            code: 'USD',
            symbol: '$',
          },
          {
            code: 'CAD',
            symbol: '$',
          },
        ],
        pledgeFrequency: [
          {
            key: '3.0',
            value: 'Quarterly',
          },
          {
            key: '12.0',
            value: 'Annual',
          },
        ],
      },
    },
  }).constant,
);

const mockContact = (
  mocks?: ErgonoMockShape & DeepPartial<FourteenMonthReportContactFragment>,
) =>
  gqlMock<FourteenMonthReportContactFragment>(
    FourteenMonthReportContactFragmentDoc,
    {
      mocks,
    },
  );

describe('useCsvData', () => {
  it('generates CSV data', async () => {
    const tables: CurrencyTable[] = [
      {
        currency: 'USD',
        totals: [
          { total: 100, month: '2020-12-01' },
          { total: 200, month: '2020-11-01' },
          { total: 150, month: '2020-10-01' },
          { total: 100, month: '2020-09-01' },
          { total: 200, month: '2020-08-01' },
          { total: 150, month: '2020-07-01' },
          { total: 100, month: '2020-06-01' },
          { total: 200, month: '2020-05-01' },
          { total: 150, month: '2020-04-01' },
          { total: 100, month: '2020-03-01' },
          { total: 200, month: '2020-02-01' },
          { total: 150, month: '2020-01-01' },
        ],
        orderedContacts: [
          // Partner pledged for $450/quarter but who gave $275/month average over the last quarter
          mockContact({
            name: 'Quarterly Partner',
            status: StatusEnum.PartnerFinancial,
            pledgeAmount: 450,
            pledgeCurrency: 'USD',
            pledgeFrequency: '3.0',
            months: [
              { total: 0, month: '2020-12-01' },
              { total: 0, month: '2020-11-01' },
              { total: 0, month: '2020-10-01' },
              { total: 0, month: '2020-09-01' },
              { total: 0, month: '2020-08-01' },
              { total: 0, month: '2020-07-01' },
              { total: 0, month: '2020-06-01' },
              { total: 0, month: '2020-05-01' },
              { total: 350, month: '2020-04-01' },
              { total: 300, month: '2020-03-01' },
              { total: 250, month: '2020-02-01' },
              { total: 200, month: '2020-01-01' },
            ],
          }),

          // Partner pledged for $1200/year but who gave $75/month average over the last quarter
          mockContact({
            name: 'Annual Partner',
            status: StatusEnum.PartnerFinancial,
            pledgeAmount: 1200,
            pledgeCurrency: 'USD',
            pledgeFrequency: '12.0',
            months: [
              { total: 0, month: '2020-12-01' },
              { total: 100, month: '2020-11-01' },
              { total: 0, month: '2020-10-01' },
              { total: 200, month: '2020-09-01' },
              { total: 0, month: '2020-08-01' },
              { total: 100, month: '2020-07-01' },
              { total: 0, month: '2020-06-01' },
              { total: 200, month: '2020-05-01' },
              { total: 0, month: '2020-04-01' },
              { total: 100, month: '2020-03-01' },
              { total: 0, month: '2020-02-01' },
              { total: 200, month: '2020-01-01' },
            ],
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
    const { result } = renderHook(() => useCsvData(tables), {});

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
        'Total (last month excluded from total)',
      ],
      [
        'Quarterly Partner',
        'PARTNER_FINANCIAL',
        450,
        'USD',
        'Quarterly',
        150,
        150,
        -0,
        500,
        'Jan 20 - Apr 20',
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        350,
        300,
        250,
        200,
        84,
      ],
      [
        'Annual Partner',
        'PARTNER_FINANCIAL',
        1200,
        'USD',
        'Annual',
        100,
        75,
        -25,
        0,
        'Jan 20 - Dec 20',
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
        84,
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
        1800,
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
});
