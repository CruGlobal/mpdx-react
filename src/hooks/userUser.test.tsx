import { renderHook } from '@testing-library/react-hooks';
import { getSession } from 'next-auth/react';
import { GqlMockedProvider } from '../../__tests__/util/graphqlMocking';
import { useUser } from './useUser';

jest.mock('next-auth/react');

const session = {
  expires: '2021-10-28T14:48:20.897Z',
  user: {
    email: 'Chair Library Bed',
    image: null,
    name: 'Dung Tapestry',
    token: 'superLongJwtString',
  },
};

describe('useUser', () => {
  it('gets user', async () => {
    (getSession as jest.Mock).mockResolvedValue(session);

    const { result, waitForNextUpdate } = renderHook(() => useUser(), {
      wrapper: GqlMockedProvider,
    });

    await waitForNextUpdate();

    expect(result.current).toMatchInlineSnapshot(`
      Object {
        "__typename": "User",
        "admin": true,
        "administrativeOrganizations": Object {
          "__typename": "OrganizationConnection",
          "nodes": Array [
            Object {
              "__typename": "Organization",
              "id": "1851199",
            },
            Object {
              "__typename": "Organization",
              "id": "3120940",
            },
          ],
        },
        "developer": false,
        "firstName": "Flower Bee",
        "id": "863856",
        "keyAccounts": Array [
          Object {
            "__typename": "KeyAccount",
            "email": "Balloon Spice",
            "id": "2541550",
          },
          Object {
            "__typename": "KeyAccount",
            "email": "Drink Worm Rocket",
            "id": "6455335",
          },
          Object {
            "__typename": "KeyAccount",
            "email": "Barbecue Chocolates",
            "id": "8591453",
          },
        ],
        "lastName": "Telescope",
        "preferences": Object {
          "__typename": "Preference",
          "language": "Typewriter Backpack",
          "locale": "Bed Coffee-shop",
        },
      }
    `);
  });
});
