import { renderHook } from '@testing-library/react-hooks';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { useContactTasksTabQuery } from './ContactTasksTab.generated';

describe('ContactTasksTab', () => {
  it('test query', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () =>
        useContactTasksTabQuery({
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
    expect(
      result.current.data?.tasks.nodes[0].contacts.nodes[0].name,
    ).toMatchInlineSnapshot(`"Airport Map"`);
  });
});
