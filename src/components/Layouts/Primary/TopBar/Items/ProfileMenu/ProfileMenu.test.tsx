import React from 'react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { signOut } from 'next-auth/react';
import TestRouter from '../../../../../../../__tests__/util/TestRouter';
import {
  render,
  waitFor,
} from '../../../../../../../__tests__/util/testingLibraryReactMock';
import {
  getTopBarMock,
  getTopBarMockWithMultipleAccountLists,
} from '../../TopBar.mock';
import TestWrapper from '../../../../../../../__tests__/util/TestWrapper';
import theme from '../../../../../../theme';
import ProfileMenu from './ProfileMenu';

const session = {
  expires: '2021-10-28T14:48:20.897Z',
  user: {
    email: 'Chair Library Bed',
    image: null,
    name: 'Dung Tapestry',
    token: 'superLongJwtString',
  },
};

jest.mock('next-auth/react', () => {
  return {
    signOut: jest.fn().mockImplementation(() => Promise.resolve()),
    getSession: jest.fn().mockImplementation(() => Promise.resolve(session)),
    useSession: jest.fn().mockImplementation(() => Promise.resolve(session)),
  };
});

const router = {
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

describe('ProfileMenu', () => {
  it('default', async () => {
    const { getByTestId, queryByText, getByText } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper mocks={[getTopBarMock()]}>
          <ProfileMenu />
        </TestWrapper>
      </ThemeProvider>,
    );
    await waitFor(() => expect(getByText('John Smith')).toBeInTheDocument());
    userEvent.click(getByTestId('profileMenuButton'));
    expect(queryByText('Manage Organizations')).toBeInTheDocument();
    expect(queryByText('Admin Console')).toBeInTheDocument();
    expect(queryByText('Backend Admin')).toBeInTheDocument();
    expect(queryByText('Sidekiq')).toBeInTheDocument();
  });

  it('should change account list in the router', async () => {
    const { getByTestId, getByText } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper mocks={[getTopBarMock()]}>
          <TestRouter router={router}>
            <ProfileMenu />
          </TestRouter>
        </TestWrapper>
      </ThemeProvider>,
    );
    await waitFor(() => expect(getByText('John Smith')).toBeInTheDocument());
    userEvent.click(getByTestId('profileMenuButton'));
    userEvent.click(getByTestId('accountListSelector'));
    userEvent.click(getByTestId('accountListButton-1'));
    await waitFor(() => expect(router.push).toHaveBeenCalled());
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/accountLists/[accountListId]/test',
      query: {
        accountListId: '1',
      },
    });
  });

  it('should change account list in the router and persist query parameters', async () => {
    const { getByTestId, getByText } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper mocks={[getTopBarMock()]}>
          <TestRouter
            router={{
              ...router,
              pathname: '/accountLists/[accountListId]/test?searchTerm=Cool',
              query: { ...router.query, searchTerm: 'Cool' },
            }}
          >
            <ProfileMenu />
          </TestRouter>
        </TestWrapper>
      </ThemeProvider>,
    );
    await waitFor(() => expect(getByText('John Smith')).toBeInTheDocument());
    userEvent.click(getByTestId('profileMenuButton'));
    userEvent.click(getByTestId('accountListSelector'));
    userEvent.click(getByTestId('accountListButton-1'));
    await waitFor(() => expect(router.push).toHaveBeenCalled());
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/accountLists/[accountListId]/test?searchTerm=Cool',
      query: {
        searchTerm: 'Cool',
        accountListId: '1',
      },
    });
  });

  it('should route to path with account list', async () => {
    const { getByTestId, getByText, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper mocks={[getTopBarMock()]}>
          <TestRouter router={routerNoAccountListId}>
            <ProfileMenu />
          </TestRouter>
        </TestWrapper>
      </ThemeProvider>,
    );
    await waitFor(() => expect(getByText('John Smith')).toBeInTheDocument());
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
    const { getByTestId, getByText } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper mocks={[getTopBarMockWithMultipleAccountLists()]}>
          <TestRouter router={router}>
            <ProfileMenu />
          </TestRouter>
        </TestWrapper>
      </ThemeProvider>,
    );
    await waitFor(() => expect(getByText('John Smith')).toBeInTheDocument());
    expect(getByTestId('accountListName')).toBeInTheDocument();
    expect(getByText('Staff Account')).toBeInTheDocument();
  });

  it('Ensure Sign Out is called with callback', async () => {
    const { getByTestId, getByText, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper mocks={[getTopBarMock()]}>
          <TestRouter router={routerNoAccountListId}>
            <ProfileMenu />
          </TestRouter>
        </TestWrapper>
      </ThemeProvider>,
    );
    await waitFor(() => expect(getByText('John Smith')).toBeInTheDocument());
    expect(queryByTestId('accountListName')).not.toBeInTheDocument();
    userEvent.click(getByTestId('profileMenuButton'));
    await waitFor(() =>
      expect(queryByTestId('profileMenu')).toBeInTheDocument(),
    );
    await waitFor(() => expect(getByText(/sign out/i)).toBeInTheDocument());
    userEvent.click(getByText(/sign out/i));
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: 'signOut' });
  });
});
