import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { DateTime } from 'luxon';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import { ContactPanelProvider } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import theme from 'src/theme';
import { ContactDetailProvider } from '../ContactDetailContext';
import { ContactDonationsTab } from './ContactDonationsTab';
import { GetContactDonationsQuery } from './ContactDonationsTab.generated';

const accountListId = 'account-list-1';
const contactId = 'contact-id-1';

describe('ContactDonationsTab', () => {
  it('test renderer', async () => {
    const { findByRole } = render(
      <TestRouter>
        <ThemeProvider theme={theme}>
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
            <ContactPanelProvider>
              <ContactDetailProvider>
                <ContactDonationsTab
                  accountListId={accountListId}
                  contactId={contactId}
                />
              </ContactDetailProvider>
            </ContactPanelProvider>
          </GqlMockedProvider>
        </ThemeProvider>
      </TestRouter>,
    );
    expect(await findByRole('region')).toBeVisible();
  });
});
