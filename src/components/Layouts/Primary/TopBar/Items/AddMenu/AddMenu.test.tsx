import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import useTaskModal from '../../../../../../hooks/useTaskModal';
import theme from '../../../../../../theme';
import AddMenu from './AddMenu';

const openTaskModal = jest.fn();

jest.mock('../../../../../../hooks/useTaskModal');

const router = {
  push: jest.fn(),
  query: { accountListId: 'accountListId-1' },
  isReady: true,
};

describe('AddMenu', () => {
  beforeEach(() => {
    (useTaskModal as jest.Mock).mockReturnValue({
      openTaskModal,
      preloadTaskModal: jest.fn(),
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
    userEvent.click(getByRole('button', { hidden: true, name: 'Add Button' }));
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
    userEvent.click(getByRole('button', { hidden: true, name: 'Add Button' }));
    await waitFor(() => expect(getByText('Add Contact')).toBeInTheDocument());
    userEvent.click(getByText('Add Contact'));
    await waitFor(() => expect(getByText('New Contact')).toBeInTheDocument());
  });

  it('handles menu item click | Add Multiple Contacts', async () => {
    const { getByRole, getByText, getAllByText } = render(
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
    userEvent.click(getByRole('button', { hidden: true, name: 'Add Button' }));
    await waitFor(() =>
      expect(getByText('Add Multiple Contacts')).toBeInTheDocument(),
    );
    getAllByText('Add Multiple Contacts').map(async (text) => {
      userEvent.click(text);
      await waitFor(() =>
        expect(getByText('Add Multiple Contacts')).toBeInTheDocument(),
      );
    });
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
    userEvent.click(getByRole('button', { hidden: true, name: 'Add Button' }));
    await waitFor(() => expect(getByText('Add Task')).toBeInTheDocument());
    userEvent.click(getByText('Add Task'));
    await waitFor(() =>
      expect(openTaskModal).toHaveBeenCalledWith({ view: 'add' }),
    );
  });
});
