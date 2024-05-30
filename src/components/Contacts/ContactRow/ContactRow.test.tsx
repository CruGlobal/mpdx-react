import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider, gqlMock } from '__tests__/util/graphqlMocking';
import { ContactsWrapper } from 'pages/accountLists/[accountListId]/contacts/ContactsWrapper';
import { TaskModalEnum } from 'src/components/Task/Modal/TaskModal';
import theme from 'src/theme';
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
    preloadTaskModal: jest.fn(),
  });
});

describe('ContactsRow', () => {
  it('default', () => {
    const { getByText } = render(
      <TestRouter router={router}>
        <GqlMockedProvider>
          <ThemeProvider theme={theme}>
            <ContactsWrapper>
              <ContactRow contact={contact} />
            </ContactsWrapper>
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
            <ContactsWrapper>
              <ContactRow contact={contact} />
            </ContactsWrapper>
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
            <ContactsWrapper>
              <ContactRow contact={contact} />
            </ContactsWrapper>
          </ThemeProvider>
        </GqlMockedProvider>
      </TestRouter>,
    );

    const taskButton = getByTitle('Log Task');
    userEvent.click(taskButton);
    // TODO: Find a way to check that click event was pressed.
    expect(openTaskModal).toHaveBeenCalledWith({
      view: TaskModalEnum.Log,
      defaultValues: {
        contactIds: ['test-id'],
      },
    });
  });

  it('should render contact select event', () => {
    const { getByTestId } = render(
      <TestRouter router={router}>
        <GqlMockedProvider>
          <ThemeProvider theme={theme}>
            <ContactsWrapper>
              <ContactRow contact={contact} />
            </ContactsWrapper>
          </ThemeProvider>
        </GqlMockedProvider>
      </TestRouter>,
    );

    const rowButton = getByTestId('rowButton');
    userEvent.click(rowButton);
    // TODO: Find a way to check that click event was pressed.
  });
});
