import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from '../../../../../theme';
import { ContactDetailProvider } from '../../ContactDetailContext';
import { ContactDetailsPartnerAccounts } from './ContactDetailsPartnerAccounts';

const accountListId = 'account-list-1';
const contactId = 'contact-1';

const router = {
  query: { accountListId, contactId: [contactId] },
  isReady: true,
};

const mockEnqueue = jest.fn();

const getOperationByName = (mutationSpy: jest.Mock, operationName: string) => {
  const operations = mutationSpy.mock.calls
    .map((call) => call[0].operation)
    .filter((operation) => operation.operationName === operationName);
  expect(operations).toHaveLength(1);
  return operations[0];
};

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

const contact = {
  id: '123',
  contactDonorAccounts: {
    nodes: [
      {
        id: 'donor1',
        donorAccount: {
          id: 'account1',
          displayName: 'donor-1',
          accountNumber: 'donor-1',
          organization: {
            id: 'org1',
            name: 'org1',
          },
        },
      },
      {
        id: 'donor2',
        donorAccount: {
          id: 'account2',
          displayName: 'donor-2',
          accountNumber: 'donor-2',
          organization: {
            id: 'org2',
            name: 'org2',
          },
        },
      },
    ],
  },
};

describe('ContactDetailsPartnerAccounts', () => {
  it('should render donor account', async () => {
    const { getByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <GqlMockedProvider>
            <ThemeProvider theme={theme}>
              <ContactDetailProvider>
                <ContactDetailsPartnerAccounts contact={contact} />
              </ContactDetailProvider>
            </ThemeProvider>
          </GqlMockedProvider>
        </TestRouter>
      </SnackbarProvider>,
    );

    expect(getByText('donor-1')).toBeInTheDocument();
    expect(getByText('donor-2')).toBeInTheDocument();
  });

  it('should render new donor account form', async () => {
    const { getByRole, queryByRole } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <GqlMockedProvider>
            <ThemeProvider theme={theme}>
              <ContactDetailProvider>
                <ContactDetailsPartnerAccounts contact={contact} />
              </ContactDetailProvider>
            </ThemeProvider>
          </GqlMockedProvider>
        </TestRouter>
      </SnackbarProvider>,
    );

    expect(
      queryByRole('textbox', { name: 'Account Number' }),
    ).not.toBeInTheDocument();
    userEvent.click(getByRole('button', { name: 'Add Partner Account' }));
    expect(
      getByRole('textbox', { name: 'Account Number' }),
    ).toBeInTheDocument();
  });

  it('handle submitting new donor account', async () => {
    const mutationSpy = jest.fn();
    const { queryByRole, getByRole } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <GqlMockedProvider onCall={mutationSpy}>
            <ThemeProvider theme={theme}>
              <ContactDetailProvider>
                <ContactDetailsPartnerAccounts contact={contact} />
              </ContactDetailProvider>
            </ThemeProvider>
          </GqlMockedProvider>
        </TestRouter>
      </SnackbarProvider>,
    );

    expect(
      queryByRole('textbox', { name: 'Account Number' }),
    ).not.toBeInTheDocument();
    userEvent.click(getByRole('button', { name: 'Add Partner Account' }));
    expect(
      getByRole('textbox', { name: 'Account Number' }),
    ).toBeInTheDocument();
    userEvent.type(
      getByRole('textbox', { name: 'Account Number' }),
      'new-account',
    );
    userEvent.click(getByRole('button', { name: 'Submit' }));
    await waitFor(() =>
      expect(
        queryByRole('textbox', { name: 'Account Number' }),
      ).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Partner account added!', {
        variant: 'success',
      }),
    );

    expect(
      getOperationByName(mutationSpy, 'UpdateContactOther').variables,
    ).toEqual({
      accountListId,
      attributes: {
        id: contact.id,
        donorAccount: {
          accountNumber: 'new-account',
          name: 'new-account',
          organizationId: '',
        },
      },
    });
    expect(
      queryByRole('textbox', { name: 'Account Number' }),
    ).not.toBeInTheDocument();
  });

  it('handle clicking delete button', async () => {
    const mutationSpy = jest.fn();
    const { getByText, queryAllByRole } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <GqlMockedProvider onCall={mutationSpy}>
            <ThemeProvider theme={theme}>
              <ContactDetailProvider>
                <ContactDetailsPartnerAccounts contact={contact} />
              </ContactDetailProvider>
            </ThemeProvider>
          </GqlMockedProvider>
        </TestRouter>
      </SnackbarProvider>,
    );

    userEvent.click(queryAllByRole('button', { name: '' })[0]);
    expect(getByText('donor-1')).toBeInTheDocument();
    expect(getByText('donor-2')).toBeInTheDocument();
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Partner account deleted!', {
        variant: 'success',
      }),
    );

    expect(
      getOperationByName(mutationSpy, 'DeleteDonorAccount').variables,
    ).toEqual({
      contactId: contact.id,
      donorAccountId: 'account1',
    });
  });
});
