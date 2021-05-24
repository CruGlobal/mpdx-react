import { renderHook } from '@testing-library/react-hooks';
import { DateTime } from 'luxon';
import React from 'react';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { render } from '../../../../../__tests__/util/testingLibraryReactMock';
import { ContactDonationsTab } from './ContactDonationsTab';
import {
  GetContactDonationsQuery,
  useGetContactDonationsQuery,
} from './ContactDonationsTab.generated';

const accountListId = 'account-list-1';
const contactId = 'contact-id-1';

describe('ContactDonationsTab', () => {
  it('test query', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () =>
        useGetContactDonationsQuery({
          variables: {
            accountListId: accountListId,
            contactId: contactId,
          },
        }),
      { wrapper: GqlMockedProvider },
    );
    await waitForNextUpdate();
    expect(result.current.variables).toMatchInlineSnapshot(`
      Object {
        "accountListId": "account-list-1",
        "contactId": "contact-id-1",
      }
    `);
    expect(
      result.current.data?.contact.donations.nodes.length,
    ).toMatchInlineSnapshot(`undefined`);
  });
  it('test renderer', async () => {
    const { findByRole } = render(
      <GqlMockedProvider<GetContactDonationsQuery>
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
        <ContactDonationsTab
          accountListId={accountListId}
          contactId={contactId}
        />
      </GqlMockedProvider>,
    );
    expect(await findByRole('region')).toBeVisible();
  });
});
