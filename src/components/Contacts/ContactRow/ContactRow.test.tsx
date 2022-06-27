import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@material-ui/core';
import {
  gqlMock,
  GqlMockedProvider,
} from '../../../../__tests__/util/graphqlMocking';
import { ContactsPageProvider } from '../../../../pages/accountLists/[accountListId]/contacts/ContactsPageContext';
import { ContactsQuery } from '../../../../pages/accountLists/[accountListId]/contacts/Contacts.generated';
import TestRouter from '../../../../__tests__/util/TestRouter';
import { ContactRow } from './ContactRow';
import {
  ContactRowFragment,
  ContactRowFragmentDoc,
} from './ContactRow.generated';
import theme from 'src/theme';

const onContactCheckToggle = jest.fn();
const onContactSelected = jest.fn();

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

describe('ContactsRow', () => {
  it('default', () => {
    const { getByText } = render(
      <TestRouter router={router}>
        <GqlMockedProvider<ContactsQuery>>
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
        <GqlMockedProvider<ContactsQuery>>
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
    expect(onContactCheckToggle).toHaveBeenCalled();
  });

  it('should render contact select event', () => {
    const { getByTestId } = render(
      <GqlMockedProvider<ContactsQuery>>
        <ThemeProvider theme={theme}>
          <ContactsPageProvider>
            <ContactRow contact={contact} />
          </ContactsPageProvider>
        </ThemeProvider>
      </GqlMockedProvider>,
    );

    const rowButton = getByTestId('rowButton');
    userEvent.click(rowButton);
    expect(onContactSelected).toHaveBeenCalled();
  });
});
