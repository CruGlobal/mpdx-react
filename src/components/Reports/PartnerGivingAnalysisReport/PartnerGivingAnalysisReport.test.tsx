import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactPanelProvider } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import { UrlFiltersProvider } from 'src/components/common/UrlFiltersProvider/UrlFiltersProvider';
import { PartnerGivingAnalysisSortEnum } from 'src/graphql/types.generated';
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
        PartnerGivingAnalysis: PartnerGivingAnalysisQuery;
      }>
        mocks={noContacts ? emptyMock : mocks}
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
  PartnerGivingAnalysis: PartnerGivingAnalysisQuery;
  GetPartnerGivingAnalysisIdsForMassSelection?: GetPartnerGivingAnalysisIdsForMassSelectionQuery;
};

const mocks: Mocks = {
  PartnerGivingAnalysis: {
    partnerGivingAnalysis: {
      nodes: [
        {
          id: '01',
          name: 'Flintstone, Fred and Wilma',
          totalDonations: 49835,
          pledgeCurrency: 'USD',
          lastDonationDate: '2022-04-12',
          lastDonationAmount: 3000,
          lastDonationCurrency: 'INR',
          donationPeriodAverage: 1215.4878048780488,
          donationPeriodCount: 41,
          donationPeriodSum: 49835,
        },
        {
          id: '02',
          name: 'Mouse, Mickey and Minnie',
          totalDonations: 2175,
          pledgeCurrency: 'USD',
          lastDonationDate: '2020-12-15',
          lastDonationAmount: 75,
          lastDonationCurrency: 'USD',
          donationPeriodAverage: 80.55555555555556,
          donationPeriodCount: 27,
          donationPeriodSum: 2175,
        },
        {
          id: '03',
          name: 'Pan, Peter and Wendy',
          totalDonations: 1045,
          pledgeCurrency: 'USD',
          lastDonationDate: '2020-12-15',
          lastDonationAmount: 30,
          lastDonationCurrency: 'USD',
          donationPeriodAverage: 37.32142857142857,
          donationPeriodCount: 28,
          donationPeriodSum: 1045,
        },
        {
          id: '04',
          name: 'Pooh, Winnie',
          totalDonations: 255,
          pledgeCurrency: 'USD',
          lastDonationDate: '2019-10-05',
          lastDonationAmount: 10,
          lastDonationCurrency: 'USD',
          donationPeriodAverage: 10.625,
          donationPeriodCount: 24,
          donationPeriodSum: 255,
        },
        {
          id: '05',
          name: 'Dalmation, Pongo and Perdita',
          totalDonations: 41250,
          pledgeCurrency: 'USD',
          lastDonationDate: '2025-07-11',
          lastDonationAmount: 200,
          lastDonationCurrency: 'UGX',
          donationPeriodAverage: 982.1428571428571,
          donationPeriodCount: 42,
          donationPeriodSum: 41250,
        },
        {
          id: '06',
          name: 'Deer, Bambi and Feline',
          totalDonations: 24795,
          pledgeCurrency: 'UGX',
          lastDonationDate: '2022-01-12',
          lastDonationAmount: 12000,
          lastDonationCurrency: 'INR',
          donationPeriodAverage: 918.3333333333334,
          donationPeriodCount: 27,
          donationPeriodSum: 24796,
        },
        {
          id: '07',
          name: 'Duck, Daffy and Daphney',
          totalDonations: 11039,
          pledgeCurrency: 'USD',
          lastDonationDate: '2025-07-11',
          lastDonationAmount: 200,
          lastDonationCurrency: 'UGX',
          donationPeriodAverage: 356.0967741935484,
          donationPeriodCount: 31,
          donationPeriodSum: 11039,
        },
        {
          id: '08',
          name: 'Jetson, George and Jane',
          totalDonations: 1160,
          pledgeCurrency: 'USD',
          lastDonationDate: '2025-07-09',
          lastDonationAmount: 200,
          lastDonationCurrency: 'UGX',
          donationPeriodAverage: 46.422,
          donationPeriodCount: 25,
          donationPeriodSum: 1160,
        },
        {
          id: '09',
          name: 'Beast, Beast and Belle',
          totalDonations: 1400,
          pledgeCurrency: 'ARM',
          lastDonationDate: '2025-07-22',
          lastDonationAmount: 200,
          lastDonationCurrency: 'UGX',
          donationPeriodAverage: 466.6666666666667,
          donationPeriodCount: 3,
          donationPeriodSum: 1400,
        },
        {
          id: '10',
          name: 'Duck, Donald and Daisy',
          totalDonations: 333336588,
          pledgeCurrency: 'USD',
          lastDonationDate: '2025-07-02',
          lastDonationAmount: 1000,
          lastDonationCurrency: 'USD',
          donationPeriodAverage: 10752793.161290323,
          donationPeriodCount: 31,
          donationPeriodSum: 333336588,
        },
        {
          id: '11',
          name: 'First Pedestrian Church',
          totalDonations: 14733,
          pledgeCurrency: 'USD',
          lastDonationDate: '2025-07-16',
          lastDonationAmount: 200,
          lastDonationCurrency: 'UGX',
          donationPeriodAverage: 475.28225806451616,
          donationPeriodCount: 31,
          donationPeriodSum: 14733,
        },
      ],
      pageInfo: {
        endCursor: 'MTg',
        hasNextPage: false,
        hasPreviousPage: false,
      },
      edges: [
        { cursor: 'OA' },
        { cursor: 'OQ' },
        { cursor: 'MTA' },
        { cursor: 'MTE' },
        { cursor: 'MTI' },
        { cursor: 'MTM' },
        { cursor: 'MTQ' },
        { cursor: 'MTU' },
        { cursor: 'MTY' },
        { cursor: 'MTc' },
        { cursor: 'MTg' },
      ],
      totalCount: 11,
      totalPageCount: 1,
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

const emptyMock: Mocks = {
  PartnerGivingAnalysis: {
    partnerGivingAnalysis: {
      nodes: [],
      pageInfo: {
        ...mocks.PartnerGivingAnalysis.partnerGivingAnalysis.pageInfo,
      },
      edges: [],
      totalCount: 300,
      totalPageCount: 1,
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
      mutationSpy.mock.calls[2][0].operation.variables.input.sortBy,
    ).toEqual(PartnerGivingAnalysisSortEnum.DonationPeriodCountAsc);

    userEvent.click(getByText('Gift Count'));
    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });

    expect(
      mutationSpy.mock.calls[3][0].operation.variables.input.sortBy,
    ).toEqual(PartnerGivingAnalysisSortEnum.DonationPeriodCountDesc);

    userEvent.click(getByText('Gift Average'));
    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });
    expect(
      mutationSpy.mock.calls[4][0].operation.variables.input.sortBy,
    ).toEqual(PartnerGivingAnalysisSortEnum.DonationPeriodAverageAsc);
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
      mutationSpy.mock.calls[2][0].operation.variables.input.filters,
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

    expect(mutationSpy.mock.calls[2][0].operation.variables.first).toBe(50);

    userEvent.selectOptions(getByRole('combobox'), '10');
    userEvent.click(getByTestId('KeyboardArrowRightIcon'));
    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });

    expect(getByText('11-11 of 11')).toBeInTheDocument();
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
        name: 'Flintstone, Fred and Wilma',
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
    expect(getByText('UGX 24,795')).toBeInTheDocument();

    expect(getByText('$982.14')).toBeInTheDocument();

    // Test that it rounds to two decimal points
    expect(getByText('ARM 466.67')).toBeInTheDocument();
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
