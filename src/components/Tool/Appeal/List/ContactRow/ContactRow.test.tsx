import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider, gqlMock } from '__tests__/util/graphqlMocking';
import { AppealsWrapper } from 'pages/accountLists/[accountListId]/tools/appeals/AppealsWrapper';
import {
  ContactRowFragment,
  ContactRowFragmentDoc,
} from 'src/components/Contacts/ContactRow/ContactRow.generated';
import theme from 'src/theme';
import {
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';
import { ContactRow } from './ContactRow';

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

const setContactFocus = jest.fn();
const contactDetailsOpen = true;
const toggleSelectionById = jest.fn();
const isRowChecked = jest.fn();

const Components = () => (
  <TestRouter router={router}>
    <GqlMockedProvider>
      <ThemeProvider theme={theme}>
        <AppealsWrapper>
          <AppealsContext.Provider
            value={
              {
                setContactFocus,
                isRowChecked,
                contactDetailsOpen,
                toggleSelectionById,
              } as unknown as AppealsType
            }
          >
            <ContactRow contact={contact} />
          </AppealsContext.Provider>
        </AppealsWrapper>
      </ThemeProvider>
    </GqlMockedProvider>
  </TestRouter>
);

describe('ContactsRow', () => {
  it('default', () => {
    const { getByText } = render(<Components />);

    expect(getByText('Test, Name')).toBeInTheDocument();
    expect(getByText('CA$0')).toBeInTheDocument();
  });

  it('should render check event', async () => {
    const { getByRole } = render(<Components />);

    const checkbox = getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('should open contact on click', () => {
    isRowChecked.mockImplementationOnce((id) => id === contact.id);

    const { getByTestId } = render(<Components />);

    expect(setContactFocus).not.toHaveBeenCalled();

    const rowButton = getByTestId('rowButton');
    userEvent.click(rowButton);

    expect(setContactFocus).toHaveBeenCalledWith(contact.id);
  });

  it('should render contact select event', () => {
    isRowChecked.mockImplementationOnce((id) => id === contact.id);

    const { getByTestId } = render(<Components />);

    expect(setContactFocus).not.toHaveBeenCalled();

    const rowButton = getByTestId('rowButton');
    userEvent.click(rowButton);

    expect(setContactFocus).toHaveBeenCalledWith(contact.id);
  });
});
