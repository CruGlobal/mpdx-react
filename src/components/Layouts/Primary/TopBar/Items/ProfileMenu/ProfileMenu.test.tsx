import React from 'react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material';
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
});
