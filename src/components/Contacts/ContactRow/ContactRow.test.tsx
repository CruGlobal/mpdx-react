import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider, gqlMock } from '__tests__/util/graphqlMocking';
import { TaskModalEnum } from 'src/components/Task/Modal/TaskModal';
import { ContactPanelProvider } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import theme from 'src/theme';
import useTaskModal from '../../../hooks/useTaskModal';
import {
  ContactsContext,
  ContactsType,
} from '../ContactsContext/ContactsContext';
import { ContactRow } from './ContactRow';
import {
  ContactRowFragment,
  ContactRowFragmentDoc,
} from './ContactRow.generated';

const accountListId = 'account-list-1';

const router = {
  pathname: '/accountLists/[accountListId]/contacts/[...contactId]',
  query: {
    accountListId,
    contactId: ['00000000-0000-0000-0000-000000000000'],
  },
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
const toggleSelectionById = jest.fn();
const isRowChecked = jest.fn();

const Components = () => (
  <TestRouter router={router}>
    <GqlMockedProvider>
      <ThemeProvider theme={theme}>
        <ContactsContext.Provider
          value={
            {
              accountListId,
              toggleSelectionById,
              isRowChecked,
            } as unknown as ContactsType
          }
        >
          <ContactPanelProvider>
            <ContactRow contact={contact} />
          </ContactPanelProvider>
        </ContactsContext.Provider>
      </ThemeProvider>
    </GqlMockedProvider>
  </TestRouter>
);

beforeEach(() => {
  (useTaskModal as jest.Mock).mockReturnValue({
    openTaskModal,
    preloadTaskModal: jest.fn(),
  });
});

describe('ContactsRow', () => {
  it('default', () => {
    const { getByText } = render(<Components />);

    expect(
      getByText(
        [
          contact.primaryAddress?.street,
          `${contact.primaryAddress?.city}${
            contact.primaryAddress?.city && ','
          }`,
          contact.primaryAddress?.state,
          contact.primaryAddress?.postalCode,
        ].join(' '),
      ),
    ).toBeInTheDocument();
  });

  it('should render check event', async () => {
    const { getByRole } = render(<Components />);

    const checkbox = getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('should open log task modal', async () => {
    const { getByRole } = render(<Components />);

    const taskButton = getByRole('button', { name: 'Log Task' });
    userEvent.click(taskButton);
    expect(openTaskModal).toHaveBeenCalledWith({
      view: TaskModalEnum.Log,
      defaultValues: {
        contactIds: ['test-id'],
      },
    });
  });

  it('should render contact select event', () => {
    isRowChecked.mockImplementationOnce((id) => id === contact.id);

    const { getByTestId } = render(<Components />);

    expect(getByTestId('rowButton')).toHaveAttribute(
      'href',
      `/accountLists/${accountListId}/contacts/${contact.id}`,
    );
  });
});
