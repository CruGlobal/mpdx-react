import React from 'react';
import { MockedResponse } from '@apollo/client/testing';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { signOut } from 'next-auth/react';
import TestRouter from '__tests__/util/TestRouter';
import TestWrapper from '__tests__/util/TestWrapper';
import { mockSession } from '__tests__/util/mockSession';
import { TestSetupProvider } from 'src/components/Setup/SetupProvider';
import { ImpersonationRoleEnum } from 'src/graphql/types.generated';
import { ImpersonatorRole } from 'src/lib/impersonationAccess';
import theme from 'src/theme';
import { getTopBarMock } from '../../../TopBar/TopBar.mock';
import { ProfileMenuPanel } from './ProfileMenuPanel';

const router = {
  isReady: true,
  pathname: '/accountLists/[accountListId]/test',
  query: { accountListId: '1' },
  push: jest.fn(),
};

interface TestComponentProps {
  onSetupTour?: boolean;
  mocks?: MockedResponse[];
}

const TestComponent: React.FC<TestComponentProps> = ({
  onSetupTour,
  mocks = [getTopBarMock()],
}) => (
  <ThemeProvider theme={theme}>
    <TestWrapper mocks={mocks}>
      <TestRouter router={router}>
        <TestSetupProvider onSetupTour={onSetupTour}>
          <ProfileMenuPanel />
        </TestSetupProvider>
      </TestRouter>
    </TestWrapper>
  </ThemeProvider>
);

describe('ProfileMenuPanelForNavBar', () => {
  beforeAll(() => {
    process.env.OAUTH_URL = 'https://auth.mpdx.org';
  });

  it('default', () => {
    const { getByTestId } = render(<TestComponent />);

    expect(getByTestId('ProfileMenuPanelForNavBar')).toBeInTheDocument();
  });

  it('render an account list button', async () => {
    const { findByTestId, getByTestId, getByText } = render(<TestComponent />);

    userEvent.click(await findByTestId('accountListSelectorButton'));
    expect(getByTestId('accountListButton-1')).toBeInTheDocument();
    expect(getByTestId('accountListButton-1')).toHaveStyle(
      'backgroundColor: #9C9FA1;',
    );
    expect(getByText('Preferences')).toBeInTheDocument();
  });

  it('should toggle the account list selector drawer', async () => {
    const { findByTestId, getByTestId, queryByTestId } = render(
      <TestComponent />,
    );

    expect(await findByTestId('accountListSelectorButton')).toBeInTheDocument();
    expect(
      queryByTestId('closeAccountListDrawerButton'),
    ).not.toBeInTheDocument();
    userEvent.click(getByTestId('accountListSelectorButton'));
    expect(getByTestId('closeAccountListDrawerButton')).toBeInTheDocument();
  });

  it('should call router push', async () => {
    const { findByTestId, getByTestId } = render(<TestComponent />);

    userEvent.click(await findByTestId('accountListSelectorButton'));
    userEvent.click(getByTestId('accountListButton-1'));
    await waitFor(() =>
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/accountLists/[accountListId]/test',
        query: { accountListId: '1' },
      }),
    );
  });

  it('Ensure Sign Out is called with callback', () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Sign Out' }));
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: 'signOut' });
  });

  it('hides links during the setup tour', async () => {
    const { findByTestId, getByRole, getByTestId, queryByText } = render(
      <TestComponent onSetupTour />,
    );

    userEvent.click(await findByTestId('accountListSelectorButton'));
    userEvent.click(getByTestId('accountListButton-1'));
    expect(getByRole('button', { name: 'Sign Out' })).toBeInTheDocument();
    expect(queryByText('Preferences')).not.toBeInTheDocument();
  });
});

describe('ProfileMenuPanel by impersonator role', () => {
  beforeAll(() => {
    process.env.OAUTH_URL = 'https://auth.mpdx.org';
  });

  it('hides the admin links but keeps Preferences for a helpdesk_admin impersonator', async () => {
    mockSession({
      impersonating: true,
      impersonatorRole: ImpersonatorRole.HelpdeskAdmin,
    });

    const { findByTestId, getByText, queryByText } = render(<TestComponent />);

    // The account list selector renders once the top bar data has arrived
    expect(await findByTestId('accountListSelectorButton')).toBeInTheDocument();
    expect(getByText('Preferences')).toBeInTheDocument();
    expect(queryByText('Manage Organizations')).not.toBeInTheDocument();
    expect(queryByText('Admin Console')).not.toBeInTheDocument();
    expect(queryByText('Backend Admin')).not.toBeInTheDocument();
    expect(queryByText('Sidekiq')).not.toBeInTheDocument();
  });

  it.each([ImpersonatorRole.HrLeader, ImpersonatorRole.MpdLeader, undefined])(
    'hides every settings link for a %s impersonator',
    async (role) => {
      mockSession({ impersonating: true, impersonatorRole: role });

      const { findByTestId, queryByText } = render(<TestComponent />);

      expect(
        await findByTestId('accountListSelectorButton'),
      ).toBeInTheDocument();
      expect(queryByText('Preferences')).not.toBeInTheDocument();
      expect(queryByText('Manage Organizations')).not.toBeInTheDocument();
      expect(queryByText('Admin Console')).not.toBeInTheDocument();
      expect(queryByText('Backend Admin')).not.toBeInTheDocument();
      expect(queryByText('Sidekiq')).not.toBeInTheDocument();
    },
  );

  it('shows every link for a developer impersonator', async () => {
    mockSession({
      impersonating: true,
      impersonatorRole: ImpersonatorRole.Developer,
    });

    const { findByText, getByText } = render(<TestComponent />);

    expect(await findByText('Admin Console')).toBeInTheDocument();
    expect(getByText('Preferences')).toBeInTheDocument();
    expect(getByText('Manage Organizations')).toBeInTheDocument();
    expect(getByText('Backend Admin')).toBeInTheDocument();
    expect(getByText('Sidekiq')).toBeInTheDocument();
  });

  it('shows the Admin Console to a role holder who is not an admin when not impersonating', async () => {
    mockSession({ impersonating: false, admin: false, developer: false });

    const { findByText, getByText, queryByText } = render(
      <TestComponent
        mocks={[
          getTopBarMock({
            admin: false,
            developer: false,
            impersonationRole: ImpersonationRoleEnum.HrLeader,
            administrativeOrganizations: { nodes: [] },
          }),
        ]}
      />,
    );

    expect(await findByText('Admin Console')).toBeInTheDocument();
    expect(getByText('Preferences')).toBeInTheDocument();
    expect(queryByText('Manage Organizations')).not.toBeInTheDocument();
    expect(queryByText('Backend Admin')).not.toBeInTheDocument();
    expect(queryByText('Sidekiq')).not.toBeInTheDocument();
  });

  it('hides the Admin Console from a plain user when not impersonating', async () => {
    mockSession({ impersonating: false, admin: false, developer: false });

    const { findByText, queryByText } = render(
      <TestComponent
        mocks={[
          getTopBarMock({
            admin: false,
            developer: false,
            impersonationRole: null,
            administrativeOrganizations: { nodes: [] },
          }),
        ]}
      />,
    );

    expect(await findByText('Preferences')).toBeInTheDocument();
    expect(queryByText('Admin Console')).not.toBeInTheDocument();
    expect(queryByText('Manage Organizations')).not.toBeInTheDocument();
  });
});
