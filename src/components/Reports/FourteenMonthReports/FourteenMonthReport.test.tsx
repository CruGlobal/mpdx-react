import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor, within } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider, gqlMock } from '__tests__/util/graphqlMocking';
import { ContactPanelProvider } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import theme from 'src/theme';
import {
  FourteenMonthReport,
  FourteenMonthReportCurrencyType,
} from './FourteenMonthReport';
import {
  GetFourteenMonthReportDocument,
  GetFourteenMonthReportQuery,
  GetFourteenMonthReportQueryVariables,
} from './GetFourteenMonthReport.generated';
import { useFourteenMonthReport } from './useFourteenMonthReport';

const accountListId = '111';
const title = 'test title';
const onNavListToggle = jest.fn();

const mutationSpy = jest.fn();

interface TestComponentProps {
  currencyType: FourteenMonthReportCurrencyType;
  isNavListOpen?: boolean;
  designationAccounts?: string[];
}

const createMockGraphQLData = (fetchSalaryReport: boolean) =>
  gqlMock<GetFourteenMonthReportQuery, GetFourteenMonthReportQueryVariables>(
    GetFourteenMonthReportDocument,
    {
      variables: {
        range: '13m',
        designationAccountId: null,
        accountListId,
        fetchSalaryReport,
      },
      mocks: {
        reportsSalaryCurrencyDonations: {
          months: ['2018-12', '2019-01', '2019-02', '2019-03'],
          currencyGroups: {
            CAD: {
              totals: {
                months: ['100', '100', '100', '100'],
              },
              donation_infos: [
                {
                  contact_id: 'contact-1',
                  months: [
                    {
                      total: '50',
                      donations: [],
                    },
                    {
                      total: '50',
                      donations: [],
                    },
                    {
                      total: '50',
                      donations: [],
                    },
                    {
                      total: '50',
                      donations: [],
                    },
                  ],
                },
                {
                  contact_id: 'contact-2',
                  months: [
                    {
                      total: '50',
                      donations: [],
                    },
                    {
                      total: '50',
                      donations: [],
                    },
                    {
                      total: '50',
                      donations: [],
                    },
                    {
                      total: '50',
                      donations: [],
                    },
                  ],
                },
              ],
            },
            USD: {
              totals: {
                months: ['50', '50', '50', '50'],
              },
              donation_infos: [
                {
                  contact_id: 'contact-3',
                  months: [
                    {
                      total: '50',
                      donations: [],
                    },
                    {
                      total: '50',
                      donations: [],
                    },
                    {
                      total: '50',
                      donations: [],
                    },
                    {
                      total: '50',
                      donations: [],
                    },
                  ],
                },
              ],
            },
          },
          donorInfos: [
            { contactId: 'contact-1', contactName: 'test name' },
            { contactId: 'contact-2', contactName: 'test name' },
            { contactId: 'contact-3', contactName: 'test name' },
          ],
        },
        reportsDonorCurrencyDonations: {
          months: ['2018-12', '2019-01', '2019-02', '2019-03'],
          currencyGroups: {
            CAD: {
              totals: {
                months: [],
              },
              donation_infos: [
                {
                  contact_id: 'contact-1',
                  months: [
                    {
                      total: '50',
                      donations: [],
                    },
                    {
                      total: '50',
                      donations: [],
                    },
                    {
                      total: '50',
                      donations: [],
                    },
                    {
                      total: '50',
                      donations: [],
                    },
                  ],
                },
                {
                  contact_id: 'contact-2',
                  months: [
                    {
                      total: '50',
                      donations: [],
                    },
                    {
                      total: '50',
                      donations: [],
                    },
                    {
                      total: '50',
                      donations: [],
                    },
                    {
                      total: '50',
                      donations: [],
                    },
                  ],
                },
              ],
            },
            USD: {
              totals: {
                months: [],
              },
              donation_infos: [
                {
                  contact_id: 'contact-3',
                  months: [
                    {
                      total: '20',
                      donations: [],
                    },
                    {
                      total: '20',
                      donations: [],
                    },
                    {
                      total: '20',
                      donations: [],
                    },
                    {
                      total: '20',
                      donations: [],
                    },
                  ],
                },
              ],
            },
          },
          donorInfos: [
            { contactId: 'contact-1', contactName: 'test name' },
            { contactId: 'contact-2', contactName: 'test name' },
            { contactId: 'contact-3', contactName: 'test name' },
          ],
        },
      },
    },
  );

const salaryMock = createMockGraphQLData(true);
const donorMock = createMockGraphQLData(false);

jest.mock('./useFourteenMonthReport', () => ({
  useFourteenMonthReport: jest.fn(),
}));

const TestComponent: React.FC<TestComponentProps> = ({
  currencyType,
  isNavListOpen = true,
  designationAccounts,
}) => (
  <TestRouter
    router={{
      pathname:
        '/accountLists/[accountListId]/reports/salaryCurrency/[[...contactId]]',
      query: {
        accountListId,
      },
    }}
  >
    <ThemeProvider theme={theme}>
      <ContactPanelProvider>
        <GqlMockedProvider
          mocks={
            currencyType === FourteenMonthReportCurrencyType.Salary
              ? { GetFourteenMonthReport: salaryMock }
              : { GetFourteenMonthReport: donorMock }
          }
          onCall={mutationSpy}
        >
          <FourteenMonthReport
            accountListId={accountListId}
            title={title}
            onNavListToggle={onNavListToggle}
            currencyType={currencyType}
            isNavListOpen={isNavListOpen}
            designationAccounts={designationAccounts}
          />
        </GqlMockedProvider>
      </ContactPanelProvider>
    </ThemeProvider>
  </TestRouter>
);

describe('FourteenMonthReport', () => {
  beforeEach(() => {
    // Use the actual hook implementation with mocked GraphQL provider
    (useFourteenMonthReport as jest.Mock).mockImplementation(
      jest.requireActual('./useFourteenMonthReport').useFourteenMonthReport,
    );
  });

  it('shows salary report loaded', async () => {
    const { queryByTestId, getAllByRole: getTestAllByRole } = render(
      <TestComponent currencyType={FourteenMonthReportCurrencyType.Salary} />,
    );

    await waitFor(() => {
      expect(queryByTestId('Loading')).not.toBeInTheDocument();
    });

    expect(getTestAllByRole('table')).toHaveLength(2);
  });

  it('shows salary report loading', async () => {
    const { getByTestId, queryByTestId } = render(
      <TestComponent currencyType={FourteenMonthReportCurrencyType.Salary} />,
    );

    expect(getByTestId('Loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(queryByTestId('Loading')).not.toBeInTheDocument();
    });
  });

  it('partner report loading', async () => {
    const { getByTestId, getByText, queryByTestId } = render(
      <TestComponent currencyType={FourteenMonthReportCurrencyType.Donor} />,
    );

    expect(getByText(title)).toBeInTheDocument();
    expect(getByTestId('Loading')).toBeInTheDocument();
    expect(queryByTestId('Notification')).not.toBeInTheDocument();
  });

  it('partner report loaded', async () => {
    const {
      queryByTestId,
      getByText,
      getAllByRole: getTestAllByRole,
    } = render(
      <TestComponent currencyType={FourteenMonthReportCurrencyType.Donor} />,
    );

    await waitFor(() => {
      expect(queryByTestId('Loading')).not.toBeInTheDocument();
    });

    expect(getByText(title)).toBeInTheDocument();
    expect(
      getTestAllByRole('table', { name: 'Fourteen month report table' }),
    ).toHaveLength(2);
  });

  describe('Errors', () => {
    it('salary report error', async () => {
      const { queryByTestId, getByTestId, getByText } = render(
        <TestComponent
          currencyType={FourteenMonthReportCurrencyType.Salary}
          // Force an error by passing invalid designation account
          designationAccounts={[null as unknown as string]}
        />,
      );

      await waitFor(() => {
        expect(queryByTestId('Loading')).not.toBeInTheDocument();
      });

      expect(getByText(title)).toBeInTheDocument();
      expect(getByTestId('Notification')).toBeInTheDocument();
    });

    it('partner report error', async () => {
      const { queryByTestId, getByTestId, getByText } = render(
        <TestComponent
          currencyType={FourteenMonthReportCurrencyType.Donor}
          // Force an error by passing invalid designation account
          designationAccounts={[null as unknown as string]}
        />,
      );

      await waitFor(() => {
        expect(queryByTestId('Loading')).not.toBeInTheDocument();
      });

      expect(getByText(title)).toBeInTheDocument();
      expect(getByTestId('Notification')).toBeInTheDocument();
    });
  });

  it('nav list closed', async () => {
    const { getAllByTestId, getByText, queryByTestId } = render(
      <TestComponent
        currencyType={FourteenMonthReportCurrencyType.Donor}
        isNavListOpen={false}
      />,
    );

    await waitFor(() => {
      expect(queryByTestId('Loading')).not.toBeInTheDocument();
    });

    expect(getByText(title)).toBeInTheDocument();
    expect(getAllByTestId('FourteenMonthReport')).toHaveLength(2);
    expect(queryByTestId('MultiPageMenu')).not.toBeInTheDocument();
  });

  it('filters report by designation account', async () => {
    const designationAccount = 'account-1';

    render(
      <TestComponent
        currencyType={FourteenMonthReportCurrencyType.Donor}
        isNavListOpen={false}
        designationAccounts={[designationAccount]}
      />,
    );

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('GetFourteenMonthReport', {
        accountListId: '111',
        range: '13m',
        designationAccountId: [designationAccount],
      }),
    );
  });

  it('does not filter report by designation account', async () => {
    render(
      <TestComponent
        currencyType={FourteenMonthReportCurrencyType.Donor}
        isNavListOpen={false}
      />,
    );

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('GetFourteenMonthReport', {
        accountListId: '111',
        range: '13m',
        designationAccountId: null,
        fetchSalaryReport: false,
      }),
    );
  });

  it('can click on a contact name', async () => {
    const { findAllByRole, queryByTestId } = render(
      <TestComponent currencyType={FourteenMonthReportCurrencyType.Donor} />,
    );

    await waitFor(() => {
      expect(queryByTestId('Loading')).not.toBeInTheDocument();
    });

    const contactLinks = await findAllByRole('link', { name: 'test name' });
    expect(contactLinks[0]).toHaveAttribute(
      'href',
      '/accountLists/111/reports/salaryCurrency/contact-1',
    );
  });

  describe('partner report', () => {
    it('should render one table for each partner currency', async () => {
      const { findAllByRole } = render(
        <TestComponent currencyType={FourteenMonthReportCurrencyType.Donor} />,
      );

      const tables = await findAllByRole('table', {
        name: 'Fourteen month report table',
      });
      expect(tables).toHaveLength(2);

      expect(
        within(tables[0]).getByRole('heading', { name: 'CAD' }),
      ).toBeInTheDocument();
      const table1MonthlyTotals = within(tables[0]).getAllByTestId(
        'monthlyTotals',
      );
      // There are 2 contacts in this table who each gave 50
      expect(table1MonthlyTotals[0]).toHaveTextContent('100');
      expect(table1MonthlyTotals[1]).toHaveTextContent('100');
      expect(table1MonthlyTotals[2]).toHaveTextContent('100');
      expect(table1MonthlyTotals[3]).toHaveTextContent('100');
      expect(within(tables[0]).getByTestId('overallTotal')).toHaveTextContent(
        '300',
      );

      expect(
        within(tables[1]).getByRole('heading', { name: 'USD' }),
      ).toBeInTheDocument();
      const table2MonthlyTotals = within(tables[1]).getAllByTestId(
        'monthlyTotals',
      );
      // There is 1 contact in this table who gave 20
      expect(table2MonthlyTotals[0]).toHaveTextContent('20');
      expect(table2MonthlyTotals[1]).toHaveTextContent('20');
      expect(table2MonthlyTotals[2]).toHaveTextContent('20');
      expect(table2MonthlyTotals[3]).toHaveTextContent('20');
      expect(within(tables[1]).getByTestId('overallTotal')).toHaveTextContent(
        '60',
      );
    });
  });
});
