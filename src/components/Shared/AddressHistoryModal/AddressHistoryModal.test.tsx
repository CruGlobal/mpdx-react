import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import { GraphQLError } from 'graphql';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render, within } from '__tests__/util/testingLibraryReactMock';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { StatusEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { AddressHistoryQuery } from './AddressHistory.generated';
import { AddressHistoryModal } from './AddressHistoryModal';
import { downloadAddressHistory } from './downloadAddressHistory';

jest.mock('./downloadAddressHistory');

const accountListId = 'account-list-1';
const currentUserId = 'user-1';
const handleClose = jest.fn();

const parts = (street: string) => ({
  street,
  city: 'College Park',
  state: 'GA',
  postalCode: '30337',
});

const change = (
  id: string,
  street: string,
  source: string,
  {
    date = '2020-01-01',
    previousStreet = null,
    createdByUser = null,
  }: {
    date?: string;
    previousStreet?: string | null;
    createdByUser?: { id: string; firstName: string; lastName: string } | null;
  } = {},
) => ({
  id,
  ...parts(street),
  source,
  date,
  createdByUser,
  previousAddress: previousStreet
    ? { id: `address-${previousStreet}`, ...parts(previousStreet) }
    : null,
});

// The API lists changes newest first
const defaultChanges = [
  change('3', '111 Street', 'MPDX', {
    date: '2025-03-24',
    previousStreet: '2525 Camp Creek Pkwy',
    createdByUser: {
      id: currentUserId,
      firstName: 'Test',
      lastName: 'User',
    },
  }),
  change('2', '2525 Camp Creek Pkwy', 'MPDX', {
    date: '2024-06-13',
    previousStreet: '1001 Denman St',
    createdByUser: {
      id: 'user-2',
      firstName: 'Pedro',
      lastName: 'Pérez',
    },
  }),
  change('1', '1001 Denman St', 'DataServer', {
    date: '2018-01-22',
  }),
];

const contactsPathname =
  '/accountLists/[accountListId]/contacts/[[...contactId]]';

let loadCount = 0;

const TestComponent: React.FC<{
  pathname?: string;
  changes?: ReturnType<typeof change>[];
  failing?: boolean;
}> = ({
  pathname = contactsPathname,
  changes = defaultChanges,
  failing = false,
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={{ pathname }}>
      <GqlMockedProvider<{
        GetUser: GetUserQuery;
        AddressHistory: AddressHistoryQuery;
      }>
        mocks={{
          GetUser: { user: { id: currentUserId } },
          AddressHistory: {
            contact: (() => {
              // The mock calls a function in place of a value; throwing makes that load fail
              if (failing && loadCount++ === 0) {
                throw new GraphQLError('Address history failed');
              }
              return {
                name: 'Baggins, Frodo',
                status: StatusEnum.PartnerFinancial,
                primaryAddress: { id: 'address-111', ...parts('111 Street') },
                addressChanges: changes,
              };
            }) as unknown as AddressHistoryQuery['contact'],
          },
        }}
      >
        <AddressHistoryModal
          accountListId={accountListId}
          contactId="contact-1"
          handleClose={handleClose}
        />
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

const renderModal = async (
  props: React.ComponentProps<typeof TestComponent> = {},
) => {
  const utils = render(<TestComponent {...props} />);
  await utils.findByText('Baggins, Frodo · Partner - Financial');
  return utils;
};

describe('AddressHistoryModal', () => {
  beforeEach(() => {
    loadCount = 0;
  });

  it('shows an error with a retry that loads the history when the first load fails', async () => {
    const { findByText, getByRole, queryByText } = render(
      <TestComponent failing />,
    );

    expect(
      await findByText('Unable to load address history.'),
    ).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'Retry' }));
    expect(
      await findByText('Baggins, Frodo · Partner - Financial'),
    ).toBeInTheDocument();
    expect(
      queryByText('Unable to load address history.'),
    ).not.toBeInTheDocument();
  });

  it('shows the current primary address and how many changes since when', async () => {
    const { getByText } = await renderModal();

    expect(
      getByText('Current primary address').parentElement,
    ).toHaveTextContent('111 Street, College Park, GA 30337');
    expect(getByText('3 changes since Jan 2018')).toBeInTheDocument();
  });

  it('counts changes since the earliest date, even when it is not the last row', async () => {
    // Logged last, but dated by an older start date
    const { getByText } = await renderModal({
      changes: [
        change('2', '111 Street', 'MPDX', {
          date: '2010-05-01',
          previousStreet: '1001 Denman St',
        }),
        change('1', '1001 Denman St', 'DataServer', { date: '2018-01-22' }),
      ],
    });

    expect(getByText('2 changes since May 2010')).toBeInTheDocument();
  });

  it('uses singular English for one change', async () => {
    const { getByText } = await renderModal({
      changes: [
        change('1', '1001 Denman St', 'DataServer', { date: '2018-01-22' }),
      ],
    });

    expect(getByText('1 change since Jan 2018')).toBeInTheDocument();
  });

  it('says so when no change was logged', async () => {
    const { getByText, getByRole } = await renderModal({ changes: [] });

    expect(getByText('No address changes yet.')).toBeInTheDocument();
    expect(getByRole('button', { name: 'Export' })).toBeDisabled();
  });

  it('lists every change newest first with the address it replaced and who made it', async () => {
    const { getByRole } = await renderModal();
    const dialog = within(getByRole('dialog'));

    const rowText = dialog
      .getAllByText(/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/)
      .map((date) => date.parentElement?.textContent);

    expect(rowText).toEqual([
      'Mar 24, 2025111 Street, College Park, GA 30337Was: 2525 Camp Creek Pkwy, College Park, GA 30337You, in MPDX',
      'Jun 13, 20242525 Camp Creek Pkwy, College Park, GA 30337Was: 1001 Denman St, College Park, GA 30337Pedro Pérez, in MPDX',
      'Jan 22, 20181001 Denman St, College Park, GA 30337Automatic update from DonorHub',
    ]);
  });

  it('links to the change history for all partners', async () => {
    const { getByRole } = await renderModal();

    expect(
      getByRole('link', { name: 'See changes for all partners' }),
    ).toHaveAttribute(
      'href',
      `/accountLists/${accountListId}/tools/mailingAddresses?mailingTab=history`,
    );
  });

  it('hides the all partners link on the Mailing Addresses page', async () => {
    const { queryByRole } = await renderModal({
      pathname:
        '/accountLists/[accountListId]/tools/mailingAddresses/[[...contactId]]',
    });

    expect(
      queryByRole('link', { name: 'See changes for all partners' }),
    ).not.toBeInTheDocument();
  });

  it.each(['Done', 'Close'])('closes when %s is clicked', async (button) => {
    const { getByRole } = await renderModal();

    userEvent.click(getByRole('button', { name: button }));

    expect(handleClose).toHaveBeenCalled();
  });

  it('shows a switch back to an earlier address as its own change', async () => {
    const { getByRole } = await renderModal({
      changes: [
        change('3', '1001 Denman St', 'MPDX', {
          date: '2025-03-24',
          previousStreet: '2525 Camp Creek Pkwy',
        }),
        change('2', '2525 Camp Creek Pkwy', 'MPDX', {
          date: '2024-06-13',
          previousStreet: '1001 Denman St',
        }),
        change('1', '1001 Denman St', 'DataServer', { date: '2018-01-22' }),
      ],
    });

    const rowText = within(getByRole('dialog'))
      .getAllByText(/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/)
      .map((date) => date.parentElement?.textContent);
    expect(rowText).toEqual([
      'Mar 24, 20251001 Denman St, College Park, GA 30337Was: 2525 Camp Creek Pkwy, College Park, GA 30337In MPDX',
      'Jun 13, 20242525 Camp Creek Pkwy, College Park, GA 30337Was: 1001 Denman St, College Park, GA 30337In MPDX',
      'Jan 22, 20181001 Denman St, College Park, GA 30337Automatic update from DonorHub',
    ]);
  });

  it('exports the address history newest first', async () => {
    const { getByRole } = await renderModal();

    userEvent.click(getByRole('button', { name: 'Export' }));

    expect(downloadAddressHistory).toHaveBeenCalledWith(
      [
        expect.objectContaining({ street: '111 Street' }),
        expect.objectContaining({ street: '2525 Camp Creek Pkwy' }),
        expect.objectContaining({ street: '1001 Denman St' }),
      ],
      'Baggins, Frodo',
      currentUserId,
      expect.any(Function),
      'en-US',
    );
  });
});
