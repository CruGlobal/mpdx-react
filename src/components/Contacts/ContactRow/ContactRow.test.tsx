import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@material-ui/core';
import {
  gqlMock,
  GqlMockedProvider,
} from '../../../../__tests__/util/graphqlMocking';
import { ContactRow } from './ContactRow';
import {
  ContactRowFragment,
  ContactRowFragmentDoc,
} from './ContactRow.generated';
import theme from 'src/theme';

const accountListId = 'abc';
const onContactCheckToggle = jest.fn();
const onContactSelected = jest.fn();

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
      <GqlMockedProvider>
        <ThemeProvider theme={theme}>
          <ContactRow
            accountListId={accountListId}
            contact={contact}
            isChecked={false}
            isContactDetailOpen={false}
            onContactCheckToggle={onContactCheckToggle}
            onContactSelected={onContactSelected}
          />
        </ThemeProvider>
      </GqlMockedProvider>,
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

  it('should render check event', () => {
    const { getByRole } = render(
      <GqlMockedProvider>
        <ThemeProvider theme={theme}>
          <ContactRow
            accountListId={accountListId}
            contact={contact}
            isChecked={false}
            isContactDetailOpen={false}
            onContactCheckToggle={onContactCheckToggle}
            onContactSelected={onContactSelected}
          />
        </ThemeProvider>
      </GqlMockedProvider>,
    );

    const checkbox = getByRole('checkbox');
    userEvent.click(checkbox);
    expect(onContactCheckToggle).toHaveBeenCalled();
    expect(checkbox).toHaveProperty('checked', true);
  });

  it('should render contact select event', () => {
    const { getByTestId } = render(
      <GqlMockedProvider>
        <ThemeProvider theme={theme}>
          <ContactRow
            accountListId={accountListId}
            contact={contact}
            isChecked={false}
            isContactDetailOpen={false}
            onContactCheckToggle={onContactCheckToggle}
            onContactSelected={onContactSelected}
          />
        </ThemeProvider>
      </GqlMockedProvider>,
    );

    const rowButton = getByTestId('rowButton');
    userEvent.click(rowButton);
    expect(onContactSelected).toHaveBeenCalled();
  });
});
