import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import { signOut } from 'next-auth/react';
import TestWrapper from '../../../../../../../__tests__/util/TestWrapper';
import TestRouter from '../../../../../../../__tests__/util/TestRouter';
import theme from '../../../../../../theme';
import { getTopBarMock } from '../../../TopBar/TopBar.mock';
import { ProfileMenuPanel } from './ProfileMenuPanel';

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
  };
});

const router = {
  pathname: '/accountLists/[accountListId]/test',
  query: { accountListId: '1' },
  push: jest.fn(),
};

describe('ProfileMenuPanelForNavBar', () => {
  it('default', async () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper mocks={[getTopBarMock()]}>
          <ProfileMenuPanel />
        </TestWrapper>
      </ThemeProvider>,
    );

    expect(getByTestId('ProfileMenuPanelForNavBar')).toBeInTheDocument();
  });

  it('render an account list button', async () => {
    const { getByTestId } = render(
      <TestRouter router={router}>
        <ThemeProvider theme={theme}>
          <TestWrapper mocks={[getTopBarMock()]}>
            <ProfileMenuPanel />
          </TestWrapper>
        </ThemeProvider>
      </TestRouter>,
    );

    await waitFor(() =>
      expect(getByTestId('accountListSelectorButton')).toBeInTheDocument(),
    );
    userEvent.click(getByTestId('accountListSelectorButton'));
    expect(getByTestId('accountListButton-1')).toBeInTheDocument();
    expect(getByTestId('accountListButton-1')).toHaveStyle(
      'backgroundColor: #383F43;',
    );
  });

  it('should toggle the account list selector drawer', async () => {
    const { getByTestId, queryByTestId } = render(
      <TestRouter router={router}>
        <ThemeProvider theme={theme}>
          <TestWrapper mocks={[getTopBarMock()]}>
            <ProfileMenuPanel />
          </TestWrapper>
        </ThemeProvider>
      </TestRouter>,
    );

    await waitFor(() =>
      expect(getByTestId('accountListSelectorButton')).toBeInTheDocument(),
    );
    expect(
      queryByTestId('closeAccountListDrawerButton'),
    ).not.toBeInTheDocument();
    userEvent.click(getByTestId('accountListSelectorButton'));
    expect(getByTestId('closeAccountListDrawerButton')).toBeInTheDocument();
  });

  it('should call router push', async () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper mocks={[getTopBarMock()]}>
          <TestRouter router={router}>
            <ProfileMenuPanel />
          </TestRouter>
        </TestWrapper>
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(getByTestId('accountListSelectorButton')).toBeInTheDocument(),
    );
    userEvent.click(getByTestId('accountListSelectorButton'));
    userEvent.click(getByTestId('accountListButton-1'));
    await waitFor(() =>
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/accountLists/[accountListId]/',
        query: { accountListId: '1' },
      }),
    );
  });

  it('Ensure Sign Out is called with callback', async () => {
    const { getByText } = render(
      <TestRouter router={router}>
        <ThemeProvider theme={theme}>
          <TestWrapper mocks={[getTopBarMock()]}>
            <ProfileMenuPanel />
          </TestWrapper>
        </ThemeProvider>
      </TestRouter>,
    );

    await waitFor(() => expect(getByText(/sign out/i)).toBeInTheDocument());
    userEvent.click(getByText(/sign out/i));
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: 'signOut' });
  });
});
