import { ThemeProvider } from '@mui/material/styles';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
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
            onHistoryClick={onHistoryClick}
          />
        </ContactPanelProvider>
      </GqlMockedProvider>
    </TestRouter>
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
});
