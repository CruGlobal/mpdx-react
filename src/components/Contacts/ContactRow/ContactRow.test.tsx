import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import {
  gqlMock,
  GqlMockedProvider,
} from '../../../../__tests__/util/graphqlMocking';
import { ContactsPageProvider } from '../../../../pages/accountLists/[accountListId]/contacts/ContactsPageContext';
import TestRouter from '../../../../__tests__/util/TestRouter';
import { GetUserOptionsQuery } from '../ContactFlow/GetUserOptions.generated';
import useTaskModal from '../../../hooks/useTaskModal';
import { ContactRow } from './ContactRow';
import {
  ContactRowFragment,
  ContactRowFragmentDoc,
} from './ContactRow.generated';
import theme from 'src/theme';

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
        <GqlMockedProvider<GetUserOptionsQuery>>
          <ThemeProvider theme={theme}>
            <ContactsPageProvider>
              <ContactRow contact={contact} />
            </ContactsPageProvider>
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
        <GqlMockedProvider<GetUserOptionsQuery>>
          <ThemeProvider theme={theme}>
            <ContactsPageProvider>
              <ContactRow contact={contact} />
            </ContactsPageProvider>
          </ThemeProvider>
        </GqlMockedProvider>
      </TestRouter>,
    );

    const checkbox = getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    await waitFor(() => userEvent.click(checkbox));
    // TODO: Find a way to check that click event was pressed.
  });

  it('should open log task modal', async () => {
    const { getByTitle } = render(
      <TestRouter router={router}>
        <GqlMockedProvider<GetUserOptionsQuery>>
          <ThemeProvider theme={theme}>
            <ContactsPageProvider>
              <ContactRow contact={contact} />
            </ContactsPageProvider>
          </ThemeProvider>
        </GqlMockedProvider>
      </TestRouter>,
    );

    const taskButton = getByTitle('Log Task');
    await waitFor(() => userEvent.click(taskButton));
    // TODO: Find a way to check that click event was pressed.
    expect(openTaskModal).toHaveBeenCalledWith({
      view: 'log',
      defaultValues: {
        contactIds: ['test-id'],
      },
    });
  });

  it('should render contact select event', () => {
    const { getByTestId } = render(
      <TestRouter router={router}>
        <GqlMockedProvider<GetUserOptionsQuery>>
          <ThemeProvider theme={theme}>
            <ContactsPageProvider>
              <ContactRow contact={contact} />
            </ContactsPageProvider>
          </ThemeProvider>
        </GqlMockedProvider>
      </TestRouter>,
    );

    const rowButton = getByTestId('rowButton');
    userEvent.click(rowButton);
    // TODO: Find a way to check that click event was pressed.
  });
});
