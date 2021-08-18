import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@material-ui/core';
import { SnackbarProvider } from 'notistack';
import theme from '../../../../../../theme';
import TestRouter from '../../../../../../../__tests__/util/TestRouter';
import { GqlMockedProvider } from '../../../../../../../__tests__/util/graphqlMocking';
import useTaskDrawer from '../../../../../../hooks/useTaskDrawer';
import AddMenu from './AddMenu';

const openTaskDrawer = jest.fn();

jest.mock('../../../../../../hooks/useTaskDrawer');

const router = {
  push: jest.fn(),
  query: { accountListId: 'accountListId-1' },
  isReady: true,
};

describe('AddMenu', () => {
  beforeEach(() => {
    (useTaskDrawer as jest.Mock).mockReturnValue({
      openTaskDrawer,
    });
  });

  it('default', async () => {
    const { getByRole, getByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <AddMenu />
            </GqlMockedProvider>
          </ThemeProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    userEvent.click(getByRole('button', { name: 'Add Button' }));
    await waitFor(() => expect(getByText('Add Contact')).toBeInTheDocument());
  });

  it('handles menu item click | Add Contact', async () => {
    const { getByRole, getByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <AddMenu />
            </GqlMockedProvider>
          </ThemeProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    userEvent.click(getByRole('button', { name: 'Add Button' }));
    await waitFor(() => expect(getByText('Add Contact')).toBeInTheDocument());
    userEvent.click(getByText('Add Contact'));
    await waitFor(() => expect(getByText('New Contact')).toBeInTheDocument());
  });

  it('handles menu item click | Add Task', async () => {
    const { getByRole, getByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <AddMenu />
            </GqlMockedProvider>
          </ThemeProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    userEvent.click(getByRole('button', { name: 'Add Button' }));
    await waitFor(() => expect(getByText('Add Task')).toBeInTheDocument());
    userEvent.click(getByText('Add Task'));
    await waitFor(() => expect(openTaskDrawer).toHaveBeenCalledWith({}));
  });
});
