import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphQLError } from 'graphql';
import { Settings } from 'luxon';
import { VirtuosoMockContext } from 'react-virtuoso';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import matchMediaMock from '__tests__/util/matchMediaMock';
import { ContactPanelProvider } from 'src/components/Shared/ContactPanelProvider/ContactPanelProvider';
import { UserPreferenceContext } from 'src/components/User/Preferences/UserPreferenceProvider';
import theme from 'src/theme';
import { AddressChangeHistoryQuery } from './AddressChangeHistory.generated';
import { ChangeHistoryAddresses } from './ChangeHistoryAddresses';
import {
  currentUserId,
  mockAddressChangeHistory,
} from './ChangeHistoryAddressesMock';

const accountListId = 'account-list-1';
const mutationSpy = jest.fn();
let loadCount = 0;

type History = AddressChangeHistoryQuery['addressChangeHistory'];

// failingCall: which AddressChangeHistory request (1 = first load, 2 = the next page) fails once
const TestComponent: React.FC<{ history?: History; failingCall?: number }> = ({
  history = mockAddressChangeHistory,
  failingCall,
}) => (
  <ThemeProvider theme={theme}>
    <UserPreferenceContext.Provider value={{ locale: 'en-US' }}>
      <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale="en-US">
        <VirtuosoMockContext.Provider
          value={{ viewportHeight: 1000, itemHeight: 100 }}
        >
          <TestRouter router={{ query: { accountListId } }}>
            <GqlMockedProvider
              mocks={{
                GetUser: { user: { id: currentUserId } },
                AddressChangeHistory: {
                  addressChangeHistory: () => {
                    // Throwing makes that load fail
                    if (++loadCount === failingCall) {
                      throw new GraphQLError('Address changes failed');
                    }
                    return history;
                  },
                },
              }}
              onCall={mutationSpy}
            >
              <ContactPanelProvider>
                <ChangeHistoryAddresses accountListId={accountListId} />
              </ContactPanelProvider>
            </GqlMockedProvider>
          </TestRouter>
        </VirtuosoMockContext.Provider>
      </LocalizationProvider>
    </UserPreferenceContext.Provider>
  </ThemeProvider>
);

const emptyHistory: History = {
  ...mockAddressChangeHistory,
  nodes: [],
  contactIds: [],
  totalCount: 0,
  automaticCount: 0,
};

describe('ChangeHistoryAddresses', () => {
  const nowMillis = Settings.now;
  beforeEach(() => {
    loadCount = 0;
    matchMediaMock({ pointer: 'fine' });
    Settings.now = () => new Date(2026, 9, 14, 15).valueOf();
  });
  afterEach(() => {
    Settings.now = nowMillis;
  });

  const pickOption = async (
    { getByRole, findByRole }: ReturnType<typeof render>,
    select: string,
    option: string,
  ) => {
    userEvent.click(getByRole('combobox', { name: select }));
    userEvent.click(
      within(await findByRole('listbox')).getByRole('option', { name: option }),
    );
  };

  it('shows a spinner, then the summary from the server totals', async () => {
    const { getByTestId, findByText } = render(
      <TestComponent
        history={{
          ...mockAddressChangeHistory,
          totalCount: 60,
          contactIds: ['contact-1', 'contact-2'],
          automaticCount: 40,
          pageInfo: { endCursor: 'cursor-1', hasNextPage: true },
        }}
      />,
    );

    expect(getByTestId('loading')).toBeInTheDocument();
    expect(
      await findByText('60 address changes for 2 partners'),
    ).toBeInTheDocument();
    expect(await findByText('40 were automatic')).toBeInTheDocument();
  });

  it('shows an inline retry when loading the next page fails', async () => {
    const { findByText, getByRole, queryByText } = render(
      <TestComponent
        failingCall={2}
        history={{
          ...mockAddressChangeHistory,
          pageInfo: { endCursor: 'cursor-1', hasNextPage: true },
        }}
      />,
    );

    expect(
      await findByText('Unable to load more address changes.'),
    ).toBeInTheDocument();
    expect(queryByText('4 were automatic')).toBeInTheDocument();

    mutationSpy.mockClear();
    userEvent.click(getByRole('button', { name: 'Retry' }));
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('AddressChangeHistory', {
        after: 'cursor-1',
      }),
    );
    await waitFor(() =>
      expect(
        queryByText('Unable to load more address changes.'),
      ).not.toBeInTheDocument(),
    );
  });

  it('does not show an old page failure on results for new filters', async () => {
    // The API's cursors are offsets, so every first page ends at the same cursor
    const utils = render(
      <TestComponent
        failingCall={2}
        history={{
          ...mockAddressChangeHistory,
          pageInfo: { endCursor: 'cursor-1', hasNextPage: true },
        }}
      />,
    );
    await utils.findByText('Unable to load more address changes.');

    await pickOption(utils, 'Partner', 'Lost Partners');

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('AddressChangeHistory', {
        partners: 'LOST',
      }),
    );
    // Wait until the new results are showing, not the loading gap before them
    await waitFor(() =>
      expect(utils.queryByTestId('loading')).not.toBeInTheDocument(),
    );
    expect(await utils.findByText('4 were automatic')).toBeInTheDocument();
    expect(
      utils.queryByText('Unable to load more address changes.'),
    ).not.toBeInTheDocument();
  });

  it('loads the next page when the table reaches the end', async () => {
    render(
      <TestComponent
        history={{
          ...mockAddressChangeHistory,
          pageInfo: { endCursor: 'cursor-1', hasNextPage: true },
        }}
      />,
    );

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('AddressChangeHistory', {
        accountListId,
        after: 'cursor-1',
      }),
    );
  });

  it('shows an error with a retry that loads the changes when the first load fails', async () => {
    const { findByText, getByRole, queryByTestId, queryByText } = render(
      <TestComponent failingCall={1} />,
    );

    expect(
      await findByText('Unable to load address changes.'),
    ).toBeInTheDocument();
    expect(queryByTestId('address-changes-null-state')).not.toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'Retry' }));
    expect(await findByText('4 were automatic')).toBeInTheDocument();
    expect(
      queryByText('Unable to load address changes.'),
    ).not.toBeInTheDocument();
  });

  it('shows the empty state when there are no changes at any time', async () => {
    const utils = render(<TestComponent history={emptyHistory} />);
    await pickOption(utils, 'Changed during', 'Any time');

    expect(
      await utils.findByText('No address changes available yet'),
    ).toBeInTheDocument();
  });

  it('says the default date range is filtering when it finds nothing', async () => {
    const { findByText } = render(<TestComponent history={emptyHistory} />);

    expect(
      await findByText('No address changes in the last 12 months'),
    ).toBeInTheDocument();
  });

  it('combines the change made by filter with the date range', async () => {
    const { getByRole, findByRole, findByText } = render(<TestComponent />);
    await findByText('4 were automatic');

    userEvent.click(getByRole('combobox', { name: 'Change made by' }));
    userEvent.click(
      within(await findByRole('listbox')).getByRole('option', {
        name: 'Jane Smith',
      }),
    );
    userEvent.click(getByRole('combobox', { name: 'Changed during' }));
    userEvent.click(
      within(await findByRole('listbox')).getByRole('option', {
        name: 'Custom Date Range',
      }),
    );
    userEvent.type(getByRole('textbox', { name: 'Start Date' }), '1/1/2026');
    userEvent.tab();
    userEvent.click(getByRole('button', { name: 'Apply' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('AddressChangeHistory', {
        accountListId,
        startDate: '2026-01-01',
        madeBy: ['user:user-2'],
      }),
    );
  });

  it('groups the change made by choices', async () => {
    const { getByRole, findByRole, findByText } = render(<TestComponent />);
    await findByText('4 were automatic');

    userEvent.click(getByRole('combobox', { name: 'Change made by' }));

    expect(
      Array.from((await findByRole('listbox')).querySelectorAll('li')).map(
        (item) => item.textContent,
      ),
    ).toEqual([
      'Anyone',
      'Automatic',
      'US Donation Services',
      'DonorHub',
      'US Donation System',
      'In MPDX',
      'Jane Smith',
      'You',
      'Unknown user',
    ]);
  });

  it('shows the filtered empty state when a filter matches nothing', async () => {
    const utils = render(<TestComponent history={emptyHistory} />);
    const { getByRole, findByRole, findByText } = utils;
    await pickOption(utils, 'Changed during', 'Any time');
    await findByText('No address changes available yet');

    userEvent.click(getByRole('combobox', { name: 'Change made by' }));
    userEvent.click(
      within(await findByRole('listbox')).getByRole('option', {
        name: 'DonorHub',
      }),
    );

    expect(
      await findByText('No address changes match your filters'),
    ).toBeInTheDocument();
  });

  it('sends the partner and changed during filters together', async () => {
    const utils = render(<TestComponent />);
    await utils.findByText('4 were automatic');

    await pickOption(utils, 'Partner', 'Lost Partners');
    await pickOption(utils, 'Changed during', 'Last 3 Months');

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('AddressChangeHistory', {
        accountListId,
        partners: 'LOST',
        startDate: '2026-07-14',
        endDate: '2026-10-14',
      }),
    );
  });

  it('keeps the previous choice when the custom range is cancelled', async () => {
    const utils = render(<TestComponent />);
    await utils.findByText('4 were automatic');

    await pickOption(utils, 'Changed during', 'Last 3 Months');
    await pickOption(utils, 'Changed during', 'Custom Date Range');
    userEvent.click(utils.getByRole('button', { name: 'Cancel' }));

    expect(
      utils.getByRole('combobox', { name: 'Changed during' }),
    ).toHaveTextContent('Last 3 Months');
  });

  it('shows the default choice in each filter', async () => {
    const { getByRole, findByText } = render(<TestComponent />);
    await findByText('4 were automatic');

    expect(getByRole('combobox', { name: 'Partner' })).toHaveTextContent(
      'Gave One or More Gifts',
    );
    expect(getByRole('combobox', { name: 'Changed during' })).toHaveTextContent(
      'Last 12 Months',
    );
    expect(getByRole('combobox', { name: 'Change made by' })).toHaveTextContent(
      'Anyone',
    );
  });

  it('loads the last 12 months by default', async () => {
    render(<TestComponent />);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('AddressChangeHistory', {
        startDate: '2025-10-14',
        endDate: '2026-10-14',
      }),
    );
  });

  it('stops sending a filter once it is cleared', async () => {
    const utils = render(<TestComponent />);
    await utils.findByText('4 were automatic');

    await pickOption(utils, 'Change made by', 'DonorHub');
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('AddressChangeHistory', {
        madeBy: ['source:DataServer'],
      }),
    );
    mutationSpy.mockClear();
    await pickOption(utils, 'Change made by', 'Anyone');

    expect(
      utils.getByRole('combobox', { name: 'Change made by' }),
    ).toHaveTextContent('Anyone');
    expect(await utils.findByText('4 were automatic')).toBeInTheDocument();
    expect(mutationSpy).not.toHaveGraphqlOperation('AddressChangeHistory', {
      madeBy: [''],
    });
  });
});
