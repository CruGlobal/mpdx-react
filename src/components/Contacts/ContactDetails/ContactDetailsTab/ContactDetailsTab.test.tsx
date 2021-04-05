import { renderHook } from '@testing-library/react-hooks';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { useContactDetailTabQuery } from './ContactDetailTab.generated';

describe('ContactDetailTab', () => {
  it('test query', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () =>
        useContactDetailTabQuery({
          variables: {
            accountListId: 'accountList-id',
            contactId: 'contact-id',
          },
        }),
      { wrapper: GqlMockedProvider },
    );
    await waitForNextUpdate();
    expect(result.current.variables).toMatchInlineSnapshot(`
      Object {
        "accountListId": "accountList-id",
        "contactId": "contact-id",
      }
    `);
    expect(result.current.data.contact.name).toMatchInlineSnapshot(
      `"Pyramid Car Rocket"`,
    );
  });
});
