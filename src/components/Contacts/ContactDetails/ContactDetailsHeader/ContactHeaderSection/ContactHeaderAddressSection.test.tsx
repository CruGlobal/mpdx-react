import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider, gqlMock } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import {
  ContactDetailsHeaderFragment,
  ContactDetailsHeaderFragmentDoc,
} from '../ContactDetailsHeader.generated';
import { ContactHeaderAddressSection } from './ContactHeaderAddressSection';

const contact = gqlMock<ContactDetailsHeaderFragment>(
  ContactDetailsHeaderFragmentDoc,
  { mocks: { lastDonation: null } },
);

describe('ContactHeaderAddressSection', () => {
  it('should show loading state', async () => {
    const { queryByText } = render(
      <ContactHeaderAddressSection
        accountListId="account-list-1"
        loading={true}
        contact={undefined}
      />,
    );

    expect(queryByText(contact.primaryAddress?.street || '')).toBeNull();
  });

  it('should render with contact details', async () => {
    const { queryByText } = render(
      <ContactHeaderAddressSection
        accountListId="account-list-1"
        loading={false}
        contact={contact}
      />,
    );

    expect(queryByText(contact.envelopeGreeting || '')).toBeInTheDocument();
    expect(
      queryByText(contact.primaryAddress?.street || ''),
    ).toBeInTheDocument();
  });

  it('shows when the address changed and opens its history', async () => {
    const { getByRole, findByRole } = render(
      <ThemeProvider theme={theme}>
        <TestRouter>
          <GqlMockedProvider>
            <ContactHeaderAddressSection
              accountListId="account-list-1"
              loading={false}
              contact={{
                ...contact,
                primaryAddress: {
                  id: 'address-1',
                  street: '2525 Camp Creek Pkwy',
                  city: 'College Park',
                  state: 'GA',
                  postalCode: '30337',
                  country: 'United States',
                },
                latestAddressChange: { id: 'change-1', date: '2024-06-13' },
              }}
            />
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );

    userEvent.click(
      getByRole('button', { name: 'Changed Jun 13, 2024 · See history' }),
    );

    expect(
      within(await findByRole('dialog')).getByText('Address History'),
    ).toBeInTheDocument();
  });

  it('still links to the history when no change was logged', () => {
    const { getByText, getByRole } = render(
      <ContactHeaderAddressSection
        accountListId="account-list-1"
        loading={false}
        contact={{
          ...contact,
          primaryAddress: {
            id: 'address-1',
            street: '2525 Camp Creek Pkwy',
            city: 'College Park',
            state: 'GA',
            postalCode: '30337',
            country: 'United States',
          },
          latestAddressChange: null,
        }}
      />,
    );

    expect(getByText('2525 Camp Creek Pkwy')).toBeInTheDocument();
    expect(getByRole('button', { name: 'See history' })).toBeInTheDocument();
  });
});
