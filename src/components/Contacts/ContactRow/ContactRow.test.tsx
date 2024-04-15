import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ContactsContext,
  ContactsType,
} from 'pages/accountLists/[accountListId]/contacts/ContactsContext';
import { ContactsPage } from 'pages/accountLists/[accountListId]/contacts/ContactsPage';
import theme from 'src/theme';
import TestRouter from '../../../../__tests__/util/TestRouter';
import {
  GqlMockedProvider,
  gqlMock,
} from '../../../../__tests__/util/graphqlMocking';
import useTaskModal from '../../../hooks/useTaskModal';
import { ContactRow } from './ContactRow';
import {
  ContactRowFragment,
  ContactRowFragmentDoc,
} from './ContactRow.generated';

const accountListId = 'account-list-1';

const router = {
  query: { accountListId },
  isReady: true,
};

const contactMock = {
  id: 'test-id',
  lateAt: null,
  name: 'Test, Name',
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
  pledgeAmount: null,
  pledgeCurrency: 'CAD',
  pledgeFrequency: null,
  primaryAddress: {
    city: 'Any City',
    country: null,
    postalCode: 'Test',
    state: 'TT',
    street: '1111 Test Street',
    updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
  },
  starred: false,
  status: null,
  uncompletedTasksCount: 0,
};

const contact = gqlMock<ContactRowFragment>(ContactRowFragmentDoc, {
  mocks: contactMock,
});

jest.mock('../../../hooks/useTaskModal');

const openTaskModal = jest.fn();

beforeEach(() => {
  (useTaskModal as jest.Mock).mockReturnValue({
    openTaskModal,
  });
});

describe('ContactsRow', () => {
  it('default', () => {
    const { getByText } = render(
      <TestRouter router={router}>
        <GqlMockedProvider>
          <ThemeProvider theme={theme}>
            <ContactsPage>
              <ContactRow contact={contact} />
            </ContactsPage>
          </ThemeProvider>
        </GqlMockedProvider>
      </TestRouter>,
    );

    expect(
      getByText(
        [
          contact.primaryAddress?.street,
          contact.primaryAddress?.city,
          contact.primaryAddress?.state,
          contact.primaryAddress?.postalCode,
        ].join(', '),
      ),
    ).toBeInTheDocument();
  });

  it('should render check event', async () => {
    const { getByRole } = render(
      <TestRouter router={router}>
        <GqlMockedProvider>
          <ThemeProvider theme={theme}>
            <ContactsPage>
              <ContactRow contact={contact} />
            </ContactsPage>
          </ThemeProvider>
        </GqlMockedProvider>
      </TestRouter>,
    );

    const checkbox = getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    userEvent.click(checkbox);
    // TODO: Find a way to check that click event was pressed.
  });

  it('should open log task modal', async () => {
    const { getByTitle } = render(
      <TestRouter router={router}>
        <GqlMockedProvider>
          <ThemeProvider theme={theme}>
            <ContactsPage>
              <ContactRow contact={contact} />
            </ContactsPage>
          </ThemeProvider>
        </GqlMockedProvider>
      </TestRouter>,
    );

    const taskButton = getByTitle('Log Task');
    userEvent.click(taskButton);
    // TODO: Find a way to check that click event was pressed.
    expect(openTaskModal).toHaveBeenCalledWith({
      view: 'log',
      defaultValues: {
        contactIds: ['test-id'],
      },
    });
  });

  it('should open menu on right-click', async () => {
    const getContactUrl = jest.fn().mockReturnValue({
      pathname: '/pathname/contacts/123456',
      filteredQuery: { filter: 'filterOptions' },
    });
    const isRowChecked = jest.fn();
    const onContactCheckToggle = jest.fn();
    const { getAllByRole } = render(
      <TestRouter router={router}>
        <GqlMockedProvider>
          <ThemeProvider theme={theme}>
            <ContactsPage>
              <ContactsContext.Provider
                value={
                  {
                    accountListId: 'accountListId',
                    isRowChecked,
                    contactDetailsOpen: false,
                    getContactUrl,
                    onContactCheckToggle,
                  } as unknown as ContactsType
                }
              >
                <ContactRow contact={contact} />
              </ContactsContext.Provider>
            </ContactsPage>
          </ThemeProvider>
        </GqlMockedProvider>
      </TestRouter>,
    );

    const contactRowLink = getAllByRole('link')[0];

    expect(contactRowLink).toHaveAttribute(
      'href',
      `/pathname/contacts/123456?filter=filterOptions`,
    );
  });
});
