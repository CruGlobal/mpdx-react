import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { GetPartnerGivingAnalysisReportQuery } from './PartnerGivingAnalysisReport.generated';
import { PartnerGivingAnalysisReport } from './PartnerGivingAnalysisReport';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';

const accountListId = '111';
const title = 'test title';
const onNavListToggle = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => {
    return {
      query: { accountListId: 'abc' },
      isReady: true,
    };
  },
}));

type Mocks = {
  GetPartnerGivingAnalysisReport: GetPartnerGivingAnalysisReportQuery;
};

const mocks: Mocks = {
  GetPartnerGivingAnalysisReport: {
    partnerGivingAnalysisReport: {
      contacts: [
        {
          donationPeriodAverage: 88.468,
          donationPeriodCount: 176,
          donationPeriodSum: 15218.42,
          lastDonationAmount: 150,
          lastDonationCurrency: 'CAD',
          lastDonationDate: '2021-07-07',
          id: '01',
          name: 'Ababa, Aladdin und Jasmine (Princess)',
          pledgeCurrency: 'CAD',
          totalDonations: 25218.42,
        },
        {
          donationPeriodAverage: 71.4,
          donationPeriodCount: 127,
          donationPeriodSum: 13118.42,
          lastDonationAmount: 170.92,
          lastDonationCurrency: 'CAD',
          lastDonationDate: '2021-03-07',
          id: '02',
          name: 'Princess',
          pledgeCurrency: 'CAD',
          totalDonations: 13118.42,
        },
        {
          donationPeriodAverage: 86.4682954545454545,
          donationPeriodCount: 221,
          donationPeriodSum: 25218.42,
          lastDonationAmount: 150.92,
          lastDonationCurrency: 'CAD',
          lastDonationDate: '2021-08-07',
          id: '03',
          name: 'Jasmine (Princess)',
          pledgeCurrency: 'CAD',
          totalDonations: 25218.42,
        },
      ],
      pagination: {
        page: 1,
        pageSize: 10,
        totalItems: 120,
        totalPages: 12,
      },
      totalContacts: 300,
    },
  },
};

describe('PartnerGivingAnalysisReport', () => {
  it('loading', async () => {
    const { queryByTestId, queryByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<GetPartnerGivingAnalysisReportQuery>>
          <PartnerGivingAnalysisReport
            accountListId={accountListId}
            isNavListOpen={true}
            title={title}
            onNavListToggle={onNavListToggle}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    expect(queryByText(title)).toBeInTheDocument();
    expect(
      queryByTestId('LoadingPartnerGivingAnalysisReport'),
    ).toBeInTheDocument();
    expect(queryByTestId('Notification')).toBeNull();
  });

  it('loaded', async () => {
    const { getAllByTestId, getByTestId, queryByTestId, getByRole } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<GetPartnerGivingAnalysisReportQuery> mocks={mocks}>
          <PartnerGivingAnalysisReport
            accountListId={accountListId}
            isNavListOpen={true}
            title={title}
            onNavListToggle={onNavListToggle}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });

    expect(getByRole('table')).toBeInTheDocument();
    expect(getAllByTestId('PartnerGivingAnalysisReportTableRow').length).toBe(
      3,
    );
    expect(getByTestId('PartnerGivingAnalysisReport')).toBeInTheDocument();
  });

  it('nav list closed', async () => {
    const { getByTestId, queryByTestId, queryByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<GetPartnerGivingAnalysisReportQuery> mocks={mocks}>
          <PartnerGivingAnalysisReport
            accountListId={accountListId}
            isNavListOpen={false}
            title={title}
            onNavListToggle={onNavListToggle}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });

    expect(queryByText(title)).toBeInTheDocument();
    expect(getByTestId('PartnerGivingAnalysisReport')).toBeInTheDocument();
    expect(queryByTestId('ReportNavList')).toBeNull();
  });

  it('shows a placeholder when there are zero contacts', async () => {
    const mocksWithZeroContacts: Mocks = {
      GetPartnerGivingAnalysisReport: {
        partnerGivingAnalysisReport: {
          contacts: [],
          pagination:
            mocks.GetPartnerGivingAnalysisReport.partnerGivingAnalysisReport
              .pagination,
          totalContacts: 300,
        },
      },
    };
    const { queryByTestId, queryByText, queryByRole } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<GetPartnerGivingAnalysisReportQuery>
          mocks={mocksWithZeroContacts}
        >
          <PartnerGivingAnalysisReport
            accountListId={accountListId}
            isNavListOpen={true}
            title={title}
            onNavListToggle={onNavListToggle}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });

    expect(queryByRole('table')).not.toBeInTheDocument();
    expect(
      queryByText('You have {{contacts}} total contacts', { exact: false }),
    ).toBeInTheDocument();
  });

  it('fields are sortable', async () => {
    const mutationSpy = jest.fn();
    const { getByText, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<GetPartnerGivingAnalysisReportQuery>
          mocks={mocks}
          onCall={mutationSpy}
        >
          <PartnerGivingAnalysisReport
            accountListId={accountListId}
            isNavListOpen={false}
            title={title}
            onNavListToggle={onNavListToggle}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });

    userEvent.click(getByText('Gift Count'));
    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });
    expect(
      mutationSpy.mock.calls[1][0].operation.variables.input.sortField,
    ).toEqual('donationPeriodCount');
    expect(
      mutationSpy.mock.calls[1][0].operation.variables.input.sortDirection,
    ).toEqual('ASCENDING');

    userEvent.click(getByText('Gift Count'));
    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });
    expect(
      mutationSpy.mock.calls[2][0].operation.variables.input.sortField,
    ).toEqual('donationPeriodCount');
    expect(
      mutationSpy.mock.calls[2][0].operation.variables.input.sortDirection,
    ).toEqual('DESCENDING');

    userEvent.click(getByText('Gift Average'));
    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });
    expect(
      mutationSpy.mock.calls[3][0].operation.variables.input.sortField,
    ).toEqual('donationPeriodAverage');
    expect(
      mutationSpy.mock.calls[3][0].operation.variables.input.sortDirection,
    ).toEqual('ASCENDING');
  });

  it('filters contacts by name', async () => {
    const mutationSpy = jest.fn();
    const { getByPlaceholderText, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<GetPartnerGivingAnalysisReportQuery>
          mocks={mocks}
          onCall={mutationSpy}
        >
          <PartnerGivingAnalysisReport
            accountListId={accountListId}
            isNavListOpen={true}
            title={title}
            onNavListToggle={onNavListToggle}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });

    userEvent.type(getByPlaceholderText('Search contacts'), 'John');
    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });

    expect(
      mutationSpy.mock.calls[1][0].operation.variables.input.contactFilters,
    ).toEqual({ nameLike: '%John%' });
  });

  it('sets the pagination limit', async () => {
    const mutationSpy = jest.fn();
    const { getByRole, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<GetPartnerGivingAnalysisReportQuery>
          mocks={mocks}
          onCall={mutationSpy}
        >
          <PartnerGivingAnalysisReport
            accountListId={accountListId}
            isNavListOpen={true}
            title={title}
            onNavListToggle={onNavListToggle}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });

    userEvent.selectOptions(getByRole('combobox'), '50');
    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });

    expect(
      mutationSpy.mock.calls[1][0].operation.variables.input.pageSize,
    ).toBe(50);
  });

  it('selects and unselects all', async () => {
    const { getAllByRole, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<GetPartnerGivingAnalysisReportQuery> mocks={mocks}>
          <PartnerGivingAnalysisReport
            accountListId={accountListId}
            isNavListOpen={true}
            title={title}
            onNavListToggle={onNavListToggle}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });

    // Select one
    userEvent.click(getAllByRole('checkbox')[1]);
    expect(getAllByRole('checkbox')[1]).toBeChecked();
    expect(getAllByRole('checkbox')[0].dataset.indeterminate).toBe('true');

    // Select all
    userEvent.click(getAllByRole('checkbox')[0]);
    expect(getAllByRole('checkbox')[1]).toBeChecked();
    expect(getAllByRole('checkbox')[2]).toBeChecked();
    expect(getAllByRole('checkbox')[3]).toBeChecked();

    // Deselect one
    userEvent.click(getAllByRole('checkbox')[1]);
    expect(getAllByRole('checkbox')[0].dataset.indeterminate).toBe('true');

    // Deselect all
    userEvent.click(getAllByRole('checkbox')[0]);
    userEvent.click(getAllByRole('checkbox')[0]);
    expect(getAllByRole('checkbox')[1]).not.toBeChecked();
    expect(getAllByRole('checkbox')[2]).not.toBeChecked();
    expect(getAllByRole('checkbox')[3]).not.toBeChecked();

    // Select all individually
    userEvent.click(getAllByRole('checkbox')[1]);
    userEvent.click(getAllByRole('checkbox')[2]);
    userEvent.click(getAllByRole('checkbox')[3]);
    expect(getAllByRole('checkbox')[0]).toBeChecked();

    // Deselect all individually
    userEvent.click(getAllByRole('checkbox')[1]);
    userEvent.click(getAllByRole('checkbox')[2]);
    userEvent.click(getAllByRole('checkbox')[3]);
    expect(getAllByRole('checkbox')[0]).not.toBeChecked();
  });

  it('formats currencies', async () => {
    const mutationSpy = jest.fn();
    const { getByText, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<GetPartnerGivingAnalysisReportQuery>
          mocks={mocks}
          onCall={mutationSpy}
        >
          <PartnerGivingAnalysisReport
            accountListId={accountListId}
            isNavListOpen={true}
            title={title}
            onNavListToggle={onNavListToggle}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });

    // Test that it adds commas
    expect(getByText('15,218.42 CAD')).toBeInTheDocument();

    // Test that it adds two decimal points
    expect(getByText('150.00 CAD')).toBeInTheDocument();

    // Test that it rounds to two decimal points
    expect(getByText('86.47 CAD')).toBeInTheDocument();
  });
});
