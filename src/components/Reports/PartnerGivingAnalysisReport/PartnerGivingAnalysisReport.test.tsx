import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactPanelProvider } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import { UrlFiltersProvider } from 'src/components/common/UrlFiltersProvider/UrlFiltersProvider';
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
    expect(getAllByRole('row').length).toBe(26); // 25 rows + header (page size is 25)
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
    const { getByText, queryByTestId, getAllByRole } = render(
      <TestComponent />,
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

    const rows1 = getAllByRole('row');
    expect(rows1.length).toBe(26);
    expect(rows1[1]).toHaveTextContent('Beast, Beast and Belle');

    userEvent.click(getByText('Gift Count'));
    const rows2 = getAllByRole('row');
    expect(rows2.length).toBe(26);
    expect(rows2[1]).toHaveTextContent('Dalmation, Pongo and Perdita');

    userEvent.click(getByText('Gift Average'));
    const rows3 = getAllByRole('row');
    expect(rows3.length).toBe(26);
    expect(rows3[1]).toHaveTextContent('$25524');
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
    const { getByRole, findByRole, getAllByRole } = render(<TestComponent />);

    await waitFor(() => {
      expect(getByRole('grid')).toBeInTheDocument();
    });

    // Initially should show 25 rows + 1 header = 26 total
    await waitFor(() => {
      expect(getAllByRole('row').length).toBe(26);
    });

    const combobox = getByRole('combobox', { name: 'Rows per page:' });
    userEvent.click(combobox);

    const listbox = await findByRole('listbox');
    await userEvent.click(within(listbox).getByRole('option', { name: '50' }));

    await waitFor(() => {
      expect(getAllByRole('row').length).toBe(30);
    });
  });

  it('should go to next page', async () => {
    const { getAllByRole, getByRole } = render(<TestComponent />);

    await waitFor(() => {
      expect(getByRole('grid')).toBeInTheDocument();
    });

    // All 26 contacts + header = 27 rows displayed (DataGrid default page size shows all)
    await waitFor(() => {
      expect(getAllByRole('row').length).toBe(26);
    });

    const nextButton = getByRole('button', { name: /Go to next page/i });
    userEvent.click(nextButton);

    expect(nextButton).toBeDisabled();
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
    expect(getAllByRole('checkbox')[1]).toBeChecked();

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

  it('prints all Contacts', async () => {
    const { getByRole, getAllByRole, queryByTestId } = render(
      <TestComponent />,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });

    // Initially showing 25 rows (default page size) + 1 header = 26 total
    expect(getAllByRole('row').length).toBe(26);

    userEvent.click(getByRole('button', { name: 'Print' }));
    expect(getAllByRole('row').length).toBe(30);
  });
});
