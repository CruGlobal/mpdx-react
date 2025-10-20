import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactPanelProvider } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import { UrlFiltersProvider } from 'src/components/common/UrlFiltersProvider/UrlFiltersProvider';
import { GetPartnerGivingAnalysisIdsForMassSelectionQuery } from 'src/hooks/GetIdsForMassSelection.generated';
import theme from 'src/theme';
import { PartnerGivingAnalysisQuery } from './PartnerGivingAnalysis.generated';
import { PartnerGivingAnalysisReport } from './PartnerGivingAnalysisReport';

const accountListId = '111';
const title = 'test title';
const onNavListToggle = jest.fn();
const onFilterListToggle = jest.fn();

const mockEnqueue = jest.fn();
const mutationSpy = jest.fn();

jest.mock('notistack', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue,
    };
  },
}));

const router = {
  query: { accountListId: 'abc' },
  isReady: true,
};

interface TestComponentProps {
  noContacts?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  noContacts = false,
}) => (
  <TestRouter router={router}>
    <ThemeProvider theme={theme}>
      <GqlMockedProvider<{
        GetPartnerGivingAnalysis: PartnerGivingAnalysisQuery;
      }>
        mocks={
          noContacts
            ? {
                GetPartnerGivingAnalysis: {
                  partnerGivingAnalysis: {
                    nodes: [],
                    pageInfo: {
                      endCursor: null,
                      hasNextPage: false,
                    },
                    edges: [],
                    totalCount: 300,
                    totalPageCount: 0,
                  },
                },
              }
            : mocks
        }
        onCall={mutationSpy}
      >
        <ContactPanelProvider>
          <UrlFiltersProvider>
            <PartnerGivingAnalysisReport
              accountListId={accountListId}
              title={title}
              panelOpen={null}
              onNavListToggle={onNavListToggle}
              onFilterListToggle={onFilterListToggle}
            />
          </UrlFiltersProvider>
        </ContactPanelProvider>
      </GqlMockedProvider>
    </ThemeProvider>
  </TestRouter>
);

type Mocks = {
  GetPartnerGivingAnalysis: PartnerGivingAnalysisQuery;
  GetPartnerGivingAnalysisIdsForMassSelection?: GetPartnerGivingAnalysisIdsForMassSelectionQuery;
};

const mocks: Mocks = {
  GetPartnerGivingAnalysis: {
    partnerGivingAnalysis: {
      nodes: [
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
          donationPeriodAverage: 86.4684354186,
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
        {
          donationPeriodAverage: 86.46,
          donationPeriodCount: 221,
          donationPeriodSum: 25218.42,
          lastDonationAmount: 150.92,
          lastDonationCurrency: 'CAD',
          lastDonationDate: '2021-08-07',
          id: '04',
          name: 'Jasmine (Princess)',
          pledgeCurrency: 'CAD',
          totalDonations: 25218.42,
        },
        {
          donationPeriodAverage: 86.46,
          donationPeriodCount: 221,
          donationPeriodSum: 25218.42,
          lastDonationAmount: 150.92,
          lastDonationCurrency: 'CAD',
          lastDonationDate: '2021-08-07',
          id: '05',
          name: 'Jasmine (Princess)',
          pledgeCurrency: 'CAD',
          totalDonations: 25218.42,
        },
        {
          donationPeriodAverage: 86.46,
          donationPeriodCount: 221,
          donationPeriodSum: 25218.42,
          lastDonationAmount: 150.92,
          lastDonationCurrency: 'CAD',
          lastDonationDate: '2021-08-07',
          id: '06',
          name: 'Jasmine (Princess)',
          pledgeCurrency: 'CAD',
          totalDonations: 25218.42,
        },
        {
          donationPeriodAverage: 86.46,
          donationPeriodCount: 221,
          donationPeriodSum: 25218.42,
          lastDonationAmount: 150.92,
          lastDonationCurrency: 'CAD',
          lastDonationDate: '2021-08-07',
          id: '07',
          name: 'Jasmine (Princess)',
          pledgeCurrency: 'CAD',
          totalDonations: 25218.42,
        },
        {
          donationPeriodAverage: 86.46,
          donationPeriodCount: 221,
          donationPeriodSum: 25218.42,
          lastDonationAmount: 150.92,
          lastDonationCurrency: 'CAD',
          lastDonationDate: '2021-08-07',
          id: '08',
          name: 'Jasmine (Princess)',
          pledgeCurrency: 'CAD',
          totalDonations: 25218.42,
        },
        {
          donationPeriodAverage: 86.46,
          donationPeriodCount: 221,
          donationPeriodSum: 25218.42,
          lastDonationAmount: 150.92,
          lastDonationCurrency: 'CAD',
          lastDonationDate: '2021-08-07',
          id: '09',
          name: 'Jasmine (Princess)',
          pledgeCurrency: 'CAD',
          totalDonations: 25218.42,
        },
        {
          donationPeriodAverage: 86.46,
          donationPeriodCount: 221,
          donationPeriodSum: 25218.42,
          lastDonationAmount: 150.92,
          lastDonationCurrency: 'CAD',
          lastDonationDate: '2021-08-07',
          id: '10',
          name: 'Jasmine (Princess)',
          pledgeCurrency: 'CAD',
          totalDonations: 25218.42,
        },
        {
          donationPeriodAverage: 86.46,
          donationPeriodCount: 221,
          donationPeriodSum: 25218.42,
          lastDonationAmount: 150.92,
          lastDonationCurrency: 'CAD',
          lastDonationDate: '2021-08-07',
          id: '11',
          name: 'Jasmine (Princess)',
          pledgeCurrency: 'CAD',
          totalDonations: 25218.42,
        },
      ],
      pageInfo: {
        endCursor: 'endCursor',
        hasNextPage: true,
      },
      edges: [],
      totalCount: 11,
      totalPageCount: 2,
    },
  },
  GetPartnerGivingAnalysisIdsForMassSelection: {
    partnerGivingAnalysis: {
      nodes: [
        { id: '01' },
        { id: '02' },
        { id: '03' },
        { id: '04' },
        { id: '05' },
        { id: '06' },
        { id: '07' },
        { id: '08' },
        { id: '09' },
        { id: '10' },
        { id: '11' },
      ],
    },
  },
};

describe('PartnerGivingAnalysisReport', () => {
  it('loading', async () => {
    const { queryByTestId, queryByText } = render(<TestComponent />);

    expect(queryByText(title)).toBeInTheDocument();
    expect(
      queryByTestId('LoadingPartnerGivingAnalysisReport'),
    ).toBeInTheDocument();
    expect(queryByTestId('Notification')).toBeNull();
  });

  it('loaded', async () => {
    const { getAllByTestId, getByTestId, queryByTestId, getByRole } = render(
      <TestComponent />,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });

    expect(getByRole('table')).toBeInTheDocument();
    expect(getAllByTestId('PartnerGivingAnalysisReportTableRow').length).toBe(
      11,
    );
    expect(getByTestId('PartnerGivingAnalysisReport')).toBeInTheDocument();
  });

  it('shows a placeholder when there are zero contacts', async () => {
    const { queryByTestId, queryByText, queryByRole } = render(
      <TestComponent noContacts />,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });

    expect(queryByRole('table')).not.toBeInTheDocument();
    expect(queryByText('You have 300 total contacts')).toBeInTheDocument();
  });

  it('fields are sortable', async () => {
    const { getByText, queryByTestId } = render(<TestComponent />);

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
      mutationSpy.mock.calls[2][0].operation.variables.input.sortField,
    ).toEqual('donationPeriodCount');
    expect(
      mutationSpy.mock.calls[2][0].operation.variables.input.sortDirection,
    ).toEqual('ASCENDING');

    userEvent.click(getByText('Gift Count'));
    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });

    expect(
      mutationSpy.mock.calls[3][0].operation.variables.input.sortField,
    ).toEqual('donationPeriodCount');
    expect(
      mutationSpy.mock.calls[3][0].operation.variables.input.sortDirection,
    ).toEqual('DESCENDING');

    userEvent.click(getByText('Gift Average'));
    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });
    expect(
      mutationSpy.mock.calls[4][0].operation.variables.input.sortField,
    ).toEqual('donationPeriodAverage');
    expect(
      mutationSpy.mock.calls[4][0].operation.variables.input.sortDirection,
    ).toEqual('ASCENDING');
  });

  it('filters contacts by name', async () => {
    const { getByPlaceholderText, queryByTestId } = render(<TestComponent />);

    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });

    userEvent.type(getByPlaceholderText('Search Contacts'), 'John');
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
      mutationSpy.mock.calls[2][0].operation.variables.input.contactFilters,
    ).toEqual({ nameLike: '%John%' });
  });

  it('sets the pagination limit', async () => {
    const { getByRole, queryByTestId, getByTestId, getByText } = render(
      <TestComponent />,
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
      mutationSpy.mock.calls[2][0].operation.variables.input.pageSize,
    ).toBe(50);

    userEvent.selectOptions(getByRole('combobox'), '10');
    userEvent.click(getByTestId('KeyboardArrowRightIcon'));
    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });

    expect(getByText('11-20 of 120')).toBeInTheDocument();
  });

  it('selects and unselects all', async () => {
    const { getAllByRole, queryByTestId } = render(<TestComponent />);

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
    expect(getAllByRole('checkbox')[0]).toBeChecked();
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
    userEvent.click(getAllByRole('checkbox')[4]);
    userEvent.click(getAllByRole('checkbox')[5]);
    userEvent.click(getAllByRole('checkbox')[6]);
    userEvent.click(getAllByRole('checkbox')[7]);
    userEvent.click(getAllByRole('checkbox')[8]);
    userEvent.click(getAllByRole('checkbox')[9]);
    userEvent.click(getAllByRole('checkbox')[10]);
    userEvent.click(getAllByRole('checkbox')[11]);
    expect(getAllByRole('checkbox')[0]).toBeChecked();

    // Deselect all individually
    userEvent.click(getAllByRole('checkbox')[1]);
    userEvent.click(getAllByRole('checkbox')[2]);
    userEvent.click(getAllByRole('checkbox')[3]);
    expect(getAllByRole('checkbox')[0]).not.toBeChecked();
  });

  it('should show contact name as a link', async () => {
    const { getByRole, queryByTestId } = render(<TestComponent />);

    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });

    expect(
      getByRole('link', {
        name: 'Ababa, Aladdin und Jasmine (Princess)',
      }),
    ).toBeInTheDocument();
  });

  it('formats currencies', async () => {
    const { getByText, queryByTestId } = render(<TestComponent />);

    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });

    // Test that it adds commas
    expect(getByText('CA$15,218.42')).toBeInTheDocument();

    expect(getByText('CA$150')).toBeInTheDocument();

    // Test that it rounds to two decimal points
    expect(getByText('CA$86.47')).toBeInTheDocument();
  });

  it('renders nav list icon and onClick triggers onNavListToggle', async () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Toggle Navigation Panel' }));
    expect(onNavListToggle).toHaveBeenCalled();
  });

  it('renders filter list icon and onClick triggers onFilterListToggle', async () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('img', { name: 'Toggle Filter Panel' }));
    expect(onFilterListToggle).toHaveBeenCalled();
  });
});
