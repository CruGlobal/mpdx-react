import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactPanelProvider } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import { UrlFiltersProvider } from 'src/components/common/UrlFiltersProvider/UrlFiltersProvider';
import { PartnerGivingAnalysisSortEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { PartnerGivingAnalysisQuery } from './PartnerGivingAnalysis.generated';
import { PartnerGivingAnalysisReport } from './PartnerGivingAnalysisReport';
import { mocks } from './mockData';

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

const emptyMock = {
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

// Helper function to find the most recent GraphQL operation by name
const findOperationCall = (operationName: string) => {
  return mutationSpy.mock.calls.findLast(
    (call) => call[0]?.operation?.operationName === operationName,
  )?.[0];
};

describe('PartnerGivingAnalysisReport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loading', async () => {
    const { queryByTestId, queryByText } = render(<TestComponent />);

    expect(queryByText(title)).toBeInTheDocument();
    expect(
      queryByTestId('LoadingPartnerGivingAnalysisReport'),
    ).toBeInTheDocument();
    expect(queryByTestId('Notification')).toBeNull();
  });

  it('loaded', async () => {
    const { getAllByRole, findByRole } = render(<TestComponent />);

    expect(await findByRole('grid')).toBeInTheDocument();
    expect(getAllByRole('row').length).toBe(27); // 26 rows + header
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

    await waitFor(() => {
      const call = findOperationCall('PartnerGivingAnalysis');
      expect(call?.operation.variables.input.sortBy).toEqual(
        PartnerGivingAnalysisSortEnum.DonationPeriodCountAsc,
      );
    });

    userEvent.click(getByText('Gift Count'));
    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });

    await waitFor(() => {
      const call = findOperationCall('PartnerGivingAnalysis');
      expect(call?.operation.variables.input.sortBy).toEqual(
        PartnerGivingAnalysisSortEnum.DonationPeriodCountDesc,
      );
    });

    userEvent.click(getByText('Gift Average'));
    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });

    await waitFor(() => {
      const call = findOperationCall('PartnerGivingAnalysis');
      expect(call?.operation.variables.input.sortBy).toEqual(
        PartnerGivingAnalysisSortEnum.DonationPeriodAverageAsc,
      );
    });
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

    await waitFor(() => {
      const call = findOperationCall('PartnerGivingAnalysis');
      expect(call?.operation.variables.input.filters).toEqual({
        nameLike: '%John%',
      });
    });
  });

  it('sets the pagination limit', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

    await waitFor(() => {
      expect(getByRole('grid')).toBeInTheDocument();
    });

    const combobox = getByRole('combobox', { name: 'Rows per page:' });
    userEvent.click(combobox);

    const listbox = await findByRole('listbox');
    await userEvent.click(within(listbox).getByRole('option', { name: '50' }));

    await waitFor(() => {
      const call = findOperationCall('PartnerGivingAnalysis');
      expect(call?.operation.variables.first).toBe(50);
    });
  });

  it('should go to next page', async () => {
    const { getByTestId, queryByTestId, getByRole } = render(<TestComponent />);

    await waitFor(() => {
      expect(getByRole('grid')).toBeInTheDocument();
    });

    await waitFor(() =>
      expect(mutationSpy.mock.calls[0][0].operation.variables.first).toBe(25),
    );

    await userEvent.click(getByTestId('KeyboardArrowRightIcon'));

    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });

    expect(getByRole('button', { name: /go to next page/i })).toBeDisabled();
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
    const checkboxes = getAllByRole('checkbox');
    for (const checkbox of checkboxes.slice(1)) {
      await userEvent.click(checkbox);
    }
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
