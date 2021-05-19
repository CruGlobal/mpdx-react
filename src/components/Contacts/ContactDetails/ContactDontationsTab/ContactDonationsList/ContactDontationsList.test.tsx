import { renderHook } from '@testing-library/react-hooks';
import { GqlMockedProvider } from '../../../../../../__tests__/util/graphqlMocking';
import { useContactDonationsListQuery } from './ContactDonationsList.generated';

const accountListId = 'account-list-1';
const contactId = 'contact-id-1';
const first = 25;
const after = 'donation-id-25';

describe('ContactDonationsList', () => {
  it('test query', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () =>
        useContactDonationsListQuery({
          variables: {
            accountListId: accountListId,
            contactId: contactId,
            first: first,
            after: after,
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
        "after": "donation-id-25",
        "contactId": "contact-id-1",
        "first": 25,
      }
    `);
    expect(
      result.current.data?.contact.donations.nodes.length,
    ).toMatchInlineSnapshot(`undefined`);
  });
});
