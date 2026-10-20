import { ThemeProvider } from '@mui/material/styles';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
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
    startDate = null,
    createdAt = '2020-01-01T00:00:00Z',
    primaryMailingAddress = false,
    createdByUser = null,
  }: {
    startDate?: string | null;
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
  startDate,
  createdAt,
  primaryMailingAddress,
  createdByUser,
});

const contactsPathname =
  '/accountLists/[accountListId]/contacts/[[...contactId]]';

const TestComponent: React.FC<{ pathname?: string }> = ({
  pathname = contactsPathname,
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
            contact: {
              name: 'Baggins, Frodo',
              status: StatusEnum.PartnerFinancial,
              addresses: {
                nodes: [
                  address('1', '1001 Denman St', 'DataServer', {
                    startDate: '2018-01-22',
                  }),
                  address('2', '2525 Camp Creek Pkwy', 'MPDX', {
                    startDate: '2024-06-13',
                    primaryMailingAddress: true,
                    createdByUser: {
                      id: 'user-2',
                      firstName: 'Pedro',
                      lastName: 'Pérez',
                    },
                  }),
                  address('3', '111 Street', 'MPDX', {
                    createdAt: '2025-03-24T12:00:00Z',
                    createdByUser: {
                      id: currentUserId,
                      firstName: 'Test',
                      lastName: 'User',
                    },
                  }),
                ],
              },
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

const renderModal = async (props: { pathname?: string } = {}) => {
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

  it('lists every address newest first with who made the change', async () => {
    const { getByRole } = await renderModal();
    const dialog = within(getByRole('dialog'));

    const rowText = dialog
      .getAllByText(/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/)
      .map((date) => date.parentElement?.textContent);

    expect(rowText).toEqual([
      'Mar 24, 2025111 Street, College Park, GA 30337You, in MPDX',
      'Jun 13, 20242525 Camp Creek Pkwy, College Park, GA 30337Pedro Pérez, in MPDX',
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
