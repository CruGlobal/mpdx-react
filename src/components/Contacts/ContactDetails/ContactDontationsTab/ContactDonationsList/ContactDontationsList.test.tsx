import { renderHook } from '@testing-library/react-hooks';
import { DateTime } from 'luxon';
import React from 'react';
import { GqlMockedProvider } from '../../../../../../__tests__/util/graphqlMocking';
import { render } from '../../../../../../__tests__/util/testingLibraryReactMock';
import { ContactDonationsList } from './ContactDonationsList';
import {
  ContactDonationsListQuery,
  useContactDonationsListQuery,
} from './ContactDonationsList.generated';

const accountListId = 'account-list-1';
const contactId = 'contact-id-1';

describe('ContactDonationsList', () => {
  it('test query', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () =>
        useContactDonationsListQuery({
          variables: {
            accountListId: accountListId,
            contactId: contactId,
          },
        }),
      {
        wrapper: GqlMockedProvider,
      },
    );
    await waitForNextUpdate();
    expect(result.current.variables).toMatchInlineSnapshot(`
      Object {
        "accountListId": "account-list-1",
        "contactId": "contact-id-1",
      }
    `);
  });

  it('test Renderer', async () => {
    const { findByRole } = render(
      <GqlMockedProvider<ContactDonationsListQuery>
        mocks={{
          ContactDonationsList: {
            contact: {
              donations: {
                nodes: [...Array(25)].map((x, i) => {
                  return {
                    donationDate: DateTime.local().minus({ month: i }).toISO(),
                    amount: {
                      currency: 'USD',
                      convertedCurrency: 'EUR',
                    },
                  };
                }),
              },
            },
          },
        }}
      >
        <ContactDonationsList
          accountListId={accountListId}
          contactId={contactId}
        />
      </GqlMockedProvider>,
    );

    expect(await (await findByRole('button')).className).toMatchInlineSnapshot(
      `"MuiButtonBase-root MuiButton-root MuiButton-outlined WithStyles(ForwardRef(Button))-root-6 WithStyles(ForwardRef(Button))-root-7"`,
    );
  });
});
