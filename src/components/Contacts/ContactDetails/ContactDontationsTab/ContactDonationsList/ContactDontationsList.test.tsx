import { renderHook } from '@testing-library/react-hooks';
import userEvent from '@testing-library/user-event';
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
const first = 25;

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
    const { findAllByRole, getByTestId, getByRole } = render(
      <GqlMockedProvider<ContactDonationsListQuery>
        mocks={{
          ContactDonationsList: {
            contact: {
              donations: {
                totalCount: 125,
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

    expect(await (await findAllByRole('textbox')).length).toMatchInlineSnapshot(
      `25`,
    );
    userEvent.click(getByTestId('pagination-next'));
    expect(await (await findAllByRole('textbox')).length).toMatchInlineSnapshot(
      `25`,
    );
    userEvent.click(getByTestId('pagination-back'));
    expect(await (await findAllByRole('textbox')).length).toMatchInlineSnapshot(
      `25`,
    );

    userEvent.click(getByTestId('pagination-rows'));
    userEvent.click(getByRole('option', { name: '10' }));

    expect(await (await findAllByRole('textbox')).length).toMatchInlineSnapshot(
      `25`,
    );
  });
});
