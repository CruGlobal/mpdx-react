import { renderHook } from '@testing-library/react-hooks';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { useContactReferralTabQuery } from './ContactReferralTab.generated';

describe('ContactReferralTab', () => {
  it('test query', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () =>
        useContactReferralTabQuery({
          variables: {
            accountListId: 'accountList-id',
            contactId: 'contact-id',
          },
        }),
      {
        wrapper: GqlMockedProvider,
      },
    );
    await waitForNextUpdate();

    expect(result.current.variables).toMatchInlineSnapshot(`
      Object {
        "accountListId": "accountList-id",
        "contactId": "contact-id",
      }
    `);
  });
});
