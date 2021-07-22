import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import { SnackbarProvider } from 'notistack';
import userEvent from '@testing-library/user-event';
import { InMemoryCache } from '@apollo/client';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import LuxonUtils from '@date-io/luxon';
import TestRouter from '../../../../../__tests__/util/TestRouter';
import theme from '../../../../theme';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import {
  ContactsDocument,
  ContactsQuery,
} from '../../../../../pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { ContactDetailsTab } from './ContactDetailsTab';
import { ContactDetailsTabQuery } from './ContactDetailsTab.generated';

const accountListId = '111';
const contactId = 'contact-1';
const router = {
  query: { searchTerm: undefined, accountListId },
  push: jest.fn(),
};

const mockEnqueue = jest.fn();

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

describe('ContactDetailTab', () => {
  it('loading', () => {
    const { queryByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<ContactDetailsTabQuery>>
              <ContactDetailsTab
                accountListId={accountListId}
                contactId={contactId}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    expect(queryByText('Loading')).toBeInTheDocument();
  });

  it('should render contact details', async () => {
    const mocks = {
      ContactDetailsTab: {
        contact: {
          id: contactId,
          name: 'Person, Test',
          primaryAddress: {
            street: '123 Sesame Street',
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            country: 'USA',
          },
          tagList: ['tag1', 'tag2', 'tag3'],
          people: {
            nodes: [
              {
                id: contactId,
                firstName: 'Test',
                lastName: 'Person',
                primaryPhoneNumber: { number: '555-555-5555' },
                primaryEmailAddress: {
                  email: 'testperson@fake.com',
                },
              },
            ],
          },
          website: 'testperson.com',
        },
      },
    };
    const { queryAllByText, queryByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<ContactDetailsTabQuery> mocks={mocks}>
              <ContactDetailsTab
                accountListId={accountListId}
                contactId={contactId}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    expect(queryAllByText('Person, Test')[0]).toBeInTheDocument();
    expect(queryByText('Test Person')).toBeInTheDocument();
    expect(queryByText('testperson@fake.com')).toBeInTheDocument();
    expect(queryByText('555-555-5555')).toBeInTheDocument();
    expect(queryByText('123 Sesame Street')).toBeInTheDocument();
  });

  it('should close delete modal', async () => {
    const { queryByText, queryAllByText, getByRole } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<ContactDetailsTabQuery>>
              <ContactDetailsTab
                accountListId={accountListId}
                contactId={contactId}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    userEvent.click(queryAllByText('delete contact')[0]);
    userEvent.click(getByRole('button', { name: 'Close' }));
    await waitFor(() =>
      expect(queryByText('Delete Contact')).not.toBeInTheDocument(),
    );
  });

  it('should open edit contact details modal', async () => {
    const { queryByText, getAllByRole } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <MuiPickersUtilsProvider utils={LuxonUtils}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<ContactDetailsTabQuery>>
                <ContactDetailsTab
                  accountListId={accountListId}
                  contactId={contactId}
                />
              </GqlMockedProvider>
            </ThemeProvider>
          </MuiPickersUtilsProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    userEvent.click(getAllByRole('img', { name: 'Edit Icon' })[0]);
    await waitFor(() =>
      expect(queryByText('Edit Contact Details')).toBeInTheDocument(),
    );
  });

  it('should close edit contact details modal', async () => {
    const { queryByText, getAllByRole, getByRole } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <MuiPickersUtilsProvider utils={LuxonUtils}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<ContactDetailsTabQuery>>
                <ContactDetailsTab
                  accountListId={accountListId}
                  contactId={contactId}
                />
              </GqlMockedProvider>
            </ThemeProvider>
          </MuiPickersUtilsProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    userEvent.click(getAllByRole('img', { name: 'Edit Icon' })[0]);
    await waitFor(() =>
      expect(queryByText('Edit Contact Details')).toBeInTheDocument(),
    );
    userEvent.click(getByRole('button', { name: 'Close' }));
    await waitFor(() =>
      expect(queryByText('Edit Contact Details')).not.toBeInTheDocument(),
    );
  });

  it('should open edit contact mailing details modal', async () => {
    const { queryByText, getAllByRole } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <MuiPickersUtilsProvider utils={LuxonUtils}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<ContactDetailsTabQuery>>
                <ContactDetailsTab
                  accountListId={accountListId}
                  contactId={contactId}
                />
              </GqlMockedProvider>
            </ThemeProvider>
          </MuiPickersUtilsProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    userEvent.click(getAllByRole('img', { name: 'Edit Icon' })[5]);
    await waitFor(() =>
      expect(queryByText('Edit Contact Mailing Details')).toBeInTheDocument(),
    );
  });

  it('should close edit contact mailing modal', async () => {
    const { queryByText, getAllByRole, getByRole } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <MuiPickersUtilsProvider utils={LuxonUtils}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<ContactDetailsTabQuery>>
                <ContactDetailsTab
                  accountListId={accountListId}
                  contactId={contactId}
                />
              </GqlMockedProvider>
            </ThemeProvider>
          </MuiPickersUtilsProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    userEvent.click(getAllByRole('img', { name: 'Edit Icon' })[5]);
    await waitFor(() =>
      expect(queryByText('Edit Contact Mailing Details')).toBeInTheDocument(),
    );
    userEvent.click(getByRole('button', { name: 'Close' }));
    await waitFor(() =>
      expect(
        queryByText('Edit Contact Mailing Details'),
      ).not.toBeInTheDocument(),
    );
  });

  it('should open edit contact other details modal', async () => {
    const { queryByText, getAllByRole } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <MuiPickersUtilsProvider utils={LuxonUtils}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<ContactDetailsTabQuery>>
                <ContactDetailsTab
                  accountListId={accountListId}
                  contactId={contactId}
                />
              </GqlMockedProvider>
            </ThemeProvider>
          </MuiPickersUtilsProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    userEvent.click(getAllByRole('img', { name: 'Edit Icon' })[6]);
    await waitFor(() =>
      expect(queryByText('Edit Contact Other Details')).toBeInTheDocument(),
    );
  });

  it('should close edit contact other details modal', async () => {
    const { queryByText, getAllByRole, getByRole } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <MuiPickersUtilsProvider utils={LuxonUtils}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<ContactDetailsTabQuery>>
                <ContactDetailsTab
                  accountListId={accountListId}
                  contactId={contactId}
                />
              </GqlMockedProvider>
            </ThemeProvider>
          </MuiPickersUtilsProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    userEvent.click(getAllByRole('img', { name: 'Edit Icon' })[6]);
    await waitFor(() =>
      expect(queryByText('Edit Contact Other Details')).toBeInTheDocument(),
    );
    userEvent.click(getByRole('button', { name: 'Close' }));
    await waitFor(() =>
      expect(queryByText('Edit Contact Other Details')).not.toBeInTheDocument(),
    );
  });

  it('handles deleting contact', async () => {
    const cache = new InMemoryCache();
    jest.spyOn(cache, 'writeQuery');
    const mocks = {
      ContactDetailsTab: {
        contact: {
          id: contactId,
          name: 'Person, Test',
          primaryAddress: {
            street: '123 Sesame Street',
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            country: 'USA',
          },
          tagList: ['tag1', 'tag2', 'tag3'],
          people: {
            nodes: [
              {
                id: contactId,
                firstName: 'Test',
                lastName: 'Person',
                primaryPhoneNumber: { number: '555-555-5555' },
                primaryEmailAddress: {
                  email: 'testperson@fake.com',
                },
              },
            ],
          },
          website: 'testperson.com',
        },
      },
      DeleteContact: {
        deleteContact: {
          id: contactId,
        },
      },
    };

    const data: ContactsQuery = {
      contacts: {
        nodes: [
          {
            id: contactId,
            name: 'Person, Test',
            starred: false,
            people: {
              nodes: [],
            },
          },
        ],
      },
    };
    cache.writeQuery({
      query: ContactsDocument,
      variables: {
        accountListId,
        searchTerm: undefined,
      },
      data,
    });

    const { queryAllByText, queryByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<ContactDetailsTabQuery>
              mocks={mocks}
              cache={cache}
            >
              <ContactDetailsTab
                accountListId={accountListId}
                contactId={contactId}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    expect(queryAllByText('Person, Test')[0]).toBeInTheDocument();
    userEvent.click(queryAllByText('delete contact')[0]);
    userEvent.click(queryAllByText('delete contact')[1]);
    await waitFor(() =>
      expect(cache.writeQuery).toHaveBeenCalledWith({
        query: ContactsDocument,
        variables: {
          accountListId,
          searchTerm: undefined,
        },
        data: {
          contacts: {
            nodes: [],
          },
        },
      }),
    );
    await waitFor(() =>
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/accountLists/[accountListId]/contacts',
        query: {
          accountListId,
          searchTerm: undefined,
        },
      }),
    );
    expect(mockEnqueue).toHaveBeenCalledWith('Contact successfully deleted', {
      variant: 'success',
    });
  });
});
