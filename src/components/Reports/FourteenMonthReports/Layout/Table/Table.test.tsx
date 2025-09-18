import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, renderHook, waitFor, within } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { gqlMock } from '__tests__/util/graphqlMocking';
import { ContactPanelProvider } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import theme from 'src/theme';
import { FourteenMonthReportCurrencyType } from '../../FourteenMonthReport';
import {
  GetFourteenMonthReportDocument,
  GetFourteenMonthReportQuery,
  GetFourteenMonthReportQueryVariables,
} from '../../GetFourteenMonthReport.generated';
import { useFourteenMonthReport } from '../../useFourteenMonthReport';
import { FourteenMonthReportTable } from './Table';
import { OrderBy } from './TableHead/TableHead';

// Use gqlMock to create test data for table tests
const mockGraphQLData = gqlMock<
  GetFourteenMonthReportQuery,
  GetFourteenMonthReportQueryVariables
>(GetFourteenMonthReportDocument, {
  variables: {
    accountListId: 'account-list-1',
    range: '13m',
    designationAccountId: null,
  },
  mocks: {
    reportsSalaryCurrencyDonations: {
      months: ['2018-12', '2019-01', '2019-02', '2019-03'],
      currencyGroups: {
        CAD: {
          totals: {
            months: [100, 100, 100, 100],
          },
          donation_infos: [
            {
              contact_id: 'contact-1',
              total: 150,
              average: 25,
              minimum: 50,
              complete_months_total: 150,
              months: [
                { total: 50, donations: [{ converted_amount: 50 }] },
                { total: 50, donations: [{ converted_amount: 50 }] },
                { total: 50, donations: [{ converted_amount: 50 }] },
                { total: 0, donations: [] },
              ],
            },
            {
              contact_id: 'contact-2',
              total: 150,
              average: 25,
              minimum: 50,
              complete_months_total: 150,
              months: [
                { total: 50, donations: [{ converted_amount: 50 }] },
                { total: 50, donations: [{ converted_amount: 50 }] },
                { total: 50, donations: [{ converted_amount: 50 }] },
                { total: 0, donations: [] },
              ],
            },
          ],
        },
      },
      donorInfos: [
        {
          contactId: 'contact-1',
          contactName: 'test name',
          lateBy60Days: true,
          pledgeAmount: '100',
          pledgeCurrency: 'CAD',
          pledgeFrequency: 'Monthly',
        },
        {
          contactId: 'contact-2',
          contactName: 'test name',
          pledgeAmount: '100',
          pledgeCurrency: 'CAD',
          pledgeFrequency: 'Monthly',
        },
      ],
    },
    reportsDonorCurrencyDonations: {
      months: ['2018-12', '2019-01', '2019-02', '2019-03'],
      currencyGroups: {
        CAD: {
          totals: {
            months: [100, 100, 100, 100],
          },
          donation_infos: [
            {
              contact_id: 'contact-1',
              total: 150,
              average: 25,
              minimum: 50,
              complete_months_total: 150,
              months: [
                { total: 50, donations: [{ converted_amount: 50 }] },
                { total: 50, donations: [{ converted_amount: 50 }] },
                { total: 50, donations: [{ converted_amount: 50 }] },
                { total: 0, donations: [] },
              ],
            },
            {
              contact_id: 'contact-2',
              total: 150,
              average: 25,
              minimum: 50,
              complete_months_total: 150,
              months: [
                { total: 50, donations: [{ converted_amount: 50 }] },
                { total: 50, donations: [{ converted_amount: 50 }] },
                { total: 50, donations: [{ converted_amount: 50 }] },
                { total: 0, donations: [] },
              ],
            },
          ],
        },
      },
      donorInfos: [
        {
          contactId: 'contact-1',
          contactName: 'test name',
          lateBy60Days: true,
          pledgeAmount: '100',
          pledgeCurrency: 'CAD',
          pledgeFrequency: 'Monthly',
        },
        {
          contactId: 'contact-2',
          contactName: 'test name',
          pledgeAmount: '100',
          pledgeCurrency: 'CAD',
          pledgeFrequency: 'Monthly',
        },
      ],
    },
  },
});

// Mock the GraphQL hook to return our test data
jest.mock('../../GetFourteenMonthReport.generated', () => ({
  ...jest.requireActual('../../GetFourteenMonthReport.generated'),
  useGetFourteenMonthReportQuery: jest.fn(() => ({
    data: mockGraphQLData,
    loading: false,
    error: null,
  })),
}));

const { result } = renderHook(() =>
  useFourteenMonthReport(
    'account-list-1',
    FourteenMonthReportCurrencyType.Salary,
    [],
  ),
);
const transformedData = () => result.current.fourteenMonthReport;

const router = {
  pathname:
    '/accountLists/[accountListId]/reports/salaryCurrency/[[...contactId]]',
  query: {
    accountListId: 'account-list-1',
  },
  isReady: true,
  push: jest.fn(),
};
const onRequestSort = jest.fn();

interface ComponentsProps {
  orderBy?: OrderBy | null;
}
const Components: React.FC<ComponentsProps> = ({ orderBy = 'name' }) => {
  const mocks = transformedData();
  const getTotals = () => mocks?.currencyGroups[0].totals.months || [];

  return (
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <ContactPanelProvider>
          <FourteenMonthReportTable
            isExpanded={true}
            order="asc"
            orderBy={orderBy}
            orderedContacts={mocks?.currencyGroups[0].contacts || []}
            salaryCurrency={mocks?.currencyGroups[0].currency || 'CAD'}
            onRequestSort={onRequestSort}
            totals={getTotals()}
          />
        </ContactPanelProvider>
      </TestRouter>
    </ThemeProvider>
  );
};

describe('FourteenMonthReportTable', () => {
  it('default', async () => {
    const { getAllByTestId, getByRole, queryByTestId } = render(
      <Components orderBy={null} />,
    );

    await waitFor(() => {
      expect(queryByTestId('Loading')).not.toBeInTheDocument();
    });

    expect(getByRole('table')).toBeInTheDocument();
    expect(getAllByTestId('FourteenMonthReportTableRow')).toHaveLength(2);
    expect(queryByTestId('FourteenMonthReport')).toBeInTheDocument();
    const contactTotal = getAllByTestId('totalGivenByContact');
    expect(contactTotal[0]).toHaveTextContent('150');
  });

  it('should order by name', async () => {
    const { getAllByTestId, queryByTestId } = render(<Components />);

    await waitFor(() => {
      expect(queryByTestId('Loading')).not.toBeInTheDocument();
    });

    const fourteenMonthReportRows = getAllByTestId(
      'FourteenMonthReportTableRow',
    );
    expect(fourteenMonthReportRows).toHaveLength(2);
    expect(fourteenMonthReportRows[0]).toHaveTextContent('test name');
    expect(fourteenMonthReportRows[1]).toHaveTextContent('test name');
    expect(queryByTestId('FourteenMonthReport')).toBeInTheDocument();
  });

  it('should show late indicators when contacts are late', async () => {
    const { getAllByTestId, queryByTestId } = render(<Components />);

    await waitFor(() => {
      expect(queryByTestId('Loading')).not.toBeInTheDocument();
    });

    const fourteenMonthReportRows = getAllByTestId(
      'FourteenMonthReportTableRow',
    );
    expect(
      within(fourteenMonthReportRows[0]).getByTestId('lateCircle60'),
    ).toBeInTheDocument();
  });

  it('can make contact click event happen and pledge amount is correct', async () => {
    const { queryByTestId, getAllByTestId } = render(<Components />);

    await waitFor(() => {
      expect(queryByTestId('Loading')).not.toBeInTheDocument();
    });

    const links = getAllByTestId('totalGivenByContact');
    expect(links[1]).toHaveTextContent('150');

    await waitFor(() => {
      expect(getAllByTestId('pledgeAmount')[1]).toHaveTextContent('100 CAD');
    });
  });

  it('should calculate the correct monthly totals', async () => {
    const { queryByTestId, getByTestId, getAllByTestId } = render(
      <Components />,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingFourteenMonthReport'),
      ).not.toBeInTheDocument();
    });

    const contactTotal = getAllByTestId('monthlyTotals');
    expect(contactTotal[0]).toHaveTextContent('100');
    expect(contactTotal[1]).toHaveTextContent('100');
    expect(contactTotal[2]).toHaveTextContent('100');
    expect(contactTotal[3]).toHaveTextContent('100');

    expect(getByTestId('averageTotal')).toHaveTextContent('50');
    expect(getByTestId('minimumTotal')).toHaveTextContent('100');
    expect(getAllByTestId('overallTotal')[0]).toHaveTextContent('300');
  });
});
