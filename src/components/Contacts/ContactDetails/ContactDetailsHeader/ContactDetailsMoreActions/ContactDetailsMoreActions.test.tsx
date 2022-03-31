import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import { SnackbarProvider } from 'notistack';
import userEvent from '@testing-library/user-event';
import { InMemoryCache } from '@apollo/client';
import TestRouter from '../../../../../../__tests__/util/TestRouter';
import theme from '../../../../../theme';
import { GqlMockedProvider } from '../../../../../../__tests__/util/graphqlMocking';
import {
  ContactsDocument,
  ContactsQuery,
} from '../../../../../../pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { ContactDetailsTabQuery } from '../../ContactDetailsTab/ContactDetailsTab.generated';
import { ContactDetailsMoreAcitions } from './ContactDetailsMoreActions';

const accountListId = '111';
const contactId = 'contact-1';
const router = {
  query: { searchTerm: undefined, accountListId },
  push: jest.fn(),
};
const onClose = jest.fn();

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

const mocks = {
  ContactDetailsTab: {
    contact: {
      id: contactId,
      name: 'Person, Test',
      addresses: {
        nodes: [
          {
            id: '123',
            street: '123 Sesame Street',
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            country: 'USA',
            primaryMailingAddress: true,
          },
          {
            id: '321',
            street: '4321 Sesame Street',
            city: 'Florida',
            state: 'FL',
            postalCode: '10001',
            country: 'USA',
            primaryMailingAddress: false,
          },
        ],
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

describe('ContactDetailsMoreActions', () => {
  it('handles deleting contact', async () => {
    const cache = new InMemoryCache();
    jest.spyOn(cache, 'writeQuery');

    const data: ContactsQuery = {
      contacts: {
        nodes: [
          {
            id: contactId,
            avatar: '',
            name: 'Person, Test',
            starred: false,
            pledgeReceived: false,
            people: {
              nodes: [
                {
                  anniversaryDay: null,
                  anniversaryMonth: null,
                  birthdayDay: null,
                  birthdayMonth: null,
                },
              ],
            },
            uncompletedTasksCount: 0,
          },
        ],
        pageInfo: { endCursor: 'Mg', hasNextPage: false },
        totalCount: 1,
      },
      allContacts: {
        totalCount: 1,
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

    const { queryAllByText, queryByText, getByRole, getByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<ContactDetailsTabQuery>
              mocks={mocks}
              cache={cache}
            >
              <ContactDetailsMoreAcitions
                contactId={contactId}
                onClose={onClose}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    userEvent.click(
      getByRole('button', { hidden: true, name: 'More Actions' }),
    );
    expect(getByText('Delete Contact')).toBeInTheDocument();
    userEvent.click(queryAllByText('Delete Contact')[0]);
    userEvent.click(queryAllByText('delete contact')[0]);
    await waitFor(() =>
      expect(cache.writeQuery).toHaveBeenCalledWith({
        query: ContactsDocument,
        variables: {
          accountListId,
          searchTerm: undefined,
          after: undefined,
        },
        data: {
          allContacts: {
            totalCount: 1,
          },
          contacts: {
            nodes: [],
            pageInfo: { endCursor: 'Mg', hasNextPage: false },
            totalCount: 0,
          },
        },
      }),
    );
    expect(onClose).toHaveBeenCalled();
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
