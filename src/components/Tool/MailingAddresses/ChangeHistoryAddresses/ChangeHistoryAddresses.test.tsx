import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

type History = AddressChangeHistoryQuery['addressChangeHistory'];

const TestComponent: React.FC<{ history?: History }> = ({
  history = mockAddressChangeHistory,
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
                AddressChangeHistory: { addressChangeHistory: history },
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

  it('shows the empty state when there are no changes', async () => {
    const { findByText } = render(<TestComponent history={emptyHistory} />);

    expect(
      await findByText('No address changes available yet'),
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
    const { getByRole, findByRole, findByText } = render(
      <TestComponent history={emptyHistory} />,
    );
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
      'All partners',
    );
    expect(getByRole('combobox', { name: 'Changed during' })).toHaveTextContent(
      'Any time',
    );
    expect(getByRole('combobox', { name: 'Change made by' })).toHaveTextContent(
      'Anyone',
    );
  });

  it('stops sending a filter once it is cleared', async () => {
    const utils = render(<TestComponent />);
    await utils.findByText('4 were automatic');

    await pickOption(utils, 'Partner', 'Lost Partners');
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('AddressChangeHistory', {
        partners: 'LOST',
      }),
    );
    mutationSpy.mockClear();
    await pickOption(utils, 'Partner', 'All partners');

    expect(utils.getByRole('combobox', { name: 'Partner' })).toHaveTextContent(
      'All partners',
    );
    expect(await utils.findByText('4 were automatic')).toBeInTheDocument();
    expect(mutationSpy).not.toHaveGraphqlOperation('AddressChangeHistory', {
      partners: '',
    });
  });
});
