import { NextRouter } from 'next/router';
import React from 'react';
import { MockedResponse } from '@apollo/client/testing';
import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import fetchMock from 'jest-fetch-mock';
import { signOut, useSession } from 'next-auth/react';
import { session } from '__tests__/fixtures/session';
import TestRouter from '__tests__/util/TestRouter';
import TestWrapper from '__tests__/util/TestWrapper';
import { render, waitFor } from '__tests__/util/testingLibraryReactMock';
import { TestSetupProvider } from 'src/components/Setup/SetupProvider';
import theme from '../../../../../../theme';
import {
  getTopBarMock,
  getTopBarMockWithMultipleAccountLists,
} from '../../TopBar.mock';
import ProfileMenu from './ProfileMenu';

const mockEnqueue = jest.fn();

jest.mock('notistack', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue,
    };
  },
}));

const defaultRouter = {
  pathname: '/accountLists/[accountListId]/test',
  query: { accountListId: '1' },
  isReady: true,
  push: jest.fn(),
};

const routerNoAccountListId = {
  pathname: '/accountLists/',
  isReady: true,
  push: jest.fn(),
};

interface TestComponentProps {
  router?: Partial<NextRouter>;
  mocks?: MockedResponse[];
  onSetupTour?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  router,
  mocks,
  onSetupTour,
}) => (
  <ThemeProvider theme={theme}>
    <TestWrapper mocks={mocks ?? [getTopBarMock()]}>
      <TestRouter router={router ?? defaultRouter}>
        <TestSetupProvider onSetupTour={onSetupTour}>
          <ProfileMenu />
        </TestSetupProvider>
      </TestRouter>
    </TestWrapper>
  </ThemeProvider>
);

beforeAll(() => {
  // Make the screen wide enough to show all data
  global.innerWidth = 1200;
});

describe('ProfileMenu', () => {
  beforeAll(() => {
    process.env.OAUTH_URL = 'https://auth.mpdx.org';
  });

  it('default', async () => {
    const { getByTestId, getByRole, getByText, findByText } = render(
      <TestComponent />,
    );
    expect(await findByText('John Smith')).toBeInTheDocument();
    userEvent.click(getByTestId('profileMenuButton'));
    expect(getByText('Preferences')).toBeInTheDocument();
    expect(getByText('Manage Organizations')).toBeInTheDocument();
    expect(getByText('Admin Console')).toBeInTheDocument();
    expect(getByText('Backend Admin')).toBeInTheDocument();
    expect(getByText('Sidekiq')).toBeInTheDocument();
    expect(getByRole('button', { name: 'Sign Out' })).toBeInTheDocument();
  });

  it('should not show setting links when no accountListId selected', async () => {
    const { getByTestId, queryByText, findByText } = render(
      <TestComponent router={routerNoAccountListId} />,
    );
    expect(await findByText('John Smith')).toBeInTheDocument();
    userEvent.click(getByTestId('profileMenuButton'));
    expect(queryByText('Manage Organizations')).not.toBeInTheDocument();
    expect(queryByText('Admin Console')).not.toBeInTheDocument();
    expect(queryByText('Backend Admin')).not.toBeInTheDocument();
    expect(queryByText('Sidekiq')).not.toBeInTheDocument();
  });

  it('should change account list in the router', async () => {
    const { getByTestId, findByText } = render(<TestComponent />);
    expect(await findByText('John Smith')).toBeInTheDocument();
    userEvent.click(getByTestId('profileMenuButton'));
    userEvent.click(getByTestId('accountListSelector'));
    userEvent.click(getByTestId('accountListButton-1'));
    await waitFor(() => expect(defaultRouter.push).toHaveBeenCalled());
    expect(defaultRouter.push).toHaveBeenCalledWith({
      pathname: '/accountLists/[accountListId]/test',
      query: {
        accountListId: '1',
      },
    });
  });

  it('should change account list in the router and persist query parameters', async () => {
    const { getByTestId, findByText } = render(
      <TestComponent
        router={{
          ...defaultRouter,
          pathname: '/accountLists/[accountListId]/test?searchTerm=Cool',
          query: { ...defaultRouter.query, searchTerm: 'Cool' },
        }}
      />,
    );
    expect(await findByText('John Smith')).toBeInTheDocument();
    userEvent.click(getByTestId('profileMenuButton'));
    userEvent.click(getByTestId('accountListSelector'));
    userEvent.click(getByTestId('accountListButton-1'));
    await waitFor(() => expect(defaultRouter.push).toHaveBeenCalled());
    expect(defaultRouter.push).toHaveBeenCalledWith({
      pathname: '/accountLists/[accountListId]/test?searchTerm=Cool',
      query: {
        searchTerm: 'Cool',
        accountListId: '1',
      },
    });
  });

  it('should route to path with account list', async () => {
    const { getByTestId, findByText, queryByTestId } = render(
      <TestComponent router={routerNoAccountListId} />,
    );
    expect(await findByText('John Smith')).toBeInTheDocument();
    expect(queryByTestId('accountListName')).not.toBeInTheDocument();
    userEvent.click(getByTestId('profileMenuButton'));
    userEvent.click(getByTestId('accountListSelector'));
    userEvent.click(getByTestId('accountListButton-1'));
    await waitFor(() => expect(routerNoAccountListId.push).toHaveBeenCalled());
    expect(routerNoAccountListId.push).toHaveBeenCalledWith({
      pathname: '/accountLists/[accountListId]/',
      query: {
        accountListId: '1',
      },
    });
  });

  it('should display account name if user has two or more account lists', async () => {
    const { findByText, getByTestId, getByText } = render(
      <TestComponent mocks={[getTopBarMockWithMultipleAccountLists()]} />,
    );
    expect(await findByText('John Smith')).toBeInTheDocument();
    expect(getByTestId('accountListName')).toBeInTheDocument();
    expect(getByText('Staff Account')).toBeInTheDocument();
  });

  it('should display avatar', async () => {
    const { findByText, getByTestId } = render(
      <TestComponent mocks={[getTopBarMockWithMultipleAccountLists()]} />,
    );
    expect(await findByText('John Smith')).toBeInTheDocument();
    expect(getByTestId('AvatarInTopBar')).toBeInTheDocument();
    userEvent.click(getByTestId('profileMenuButton'));
    await waitFor(() => expect(getByTestId('profileMenu')).toBeInTheDocument());
    expect(getByTestId('AvatarProfileImage')).toBeInTheDocument();
  });

  it('should display placeholder if there is no avatar', async () => {
    const { findByText, getByTestId, queryByTestId } = render(
      <TestComponent />,
    );
    expect(await findByText('John Smith')).toBeInTheDocument();
    expect(getByTestId('AccountIconInTopBar')).toBeInTheDocument();
    userEvent.click(getByTestId('profileMenuButton'));
    await waitFor(() => expect(getByTestId('profileMenu')).toBeInTheDocument());
    await waitFor(() =>
      expect(queryByTestId('AvatarProfileImage')).not.toBeInTheDocument(),
    );
    expect(getByTestId('AvatarProfileLetter')).toBeInTheDocument();
  });

  it('Ensure Sign Out is called with callback', async () => {
    const { findByText, getByTestId, getByText, queryByTestId } = render(
      <TestComponent router={routerNoAccountListId} />,
    );
    expect(await findByText('John Smith')).toBeInTheDocument();
    expect(queryByTestId('accountListName')).not.toBeInTheDocument();
    userEvent.click(getByTestId('profileMenuButton'));
    await waitFor(() =>
      expect(queryByTestId('profileMenu')).toBeInTheDocument(),
    );
    await waitFor(() => expect(getByText(/sign out/i)).toBeInTheDocument());
    userEvent.click(getByText(/sign out/i));
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: 'signOut' });
  });

  it('hides links during the setup tour', async () => {
    const { findByText, getByRole, getByTestId, queryByText } = render(
      <TestComponent router={routerNoAccountListId} onSetupTour />,
    );

    expect(await findByText('John Smith')).toBeInTheDocument();
    userEvent.click(getByTestId('profileMenuButton'));
    expect(queryByText('Preferences')).not.toBeInTheDocument();
    expect(getByRole('button', { name: 'Sign Out' })).toBeInTheDocument();
  });
});

describe('ProfileMenu while Impersonating', () => {
  fetchMock.enableMocks();
  window = Object.create(window);
  const url = 'https://mpdx.org';
  Object.defineProperty(window, 'location', {
    value: {
      href: url,
    },
    writable: true,
  });

  beforeEach(() => {
    process.env.OAUTH_URL = 'https://auth.mpdx.org';

    (useSession as jest.MockedFn<typeof useSession>).mockReturnValue({
      data: {
        ...session,
        user: { ...session.user, impersonating: true },
      },
      status: 'authenticated',
      update: () => Promise.resolve(null),
    });
  });

  it('Should remove impersonating cookies and redirect user to Angular MPDX', async () => {
    fetchMock.resetMocks();
    fetchMock.mockResponses([
      JSON.stringify({ status: 'success' }),
      { status: 200 },
    ]);

    const { getByTestId, getByText, queryByTestId } = render(<TestComponent />);
    await waitFor(() =>
      expect(getByText('Impersonating John Smith')).toBeInTheDocument(),
    );
    expect(queryByTestId('accountListName')).not.toBeInTheDocument();
    userEvent.click(getByTestId('profileMenuButton'));
    await waitFor(() =>
      expect(queryByTestId('profileMenu')).toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(getByText(/stop impersonating/i)).toBeInTheDocument(),
    );
    userEvent.click(getByText(/stop impersonating/i));

    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Stopping impersonation and redirecting you to the login page',
        {
          variant: 'success',
        },
      ),
    );

    await waitFor(() =>
      expect(window.location.href).toEqual(
        `${process.env.SITE_URL}/api/stop-impersonating?accountListId=1&userId=user-1&path=%2Flogout`,
      ),
    );
  });
});
//eslint-disable-next-line jest/no-commented-out-tests
// Add this back in after it goes live
// it('should use defaultAccountList if accountListId does not exist', async () => {
//   const { getByTestId, queryByTestId, getByRole } = render(
//     <ThemeProvider theme={theme}>
//       <TestWrapper mocks={[getTopBarNoAccountListMock()]}>
//         <TestRouter router={routerNoAccountListId}>
//           <ProfileMenu />
//         </TestRouter>
//       </TestWrapper>
//     </ThemeProvider>,
//   );
//   expect(queryByTestId('accountListName')).not.toBeInTheDocument();
//   userEvent.click(getByTestId('profileMenuButton'));
//   await waitFor(() =>
//     expect(getByRole('menuitem', { name: 'Preferences' })).toHaveAttribute(
//       'href',
//       '/accountLists/12345/settings/preferences',
//     ),
//   );
// });
