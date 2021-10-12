import React from 'react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@material-ui/core';
import {
  render,
  waitFor,
} from '../../../../../../../__tests__/util/testingLibraryReactMock';
import { getTopBarMock } from '../../TopBar.mock';
import TestWrapper from '../../../../../../../__tests__/util/TestWrapper';
import theme from '../../../../../../theme';
import ProfileMenu from './ProfileMenu';
import TestRouter from '__tests__/util/TestRouter';

const router = {
  pathname: '/accountLists/[accountListId]/test',
  query: { accountListId: '123' },
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
    const { getByTestId, queryByText, getByText } = render(
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
    expect(queryByText('Account List Selector')).toBeInTheDocument();
    userEvent.click(getByTestId('accountListSelector'));
    userEvent.click(getByTestId('accountListButton-1'));
    await waitFor(() => expect(router.push).toHaveBeenCalled());
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/accountLists/[accountListId]/',
      query: {
        accountListId: '1',
      },
    });
  });
});
