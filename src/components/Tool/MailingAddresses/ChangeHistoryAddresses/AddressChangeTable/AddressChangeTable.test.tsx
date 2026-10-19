import { ThemeProvider } from '@mui/material/styles';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VirtuosoMockContext } from 'react-virtuoso';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactPanelProvider } from 'src/components/Shared/ContactPanelProvider/ContactPanelProvider';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import theme from 'src/theme';
import {
  currentUserId,
  mockAddressChanges,
} from '../ChangeHistoryAddressesMock';
import { AddressChangeTable } from './AddressChangeTable';

const accountListId = 'account-list-1';
const onHistoryClick = jest.fn();
const onEndReached = jest.fn();

const TestComponent: React.FC<{ loadingMore?: boolean }> = ({
  loadingMore = false,
}) => (
  <ThemeProvider theme={theme}>
    <VirtuosoMockContext.Provider
      value={{ viewportHeight: 1000, itemHeight: 100 }}
    >
      <TestRouter
        router={{
          query: { accountListId },
          pathname:
            '/accountLists/[accountListId]/tools/mailingAddresses/[[...contactId]]',
        }}
      >
        <GqlMockedProvider<{ GetUser: GetUserQuery }>
          mocks={{ GetUser: { user: { id: currentUserId } } }}
        >
          <ContactPanelProvider>
            <AddressChangeTable
              addressChanges={mockAddressChanges}
              loadingMore={loadingMore}
              onEndReached={onEndReached}
              onHistoryClick={onHistoryClick}
            />
          </ContactPanelProvider>
        </GqlMockedProvider>
      </TestRouter>
    </VirtuosoMockContext.Provider>
  </ThemeProvider>
);

const renderTable = async () => {
  const utils = render(<TestComponent />);
  await utils.findByText('You, in MPDX');
  return utils;
};

const getRow = (
  getByRole: ReturnType<typeof render>['getByRole'],
  partnerName: string,
) => getByRole('row', { name: new RegExp(partnerName) });

describe('AddressChangeTable', () => {
  it('shows the date, partner, and old and new addresses for each change', async () => {
    const { getByRole } = await renderTable();
    const row = within(getRow(getByRole, 'Dalmation, Pongo and Perdita'));

    expect(row.getByText('Sep 30, 2026')).toBeInTheDocument();
    expect(
      row.getByRole('link', { name: 'Dalmation, Pongo and Perdita' }),
    ).toHaveAttribute(
      'href',
      `/accountLists/${accountListId}/tools/mailingAddresses/contact-1`,
    );
    expect(row.getByText('Partner - Financial')).toBeInTheDocument();
    expect(
      row.getByText('2125 6th Ave W, Seattle, WA 98119'),
    ).toBeInTheDocument();
    expect(row.getByText('98 Lake St, Seattle, WA 98109')).toBeInTheDocument();
  });

  it('hides the previous address when there is none', async () => {
    const { getByRole } = await renderTable();
    const row = within(getRow(getByRole, 'Doe, John and Jane'));

    expect(row.queryByText(/Was:/)).not.toBeInTheDocument();
  });

  it('shows "You" for changes made by the current user', async () => {
    const { getByRole } = await renderTable();

    expect(
      within(getRow(getByRole, 'Beast, Beast and Belle')).getByText(
        'You, in MPDX',
      ),
    ).toBeInTheDocument();
    expect(
      within(getRow(getByRole, 'Deer, Bambi and Feline')).getByText(
        'Jane Smith, in MPDX',
      ),
    ).toBeInTheDocument();
  });

  it('passes the row to onHistoryClick', async () => {
    const { getByRole } = await renderTable();

    userEvent.click(
      within(getRow(getByRole, 'Duck, Donald and Daisy')).getByRole('button', {
        name: 'History',
      }),
    );

    expect(onHistoryClick).toHaveBeenCalledWith(mockAddressChanges[1]);
  });

  it('asks for more rows when scrolled to the end', async () => {
    await renderTable();

    expect(onEndReached).toHaveBeenCalled();
  });

  it('shows a spinner while more rows load', async () => {
    const { findByText, getByTestId } = render(<TestComponent loadingMore />);
    await findByText('You, in MPDX');

    expect(getByTestId('loading-more')).toBeInTheDocument();
  });
});
