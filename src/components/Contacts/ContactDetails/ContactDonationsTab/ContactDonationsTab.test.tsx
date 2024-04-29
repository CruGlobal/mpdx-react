import React from 'react';
import { DateTime } from 'luxon';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import { ContactDetailProvider } from '../ContactDetailContext';
import { ContactDonationsTab } from './ContactDonationsTab';
import { GetContactDonationsQuery } from './ContactDonationsTab.generated';

const accountListId = 'account-list-1';
const contactId = 'contact-id-1';

describe('ContactDonationsTab', () => {
  it('test renderer', async () => {
    const { findByRole } = render(
      <GqlMockedProvider<{ GetContactDonations: GetContactDonationsQuery }>
        mocks={{
          GetContactDonations: {
            contact: {
              nextAsk: DateTime.now().plus({ month: 5 }).toISO(),
              pledgeStartDate: DateTime.now().minus({ month: 5 }).toISO(),
              pledgeCurrency: 'USD',
              lastDonation: {
                donationDate: DateTime.now().toISO(),
              },
            },
          },
        }}
      >
        <ContactDetailProvider>
          <ContactDonationsTab
            accountListId={accountListId}
            contactId={contactId}
          />
        </ContactDetailProvider>
      </GqlMockedProvider>,
    );
    expect(await findByRole('region')).toBeVisible();
  });
});
