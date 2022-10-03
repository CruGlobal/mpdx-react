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
    const { findByRole, getByRole } = render(
      <GqlMockedProvider<ContactDonationsListQuery>
        mocks={{
          ContactDonationsList: {
            contact: {
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
  });
});
