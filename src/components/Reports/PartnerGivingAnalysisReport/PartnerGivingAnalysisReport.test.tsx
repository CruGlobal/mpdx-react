import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetPartnerGivingAnalysisIdsForMassSelectionQuery } from 'src/hooks/GetIdsForMassSelection.generated';
import theme from 'src/theme';
import {
  PartnerGivingAnalysisReport,
  PartnerGivingAnalysisReportRef,
} from './PartnerGivingAnalysisReport';
import { GetPartnerGivingAnalysisReportQuery } from './PartnerGivingAnalysisReport.generated';

const accountListId = '111';
const title = 'test title';
const onNavListToggle = jest.fn();
const onFilterListToggle = jest.fn();
const onSelectContact = jest.fn();
const activeFilters = {};
const defaultProps = {
  accountListId,
  title,
  panelOpen: null,
  onNavListToggle,
  onFilterListToggle,
  onSelectContact,
  contactDetailsOpen: false,
  activeFilters,
};

const mockEnqueue = jest.fn();

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
  GetPartnerGivingAnalysisIdsForMassSelection?: GetPartnerGivingAnalysisIdsForMassSelectionQuery;
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
      pagination: {
        page: 1,
        pageSize: 10,
        totalItems: 120,
        totalPages: 12,
      },
      totalContacts: 11,
    },
  },
  GetPartnerGivingAnalysisIdsForMassSelection: {
    partnerGivingAnalysisReport: {
      contacts: [
        {
          id: '01',
        },
        {
          id: '02',
        },
        {
          id: '03',
        },
      ],
    },
  },
};

describe('PartnerGivingAnalysisReport', () => {
  beforeEach(() => {
    onNavListToggle.mockClear();
  });
  it('loading', async () => {
    const { queryByTestId, queryByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider>
          <PartnerGivingAnalysisReport {...defaultProps} />
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
        <GqlMockedProvider<{
          GetPartnerGivingAnalysisReport: GetPartnerGivingAnalysisReportQuery;
        }>
          mocks={mocks}
        >
          <PartnerGivingAnalysisReport {...defaultProps} />
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
      11,
    );
    expect(getByTestId('PartnerGivingAnalysisReport')).toBeInTheDocument();
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
        <GqlMockedProvider<{
          GetPartnerGivingAnalysisReport: GetPartnerGivingAnalysisReportQuery;
        }>
          mocks={mocksWithZeroContacts}
        >
          <PartnerGivingAnalysisReport {...defaultProps} />
        </GqlMockedProvider>
      </ThemeProvider>,
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
    const mutationSpy = jest.fn();
    const { getByText, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{
          GetPartnerGivingAnalysisReport: GetPartnerGivingAnalysisReportQuery;
        }>
          mocks={mocks}
          onCall={mutationSpy}
        >
          <PartnerGivingAnalysisReport {...defaultProps} />
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
    const mutationSpy = jest.fn();
    const { getByPlaceholderText, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{
          GetPartnerGivingAnalysisReport: GetPartnerGivingAnalysisReportQuery;
        }>
          mocks={mocks}
          onCall={mutationSpy}
        >
          <PartnerGivingAnalysisReport {...defaultProps} />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

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
    const mutationSpy = jest.fn();
    const { getByRole, queryByTestId, getByTestId, getByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{
          GetPartnerGivingAnalysisReport: GetPartnerGivingAnalysisReportQuery;
        }>
          mocks={mocks}
          onCall={mutationSpy}
        >
          <PartnerGivingAnalysisReport {...defaultProps} />
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
      mutationSpy.mock.calls[2][0].operation.variables.input.pageSize,
    ).toBe(50);

    userEvent.selectOptions(getByRole('combobox'), '10');
    userEvent.click(getByTestId('KeyboardArrowRightIcon'));
    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });

    expect(getByText('11–20 of 120')).toBeInTheDocument();
  });

  it('selects and unselects all', async () => {
    const { getAllByRole, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{
          GetPartnerGivingAnalysisReport: GetPartnerGivingAnalysisReportQuery;
        }>
          mocks={mocks}
        >
          <PartnerGivingAnalysisReport {...defaultProps} />
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

  it('can click on contact names', async () => {
    const mutationSpy = jest.fn();
    const { getByText, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{
          GetPartnerGivingAnalysisReport: GetPartnerGivingAnalysisReportQuery;
        }>
          mocks={mocks}
          onCall={mutationSpy}
        >
          <PartnerGivingAnalysisReport {...defaultProps} />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });

    userEvent.click(getByText('Ababa, Aladdin und Jasmine (Princess)'));
    expect(onSelectContact).toHaveBeenCalledWith('01');
  });

  it('formats currencies', async () => {
    const mutationSpy = jest.fn();
    const { getByText, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{
          GetPartnerGivingAnalysisReport: GetPartnerGivingAnalysisReportQuery;
        }>
          mocks={mocks}
          onCall={mutationSpy}
        >
          <PartnerGivingAnalysisReport {...defaultProps} />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

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
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{
          GetPartnerGivingAnalysisReport: GetPartnerGivingAnalysisReportQuery;
        }>
          mocks={mocks}
        >
          <PartnerGivingAnalysisReport {...defaultProps} />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    userEvent.click(getByRole('button', { name: 'Toggle Navigation Panel' }));
    expect(onNavListToggle).toHaveBeenCalled();
  });

  it('renders filter list icon and onClick triggers onFilterListToggle', async () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{
          GetPartnerGivingAnalysisReport: GetPartnerGivingAnalysisReportQuery;
        }>
          mocks={mocks}
        >
          <PartnerGivingAnalysisReport {...defaultProps} />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    userEvent.click(getByRole('img', { name: 'Toggle Filter Panel' }));
    expect(onFilterListToggle).toHaveBeenCalled();
  });

  it('Clears search input when useImperativeHook is called', async () => {
    const ref = React.createRef<PartnerGivingAnalysisReportRef>();
    const { getByPlaceholderText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{
          GetPartnerGivingAnalysisReport: GetPartnerGivingAnalysisReportQuery;
        }>
          mocks={mocks}
        >
          <PartnerGivingAnalysisReport ref={ref} {...defaultProps} />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    expect(ref.current).not.toBeNull();
    waitFor(() => ref?.current?.clearSearchInput());
    expect(getByPlaceholderText('Search Contacts')).toHaveValue('');
  });
});
