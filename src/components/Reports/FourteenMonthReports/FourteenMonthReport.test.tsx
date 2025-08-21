import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor, within } from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';
import TestRouter from '__tests__/util/TestRouter';
import { ContactPanelProvider } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import { FourteenMonthReportCurrencyType } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { FourteenMonthReport } from './FourteenMonthReport';
import { fourteenMonthReportRestMock } from './FourteenMonthReportMock';

const accountListId = '111';
const title = 'test title';
const onNavListToggle = jest.fn();

interface TestComponentProps {
  currencyType: FourteenMonthReportCurrencyType;
  isNavListOpen?: boolean;
  designationAccounts?: string[];
}

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
        <FourteenMonthReport
          accountListId={accountListId}
          title={title}
          onNavListToggle={onNavListToggle}
          currencyType={currencyType}
          isNavListOpen={isNavListOpen}
          designationAccounts={designationAccounts}
        />
      </ContactPanelProvider>
    </ThemeProvider>
  </TestRouter>
);

describe('FourteenMonthReport', () => {
  fetchMock.enableMocks();
  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.mockResponses([
      JSON.stringify(fourteenMonthReportRestMock),
      { status: 200 },
    ]);
    process.env.REST_API_URL = 'https://api.stage.mpdx.org/api/v2/';
  });

  it('salary report loading', async () => {
    const { getByTestId, getByText, queryByTestId } = render(
      <TestComponent currencyType={FourteenMonthReportCurrencyType.Salary} />,
    );

    expect(getByText(title)).toBeInTheDocument();
    expect(getByTestId('LoadingFourteenMonthReport')).toBeInTheDocument();
    expect(queryByTestId('Notification')).not.toBeInTheDocument();
  });

  it('salary report loaded', async () => {
    const { getAllByTestId, queryByTestId, getAllByRole } = render(
      <TestComponent currencyType={FourteenMonthReportCurrencyType.Salary} />,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingFourteenMonthReport'),
      ).not.toBeInTheDocument();
    });

    expect(getAllByRole('table')).toHaveLength(2);
    expect(getAllByTestId('FourteenMonthReportTableRow')).toHaveLength(3);
    expect(getAllByTestId('FourteenMonthReport')).toHaveLength(2);
  });

  it('partner report loading', async () => {
    const { getByTestId, getByText, queryByTestId } = render(
      <TestComponent currencyType={FourteenMonthReportCurrencyType.Donor} />,
    );

    expect(getByText(title)).toBeInTheDocument();
    expect(getByTestId('LoadingFourteenMonthReport')).toBeInTheDocument();
    expect(queryByTestId('Notification')).not.toBeInTheDocument();
  });

  it('partner report loaded', async () => {
    const { getAllByTestId, queryByTestId, getByText } = render(
      <TestComponent currencyType={FourteenMonthReportCurrencyType.Donor} />,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingFourteenMonthReport'),
      ).not.toBeInTheDocument();
    });

    expect(getByText(title)).toBeInTheDocument();
    expect(getAllByTestId('FourteenMonthReport')).toHaveLength(2);
  });

  describe('Errors', () => {
    beforeEach(() => {
      fetchMock.resetMocks();
      fetchMock.mockReject(new Error('Error loading data.  Try again.'));
    });

    it('salary report error', async () => {
      const { queryByTestId, getByTestId, getByText } = render(
        <TestComponent currencyType={FourteenMonthReportCurrencyType.Salary} />,
      );

      await waitFor(() => {
        expect(
          queryByTestId('LoadingFourteenMonthReport'),
        ).not.toBeInTheDocument();
      });

      expect(getByText(title)).toBeInTheDocument();
      expect(getByTestId('Notification')).toBeInTheDocument();
    });

    it('partner report error', async () => {
      const { queryByTestId, getByTestId, getByText } = render(
        <TestComponent currencyType={FourteenMonthReportCurrencyType.Donor} />,
      );

      await waitFor(() => {
        expect(
          queryByTestId('LoadingFourteenMonthReport'),
        ).not.toBeInTheDocument();
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
      expect(
        queryByTestId('LoadingFourteenMonthReport'),
      ).not.toBeInTheDocument();
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
      expect(fetchMock).toHaveBeenCalledWith(
        `https://api.stage.mpdx.org/api/v2/reports/donor_currency_donations?filter[account_list_id]=111&filter[designation_account_id]=${designationAccount}&filter[month_range]=2018-12-01...2020-01-01`,
        {
          headers: {
            'Content-Type': 'application/vnd.api+json',
            authorization: 'Bearer apiToken',
          },
        },
      ),
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
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.stage.mpdx.org/api/v2/reports/donor_currency_donations?filter[account_list_id]=111&filter[month_range]=2018-12-01...2020-01-01',
        {
          headers: {
            'Content-Type': 'application/vnd.api+json',
            authorization: 'Bearer apiToken',
          },
        },
      ),
    );
  });

  it('can click on a contact name', async () => {
    const { findAllByRole, queryByTestId } = render(
      <TestComponent currencyType={FourteenMonthReportCurrencyType.Donor} />,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingFourteenMonthReport'),
      ).not.toBeInTheDocument();
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
      // There is 1 contact in this table who gave 50
      expect(table2MonthlyTotals[0]).toHaveTextContent('50');
      expect(table2MonthlyTotals[1]).toHaveTextContent('50');
      expect(table2MonthlyTotals[2]).toHaveTextContent('50');
      expect(table2MonthlyTotals[3]).toHaveTextContent('50');
      expect(within(tables[1]).getByTestId('overallTotal')).toHaveTextContent(
        '150',
      );
    });
  });
});
