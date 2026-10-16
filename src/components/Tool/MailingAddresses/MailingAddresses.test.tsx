import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetToolNotificationsQuery } from 'src/components/Layouts/Primary/TopBar/Items/NavMenu/GetToolNotifcations.generated';
import { ContactPanelProvider } from 'src/components/Shared/ContactPanelProvider/ContactPanelProvider';
import theme from 'src/theme';
import MailingAddresses from './MailingAddresses';

const accountListId = 'account-list-1';

const TestComponent: React.FC<{ toConfirmCount?: number }> = ({
  toConfirmCount = 0,
}) => (
  <SnackbarProvider>
    <TestRouter router={{ query: { accountListId } }}>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{ GetToolNotifications: GetToolNotificationsQuery }>
          mocks={{
            GetToolNotifications: {
              fixMailingAddresses: { totalCount: toConfirmCount },
            },
          }}
        >
          <ContactPanelProvider>
            <MailingAddresses accountListId={accountListId} />
          </ContactPanelProvider>
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

  it('opens on To Confirm and switches between tabs', async () => {
    const { findByTestId, getByRole, queryByTestId } = render(
      <TestComponent />,
    );

    expect(getByRole('tab', { name: 'To Confirm' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(await findByTestId('Home')).toBeInTheDocument();

    userEvent.click(getByRole('tab', { name: 'Change History' }));
    expect(getByRole('tab', { name: 'Change History' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(queryByTestId('Home')).not.toBeInTheDocument();

    userEvent.click(getByRole('tab', { name: 'To Confirm' }));
    expect(await findByTestId('Home')).toBeInTheDocument();
  });
});
