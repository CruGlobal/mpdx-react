import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@material-ui/core';
import { SnackbarProvider } from 'notistack';
import theme from '../../../../../../theme';
import { AppState } from '../../../../../App/rootReducer';
import { useApp } from '../../../../../App';
import TestRouter from '../../../../../../../__tests__/util/TestRouter';
import { GqlMockedProvider } from '../../../../../../../__tests__/util/graphqlMocking';
import AddMenu from './AddMenu';

const openTaskDrawer = jest.fn();

let state: AppState;
const dispatch = jest.fn();

jest.mock('../../../../../App', () => ({
  useApp: jest.fn(),
}));

const router = {
  push: jest.fn(),
};

describe('AddMenu', () => {
  beforeEach(() => {
    state = { accountListId: 'accountListId-1' };
    (useApp as jest.Mock).mockReturnValue({
      state,
      dispatch,
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

  it('handles menu item click | no custom onClick', async () => {
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

  it('handles menu item click | custom onClick', async () => {
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
