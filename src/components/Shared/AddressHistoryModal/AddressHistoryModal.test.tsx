import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
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

const address = (
  id: string,
  street: string,
  source: string,
  {
    changeDate = '2020-01-01',
    createdAt = '2020-01-01T00:00:00Z',
    primaryMailingAddress = false,
    createdByUser = null,
  }: {
    changeDate?: string;
    createdAt?: string;
    primaryMailingAddress?: boolean;
    createdByUser?: { id: string; firstName: string; lastName: string } | null;
  } = {},
) => ({
  id,
  street,
  city: 'College Park',
  state: 'GA',
  postalCode: '30337',
  source,
  changeDate,
  createdAt,
  primaryMailingAddress,
  createdByUser,
});

const defaultAddresses = [
  address('1', '1001 Denman St', 'DataServer', {
    changeDate: '2018-01-22',
  }),
  address('2', '2525 Camp Creek Pkwy', 'MPDX', {
    changeDate: '2024-06-13',
    primaryMailingAddress: true,
    createdByUser: {
      id: 'user-2',
      firstName: 'Pedro',
      lastName: 'Pérez',
    },
  }),
  address('3', '111 Street', 'MPDX', {
    changeDate: '2025-03-24',
    createdByUser: {
      id: currentUserId,
      firstName: 'Test',
      lastName: 'User',
    },
  }),
];

const contactsPathname =
  '/accountLists/[accountListId]/contacts/[[...contactId]]';

const TestComponent: React.FC<{
  pathname?: string;
  addresses?: ReturnType<typeof address>[];
}> = ({ pathname = contactsPathname, addresses = defaultAddresses }) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={{ pathname }}>
      <GqlMockedProvider<{
        GetUser: GetUserQuery;
        AddressHistory: AddressHistoryQuery;
      }>
        mocks={{
          GetUser: { user: { id: currentUserId } },
          AddressHistory: {
            contact: {
              name: 'Baggins, Frodo',
              status: StatusEnum.PartnerFinancial,
              addresses: { nodes: addresses },
            },
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
  it('shows the current primary address and how many changes since when', async () => {
    const { getByText } = await renderModal();

    expect(
      getByText('Current primary address').parentElement,
    ).toHaveTextContent('2525 Camp Creek Pkwy, College Park, GA 30337');
    expect(getByText('3 changes since Jan 2018')).toBeInTheDocument();
  });

  it('uses singular English for one change', async () => {
    const { getByText } = await renderModal({
      addresses: [
        address('1', '1001 Denman St', 'DataServer', {
          changeDate: '2018-01-22',
          primaryMailingAddress: true,
        }),
      ],
    });

    expect(getByText('1 change since Jan 2018')).toBeInTheDocument();
  });

  it('lists every address newest first with the one it replaced and who made the change', async () => {
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

  it('breaks a same-day tie by when each address was added, across a clock change', async () => {
    // 1:10am PST is later than 1:40am PDT on the night the clocks fall back
    const { getByRole } = await renderModal({
      addresses: [
        address('1', 'Added First', 'MPDX', {
          changeDate: '2026-11-01',
          createdAt: '2026-11-01T01:40:00-07:00',
        }),
        address('2', 'Added Second', 'MPDX', {
          changeDate: '2026-11-01',
          createdAt: '2026-11-01T01:10:00-08:00',
        }),
      ],
    });

    const streets = within(getByRole('dialog'))
      .getAllByText(/^Added (First|Second), College Park/)
      .map((element) => element.textContent?.split(',')[0]);
    expect(streets).toEqual(['Added Second', 'Added First']);
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
