import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
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
    const { findByRole, getByRole, getAllByRole } = render(
      <GqlMockedProvider<{ ContactDonationsList: ContactDonationsListQuery }>
        mocks={{
          ContactDonationsList: {
            contact: {
              id: contactId,
              donations: {
                nodes: [...Array(13)].map((x, i) => {
                  return {
                    donationDate: DateTime.local()
                      .minus({ month: i })
                      .toISO()
                      .toString(),
                    amount: {
                      currency: 'USD',
                      convertedCurrency: 'EUR',
                      amount: 10,
                      convertedAmount: 9.9,
                    },
                  };
                }),
                pageInfo: {
                  hasNextPage: true,
                },
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
      `"MuiButtonBase-root MuiButton-root MuiButton-outlined MuiButton-outlinedPrimary MuiButton-sizeMedium MuiButton-outlinedSizeMedium css-zj2tbm-MuiButtonBase-root-MuiButton-root"`,
    );
    expect(
      await (
        await findByRole('table')
      ).childElementCount,
    ).toMatchInlineSnapshot(`14`);
    userEvent.click(getByRole('button'));
    expect(
      await (
        await findByRole('table')
      ).childElementCount,
    ).toMatchInlineSnapshot(`14`);
    // TODO: Fix toMatchInlineSnapshot to be `27`
    const rows = getAllByRole('row');
    const donationRow = rows[1];
    expect(donationRow.children[1]).toHaveTextContent('$10');
    expect(donationRow.children[2]).toHaveTextContent('€9.90');
  });
});
