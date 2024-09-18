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
import {
  ContactDonorAccountsQuery,
  GetAccountListSalaryOrganizationQuery,
} from './ContactPartnerAccounts.generated';

const accountListId = 'account-list-1';
const contactId = 'contact-1';

const router = {
  query: { accountListId, contactId: [contactId] },
  isReady: true,
};

const mockEnqueue = jest.fn();
const mutationSpy = jest.fn();

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

const ContactDonorAccountsMock: ContactDonorAccountsQuery = {
  contact: {
    id: contactId,
    contactDonorAccounts: {
      nodes: [
        {
          id: 'donor1',
          donorAccount: {
            id: 'account1',
            displayName: 'donor-1',
            accountNumber: 'accountNumber-1',
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
            accountNumber: 'accountNumber-2',
            organization: {
              id: 'org2',
              name: 'org2',
            },
          },
        },
      ],
    },
  },
};

const Components = () => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <GqlMockedProvider<{
        ContactDonorAccounts: ContactDonorAccountsQuery;
        GetAccountListSalaryOrganization: GetAccountListSalaryOrganizationQuery;
      }>
        mocks={{
          ContactDonorAccounts: ContactDonorAccountsMock,
          GetAccountListSalaryOrganization: {
            accountList: { salaryOrganizationId: 'organizationId' },
          },
        }}
        onCall={mutationSpy}
      >
        <ThemeProvider theme={theme}>
          <ContactDetailProvider>
            <ContactDetailsPartnerAccounts
              contactId={contactId}
              accountListId={accountListId}
            />
          </ContactDetailProvider>
        </ThemeProvider>
      </GqlMockedProvider>
    </TestRouter>
  </SnackbarProvider>
);

describe('ContactDetailsPartnerAccounts', () => {
  it('should render donor account', async () => {
    const { findByText, getByText, getAllByText } = render(<Components />);

    expect(await findByText('accountNumber-1')).toBeInTheDocument();
    expect(getByText('accountNumber-2')).toBeInTheDocument();

    expect(getAllByText('Account No:')).toHaveLength(2);
    expect(getAllByText('Account Name:')).toHaveLength(2);
  });

  it('should render new donor account form', async () => {
    const { getByRole, findByText, queryByRole } = render(<Components />);

    expect(await findByText('accountNumber-1')).toBeInTheDocument();

    expect(
      queryByRole('textbox', { name: 'Account Number' }),
    ).not.toBeInTheDocument();
    userEvent.click(getByRole('button', { name: 'Add Partner Account' }));
    expect(
      getByRole('textbox', { name: 'Account Number' }),
    ).toBeInTheDocument();
  });

  it('handle submitting new donor account', async () => {
    const { queryByRole, findByText, getByRole } = render(<Components />);

    expect(await findByText('accountNumber-1')).toBeInTheDocument();

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
        id: contactId,
        donorAccount: {
          accountNumber: 'new-account',
          name: 'new-account',
          organizationId: 'organizationId',
        },
      },
    });
    expect(
      queryByRole('textbox', { name: 'Account Number' }),
    ).not.toBeInTheDocument();
  });

  it('handle clicking delete button', async () => {
    const { getByText, findByText, queryAllByRole } = render(<Components />);

    expect(await findByText('accountNumber-1')).toBeInTheDocument();

    userEvent.click(queryAllByRole('button', { name: '' })[0]);
    expect(getByText('accountNumber-1')).toBeInTheDocument();
    expect(getByText('accountNumber-2')).toBeInTheDocument();
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Partner account deleted!', {
        variant: 'success',
      }),
    );

    expect(
      getOperationByName(mutationSpy, 'DeleteDonorAccount').variables,
    ).toEqual({
      contactId: contactId,
      donorAccountId: 'account1',
    });
  });
});
