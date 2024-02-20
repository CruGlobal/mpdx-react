import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSession } from 'next-auth/react';
import { session } from '__tests__/fixtures/session';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetDesignationAccountsQuery } from 'src/components/EditDonationModal/EditDonationModal.generated';
import theme from 'src/theme';
import { MultiPageMenu, NavTypeEnum } from './MultiPageMenu';

const accountListId = 'account-list-1';
const selected = 'salaryCurrency';

const router = {
  query: { accountListId },
  isReady: true,
};

describe('MultiPageMenu', () => {
  it('default', async () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <GqlMockedProvider>
            <MultiPageMenu
              selectedId={selected}
              isOpen={true}
              onClose={() => {}}
              designationAccounts={[]}
              setDesignationAccounts={() => {}}
              navType={NavTypeEnum.Reports}
            />
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );

    expect(getByText('Donations')).toBeInTheDocument();
    expect(getByText('14 Month Partner Report')).toBeInTheDocument();
    expect(getByText('14 Month Salary Report')).toBeInTheDocument();
    expect(getByText('Designation Accounts')).toBeInTheDocument();
    expect(getByText('Responsibility Centers')).toBeInTheDocument();
    expect(getByText('Expected Monthly Total')).toBeInTheDocument();
    expect(getByText('Partner Giving Analysis')).toBeInTheDocument();
    expect(getByText('Coaching')).toBeInTheDocument();
  });

  it('has designation account filter', async () => {
    const mocks = {
      GetDesignationAccounts: {
        designationAccounts: [
          {
            designationAccounts: [
              { id: 'account-1', name: 'Account 1' },
              { id: 'account-2', name: 'Account 2' },
              { id: 'account-3', name: 'Account 3' },
            ],
          },
        ],
      },
    };

    const designationAccounts = ['account-1'];
    const setDesignationAccounts = jest.fn();

    const mutationSpy = jest.fn();
    const { getAllByRole, getByRole, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <GqlMockedProvider<{
            GetDesignationAccounts: GetDesignationAccountsQuery;
          }>
            mocks={mocks}
            onCall={mutationSpy}
          >
            <MultiPageMenu
              selectedId={selected}
              isOpen={true}
              onClose={() => {}}
              designationAccounts={designationAccounts}
              setDesignationAccounts={setDesignationAccounts}
              navType={NavTypeEnum.Reports}
            />
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );

    await waitFor(() => expect(mutationSpy).toHaveBeenCalled());

    userEvent.click(getByRole('combobox', { name: 'Designation Account' }));
    expect(getAllByRole('option').map((option) => option.textContent)).toEqual([
      'Account 2',
      'Account 3',
    ]);
    userEvent.click(getByRole('option', { name: 'Account 2' }));
    expect(setDesignationAccounts).toHaveBeenLastCalledWith([
      'account-1',
      'account-2',
    ]);
    userEvent.click(getByTestId('CancelIcon'));
    expect(setDesignationAccounts).toHaveBeenLastCalledWith([]);
  });

  it('hides designation account filter when there is only one option', async () => {
    const mocks = {
      GetDesignationAccounts: {
        designationAccounts: [
          {
            designationAccounts: [{ id: 'account-1', name: 'Account 1' }],
          },
        ],
      },
    };

    const mutationSpy = jest.fn();
    const { queryByRole } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <GqlMockedProvider<{
            GetDesignationAccounts: GetDesignationAccountsQuery;
          }>
            mocks={mocks}
            onCall={mutationSpy}
          >
            <MultiPageMenu
              selectedId={selected}
              isOpen={true}
              onClose={() => {}}
              designationAccounts={[]}
              setDesignationAccounts={jest.fn()}
              navType={NavTypeEnum.Reports}
            />
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );

    await waitFor(() => expect(mutationSpy).toHaveBeenCalled());

    expect(
      queryByRole('combobox', { name: 'Designation Account' }),
    ).not.toBeInTheDocument();
  });

  it('shows the developer tools', async () => {
    (useSession as jest.MockedFn<typeof useSession>).mockReturnValue({
      data: {
        ...session,
        user: { ...session.user, admin: false, developer: true },
      },
      status: 'authenticated',
      update: () => Promise.resolve(null),
    });

    const mutationSpy = jest.fn();
    const { queryByText, getByText } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <GqlMockedProvider onCall={mutationSpy}>
            <MultiPageMenu
              selectedId={selected}
              isOpen={true}
              onClose={() => {}}
              designationAccounts={[]}
              setDesignationAccounts={jest.fn()}
              navType={NavTypeEnum.Settings}
            />
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );

    await waitFor(() => expect(mutationSpy).toHaveBeenCalled());

    await waitFor(() => {
      expect(queryByText('Manage Organizations')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(getByText('Admin Console')).toBeInTheDocument();
      expect(getByText('Backend Admin')).toBeInTheDocument();
      expect(getByText('Sidekiq')).toBeInTheDocument();
    });
  });

  it('shows the admin tools', async () => {
    (useSession as jest.MockedFn<typeof useSession>).mockReturnValue({
      data: {
        ...session,
        user: { ...session.user, admin: true, developer: false },
      },
      status: 'authenticated',
      update: () => Promise.resolve(null),
    });

    const mutationSpy = jest.fn();
    const { queryByText, getByText } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <GqlMockedProvider onCall={mutationSpy}>
            <MultiPageMenu
              selectedId={selected}
              isOpen={true}
              onClose={() => {}}
              designationAccounts={[]}
              setDesignationAccounts={jest.fn()}
              navType={NavTypeEnum.Settings}
            />
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );

    await waitFor(() => expect(mutationSpy).toHaveBeenCalled());

    await waitFor(() => {
      expect(queryByText('Sidekiq')).not.toBeInTheDocument();
      expect(queryByText('Backend Admin')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(getByText('Manage Organizations')).toBeInTheDocument();
      expect(getByText('Admin Console')).toBeInTheDocument();
    });
  });
});
