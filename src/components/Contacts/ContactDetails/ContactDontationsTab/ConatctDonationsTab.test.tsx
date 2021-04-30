import { renderHook } from '@testing-library/react-hooks';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { useGetContactDonationsQuery } from './ContactDonationsTab.generated';

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
    ).toMatchInlineSnapshot(`3`);
  });
});
