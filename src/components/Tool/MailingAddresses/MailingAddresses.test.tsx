import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { VirtuosoMockContext } from 'react-virtuoso';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetToolNotificationsQuery } from 'src/components/Layouts/Primary/TopBar/Items/NavMenu/GetToolNotifcations.generated';
import { ContactPanelProvider } from 'src/components/Shared/ContactPanelProvider/ContactPanelProvider';
import theme from 'src/theme';
import { AddressChangeHistoryQuery } from './ChangeHistoryAddresses/AddressChangeHistory.generated';
import { mockAddressChangeHistory } from './ChangeHistoryAddresses/ChangeHistoryAddressesMock';
import MailingAddresses from './MailingAddresses';

const accountListId = 'account-list-1';
const pathname =
  '/accountLists/[accountListId]/tools/mailingAddresses/[[...contactId]]';
const push = jest.fn();

const TestComponent: React.FC<{ toConfirmCount?: number; tab?: string }> = ({
  toConfirmCount = 0,
  tab,
}) => (
  <SnackbarProvider>
    <TestRouter
      router={{
        pathname,
        query: { accountListId, ...(tab && { mailingTab: tab }) },
        push,
      }}
    >
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{
          GetToolNotifications: GetToolNotificationsQuery;
          AddressChangeHistory: AddressChangeHistoryQuery;
        }>
          mocks={{
            GetToolNotifications: {
              fixMailingAddresses: { totalCount: toConfirmCount },
            },
            AddressChangeHistory: {
              addressChangeHistory: mockAddressChangeHistory,
            },
          }}
        >
          <VirtuosoMockContext.Provider
            value={{ viewportHeight: 1000, itemHeight: 100 }}
          >
            <ContactPanelProvider>
              <MailingAddresses accountListId={accountListId} />
            </ContactPanelProvider>
          </VirtuosoMockContext.Provider>
        </GqlMockedProvider>
      </ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

describe('MailingAddresses', () => {
  it.each([
    [18, '18'],
    [150, '99+'],
  ])(
    'shows %s contacts to confirm as %s on the To Confirm tab',
    async (toConfirmCount, badgeText) => {
      const { findByTestId } = render(
        <TestComponent toConfirmCount={toConfirmCount} />,
      );

      expect(await findByTestId('toConfirmCount')).toHaveTextContent(badgeText);
    },
  );

  it('hides the badge when there are no contacts to confirm', async () => {
    const { findByTestId, queryByTestId } = render(<TestComponent />);

    expect(await findByTestId('Home')).toBeInTheDocument();
    expect(queryByTestId('toConfirmCount')).not.toBeInTheDocument();
  });

  it('opens on To Confirm by default', async () => {
    const { findByTestId, getByRole } = render(<TestComponent />);

    expect(getByRole('tab', { name: 'To Confirm' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(await findByTestId('Home')).toBeInTheDocument();
  });

  it('opens on Change History from the URL', async () => {
    const { findByText, getByRole, queryByTestId } = render(
      <TestComponent tab="history" />,
    );

    expect(getByRole('tab', { name: 'Change History' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(await findByText('Address changes')).toBeInTheDocument();
    expect(queryByTestId('Home')).not.toBeInTheDocument();
  });

  it('puts the selected tab in the URL', () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('tab', { name: 'Change History' }));

    expect(push).toHaveBeenCalledWith(
      { pathname, query: { accountListId, mailingTab: 'history' } },
      undefined,
      { shallow: true },
    );
  });

  it('stays on Change History when a partner is opened', async () => {
    const { findByRole } = render(<TestComponent tab="history" />);

    expect(
      await findByRole('link', { name: 'Dalmation, Pongo and Perdita' }),
    ).toHaveAttribute(
      'href',
      `/accountLists/${accountListId}/tools/mailingAddresses/contact-1?mailingTab=history`,
    );
  });
});
