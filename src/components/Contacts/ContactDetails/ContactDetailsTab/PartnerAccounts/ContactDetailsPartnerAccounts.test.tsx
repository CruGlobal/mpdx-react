import React from 'react';
import { ApolloCache, NormalizedCacheObject, gql } from '@apollo/client';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { mockNavigatorOnline } from '__tests__/util/mockNavigatorOnline';
import { createCache } from 'src/lib/apollo/cache';
import theme from '../../../../../theme';
import { ContactDetailProvider } from '../../ContactDetailContext';
import { ContactDetailsPartnerAccounts } from './ContactDetailsPartnerAccounts';
import {
  ContactDonorAccountsQuery,
  GetAccountListSalaryOrganizationQuery,
} from './ContactPartnerAccounts.generated';
import { partnerAccountLabel } from './partnerAccountLabel';

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

const setOnline = mockNavigatorOnline();

const ContactDonorAccountsMock: ContactDonorAccountsQuery = {
  contact: {
    id: contactId,
    contactDonorAccounts: {
      nodes: [
        {
          id: 'donor1',
          donorAccount: {
            id: 'account1',
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

const contactName = 'Smith, John';

const Components = ({
  cache,
}: {
  cache?: ApolloCache<NormalizedCacheObject>;
}) => (
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
        cache={cache}
      >
        <ThemeProvider theme={theme}>
          <ContactDetailProvider>
            <ContactDetailsPartnerAccounts
              contactId={contactId}
              accountListId={accountListId}
              contactName={contactName}
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

    expect(getAllByText('Account Number:')).toHaveLength(2);
    expect(getAllByText('Account Name:')).toHaveLength(2);
    expect(
      getByText(partnerAccountLabel(contactName, 'accountNumber-1')),
    ).toBeInTheDocument();
    expect(
      getByText(partnerAccountLabel(contactName, 'accountNumber-2')),
    ).toBeInTheDocument();
  });

  it('loading partner accounts does not change displayName elsewhere', async () => {
    const cache = createCache();
    const fragment = gql`
      fragment DonorAccountName on DonorAccount {
        displayName
      }
    `;
    cache.writeFragment({
      id: 'DonorAccount:account1',
      fragment,
      data: { __typename: 'DonorAccount', displayName: 'Donor Name' },
    });

    const { findByText } = render(<Components cache={cache} />);

    expect(await findByText('accountNumber-1')).toBeInTheDocument();
    expect(
      cache.readFragment<{ displayName: string }>({
        id: 'DonorAccount:account1',
        fragment,
      })?.displayName,
    ).toBe('Donor Name');
  });

  it('disables the add and delete buttons while offline', async () => {
    setOnline(false);
    const { getByRole, findByText, getAllByRole } = render(<Components />);

    expect(await findByText('accountNumber-1')).toBeInTheDocument();

    expect(getByRole('button', { name: 'Add Partner Account' })).toBeDisabled();
    getAllByRole('button', { name: 'Delete' }).forEach((button) =>
      expect(button).toBeDisabled(),
    );
  });

  it('disables the submit button while offline', async () => {
    const { getByRole, findByText } = render(<Components />);

    expect(await findByText('accountNumber-1')).toBeInTheDocument();
    userEvent.click(getByRole('button', { name: 'Add Partner Account' }));
    userEvent.type(
      getByRole('textbox', { name: 'Account Number' }),
      'new-account',
    );
    await waitFor(() =>
      expect(getByRole('button', { name: 'Submit' })).toBeEnabled(),
    );

    setOnline(false);

    expect(getByRole('button', { name: 'Submit' })).toBeDisabled();
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
    const { getByText, findByText, getAllByRole } = render(<Components />);

    expect(await findByText('accountNumber-1')).toBeInTheDocument();

    userEvent.click(getAllByRole('button', { name: 'Delete' })[0]);
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

  describe('refreshes the partner account list', () => {
    const donorAccountsRequests = () =>
      mutationSpy.mock.calls
        .map((call) => call[0].operation)
        .filter(
          (operation) => operation.operationName === 'ContactDonorAccounts',
        );

    it('after adding a partner account', async () => {
      const { findByText, getByRole } = render(<Components />);

      expect(await findByText('accountNumber-1')).toBeInTheDocument();
      userEvent.click(getByRole('button', { name: 'Add Partner Account' }));
      userEvent.type(
        getByRole('textbox', { name: 'Account Number' }),
        'new-account',
      );
      userEvent.click(getByRole('button', { name: 'Submit' }));

      await waitFor(() => expect(donorAccountsRequests()).toHaveLength(2));
      expect(donorAccountsRequests()[1].variables).toEqual({
        accountListId,
        contactId,
      });
    });

    it('after deleting a partner account', async () => {
      const { findByText, getAllByRole } = render(<Components />);

      expect(await findByText('accountNumber-1')).toBeInTheDocument();
      userEvent.click(getAllByRole('button', { name: 'Delete' })[0]);

      await waitFor(() => expect(donorAccountsRequests()).toHaveLength(2));
      expect(donorAccountsRequests()[1].variables).toEqual({
        accountListId,
        contactId,
      });
    });
  });
});
