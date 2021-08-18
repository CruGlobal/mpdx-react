import { renderHook } from '@testing-library/react-hooks';
import { GqlMockedProvider } from '../../../__tests__/util/graphqlMocking';
import { useUser } from './useUser';

describe('useUser', () => {
  it('gets user', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useUser(), {
      wrapper: GqlMockedProvider,
    });

    await waitForNextUpdate();

    expect(result.current).toMatchInlineSnapshot(`
      Object {
        "__typename": "User",
        "admin": false,
        "administrativeOrganizations": Object {
          "__typename": "OrganizationConnection",
          "nodes": Array [
            Object {
              "__typename": "Organization",
              "id": "7480777",
            },
          ],
        },
        "developer": false,
        "firstName": "Nail",
        "id": "8591483",
        "keyAccounts": Array [
          Object {
            "__typename": "KeyAccount",
            "email": "Surveyor",
            "id": "8338182",
          },
          Object {
            "__typename": "KeyAccount",
            "email": "Tongue Videotape",
            "id": "3799478",
          },
        ],
        "lastName": "Hammer Magnet Guitar",
      }
    `);
  });
});
