import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor, within } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactPanelProvider } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import theme from 'src/theme';
import {
  FourteenMonthReport,
  FourteenMonthReportCurrencyType,
} from './FourteenMonthReport';
import { defaultFourteenMonthReport } from './FourteenMonthReportMock';
import { useFourteenMonthReport } from './useFourteenMonthReport';

const accountListId = '111';
const title = 'test title';
const onNavListToggle = jest.fn();

interface TestComponentProps {
  currencyType: FourteenMonthReportCurrencyType;
  isNavListOpen?: boolean;
  designationAccounts?: string[];
}

jest.mock('./useFourteenMonthReport', () => ({
  useFourteenMonthReport: jest.fn(() => ({
    fourteenMonthReport: defaultFourteenMonthReport,
    loading: false,
    error: null,
  })),
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
        <GqlMockedProvider>
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
    (useFourteenMonthReport as jest.Mock).mockReturnValue({
      fourteenMonthReport: defaultFourteenMonthReport,
      loading: false,
      error: null,
    });
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

  it('shows salary report loading', () => {
    // Override the mock for this specific test
    (useFourteenMonthReport as jest.Mock).mockReturnValue({
      fourteenMonthReport: null,
      loading: true,
      error: null,
    });

    const { getByTestId } = render(
      <TestComponent currencyType={FourteenMonthReportCurrencyType.Salary} />,
    );

    expect(getByTestId('Loading')).toBeInTheDocument();
  });

  it('partner report loading', async () => {
    (useFourteenMonthReport as jest.Mock).mockReturnValue({
      fourteenMonthReport: null,
      loading: true,
      error: null,
    });
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
      (useFourteenMonthReport as jest.Mock).mockReturnValue({
        fourteenMonthReport: null,
        loading: null,
        error: true,
      });
      const { queryByTestId, getByTestId, getByText } = render(
        <TestComponent currencyType={FourteenMonthReportCurrencyType.Salary} />,
      );

      await waitFor(() => {
        expect(queryByTestId('Loading')).not.toBeInTheDocument();
      });

      expect(getByText(title)).toBeInTheDocument();
      expect(getByTestId('Notification')).toBeInTheDocument();
    });

    it('partner report error', async () => {
      (useFourteenMonthReport as jest.Mock).mockReturnValue({
        fourteenMonthReport: null,
        loading: null,
        error: true,
      });
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

  // it('filters report by designation account', async () => {
  //   const designationAccount = 'account-1';
  //   render(
  //     <TestComponent
  //       currencyType={FourteenMonthReportCurrencyType.Donor}
  //       isNavListOpen={false}
  //       designationAccounts={[designationAccount]}
  //     />,
  // );

  //   await waitFor(() =>
  //     expect(fetchMock).toHaveBeenCalledWith(
  //       `https://api.stage.mpdx.org/api/v2/reports/donor_currency_donations?filter[account_list_id]=111&filter[designation_account_id]=${designationAccount}&filter[month_range]=2018-12-01...2020-01-01`,
  //       {
  //         headers: {
  //           'Content-Type': 'application/vnd.api+json',
  //           authorization: 'Bearer apiToken',
  //         },
  //       },
  //     ),
  //   );
  // });

  // it('does not filter report by designation account', async () => {
  //   render(
  //     <TestComponent
  //       currencyType={FourteenMonthReportCurrencyType.Donor}
  //       isNavListOpen={false}
  //     />,
  //   );

  //   await waitFor(() =>
  //     expect(fetchMock).toHaveBeenCalledWith(
  //       'https://api.stage.mpdx.org/api/v2/reports/donor_currency_donations?filter[account_list_id]=111&filter[month_range]=2018-12-01...2020-01-01',
  //       {
  //         headers: {
  //           'Content-Type': 'application/vnd.api+json',
  //           authorization: 'Bearer apiToken',
  //         },
  //       },
  //     ),
  //   );
  // });

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
