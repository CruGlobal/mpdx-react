import { renderHook } from '@testing-library/react-hooks';
import { GqlMockedProvider } from '../../../../../../__tests__/util/graphqlMocking';
import {
  useGetContactTagsQuery,
  useUpdateContactTagsMutation,
} from './ContactTags.generated';

describe('ContactTags', () => {
  it('test tag query', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () =>
        useGetContactTagsQuery({
          variables: {
            accountListID: 'account-list-id',
            contactId: 'contact-id',
          },
        }),
      { wrapper: GqlMockedProvider },
    );
    await waitForNextUpdate();
    expect(result.current.variables).toMatchInlineSnapshot(`
      Object {
        "accountListID": "account-list-id",
        "contactId": "contact-id",
      }
    `);
    expect(result.current.data.contact).toMatchInlineSnapshot(`
      Object {
        "__typename": "Contact",
        "id": "940933",
        "tagList": Array [
          "Circle",
        ],
      }
    `);
  });

  it('test mutation', async () => {
    const { result, waitForValueToChange } = renderHook(
      () =>
        useUpdateContactTagsMutation({
          variables: {
            accountList: 'account-list-id',
            contactId: 'contact-id',
            tagList: ['new', 'next'],
          },
        }),
      { wrapper: GqlMockedProvider },
    );
    await waitForValueToChange;
    expect(result.current.length).toMatchInlineSnapshot(`2`);
  });
});
