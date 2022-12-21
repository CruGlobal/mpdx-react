import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import React from 'react';
import { GqlMockedProvider } from '../../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../../theme';
import { ContactDetailProvider } from '../../ContactDetailContext';
import TestRouter from '__tests__/util/TestRouter';
import { ContactsPageProvider } from 'pages/accountLists/[accountListId]/contacts/ContactsPageContext';
import { ContactDetailsPartnerAccounts } from './ContactDetailsPartnerAccounts';
import { DeleteDonorAccountMutation } from './DeleteDonorAccount.generated';
import { UpdateContactOtherMutation } from '../Other/EditContactOtherModal/EditContactOther.generated';

const accountListId = 'account-list-1';
const contactId = 'contact-1';

const router = {
  query: { accountListId, contactId: [contactId] },
};

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
              <ContactsPageProvider>
                <ContactDetailProvider>
                  <ContactDetailsPartnerAccounts contact={contact} />
                </ContactDetailProvider>
              </ContactsPageProvider>
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
              <ContactsPageProvider>
                <ContactDetailProvider>
                  <ContactDetailsPartnerAccounts contact={contact} />
                </ContactDetailProvider>
              </ContactsPageProvider>
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
          <GqlMockedProvider<UpdateContactOtherMutation> onCall={mutationSpy}>
            <ThemeProvider theme={theme}>
              <ContactsPageProvider>
                <ContactDetailProvider>
                  <ContactDetailsPartnerAccounts contact={contact} />
                </ContactDetailProvider>
              </ContactsPageProvider>
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
    userEvent.click(getByRole('button', { name: 'submit' }));
    await new Promise((resolve) => setTimeout(resolve, 200));
    const { operation } = mutationSpy.mock.calls[0][0];
    // TODO: get this to have proper variables
    expect(operation.variables).toEqual({ accountListId: '' });
    expect(
      queryByRole('textbox', { name: 'Account Number' }),
    ).not.toBeInTheDocument();
  });

  it('handle clicking delete button', async () => {
    const mutationSpy = jest.fn();
    const { getByText, queryAllByRole } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <GqlMockedProvider<DeleteDonorAccountMutation> onCall={mutationSpy}>
            <ThemeProvider theme={theme}>
              <ContactsPageProvider>
                <ContactDetailProvider>
                  <ContactDetailsPartnerAccounts contact={contact} />
                </ContactDetailProvider>
              </ContactsPageProvider>
            </ThemeProvider>
          </GqlMockedProvider>
        </TestRouter>
      </SnackbarProvider>,
    );

    userEvent.click(queryAllByRole('button', { name: '' })[0]);
    expect(getByText('donor-1')).toBeInTheDocument();
    expect(getByText('donor-2')).toBeInTheDocument();
    await new Promise((resolve) => setTimeout(resolve, 200));
    // TODO: get this to have proper variables
    const { operation } = mutationSpy.mock.calls[0][0];
    expect(operation.variables).toEqual({ accountListId: '' });
  });
});
