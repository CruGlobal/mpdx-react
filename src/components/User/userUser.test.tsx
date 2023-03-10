import { renderHook } from '@testing-library/react-hooks';
import { GqlMockedProvider } from '../../../__tests__/util/graphqlMocking';
import { useUser } from './useUser';
import { getSession } from 'next-auth/react';

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
        "admin": false,
        "administrativeOrganizations": Object {
          "__typename": "OrganizationConnection",
          "nodes": Array [
            Object {
              "__typename": "Organization",
              "id": "774361",
            },
            Object {
              "__typename": "Organization",
              "id": "7939597",
            },
            Object {
              "__typename": "Organization",
              "id": "9762715",
            },
          ],
        },
        "developer": true,
        "firstName": "Brain Ice-cream",
        "id": "4394961",
        "keyAccounts": Array [
          Object {
            "__typename": "KeyAccount",
            "email": "Printer Cycle Air",
            "id": "4072203",
          },
          Object {
            "__typename": "KeyAccount",
            "email": "Signature",
            "id": "6591416",
          },
          Object {
            "__typename": "KeyAccount",
            "email": "Software",
            "id": "8774894",
          },
        ],
        "lastName": "Eyes",
        "preferences": Object {
          "__typename": "Preference",
          "locale": "Magnet",
        },
      }
    `);
  });
});
