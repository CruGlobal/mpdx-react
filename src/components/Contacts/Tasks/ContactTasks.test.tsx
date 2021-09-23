import { renderHook } from '@testing-library/react-hooks';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import { useContactTasksQuery } from './ContactTasks.generated';

describe('ContactTasks', () => {
  it('test query count and variables pass', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () =>
        useContactTasksQuery({
          variables: {
            accountListId: 'accountList-id',
            contactIds: ['contact-id'],
          },
        }),
      {
        wrapper: GqlMockedProvider,
      },
    );
    await waitForNextUpdate();

    expect(result.current.data?.tasks.totalCount).toMatchInlineSnapshot(`52`);
    expect(result.current.variables).toMatchInlineSnapshot(`
      Object {
        "accountListId": "accountList-id",
        "contactIds": Array [
          "contact-id",
        ],
      }
    `);
  });
});
