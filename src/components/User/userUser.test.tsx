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
    (getSession as jest.Mock).mockReturnValue(session);

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
              "id": "2807863",
            },
            Object {
              "__typename": "Organization",
              "id": "2698416",
            },
            Object {
              "__typename": "Organization",
              "id": "7545127",
            },
          ],
        },
        "developer": true,
        "firstName": "Dung Tapestry",
        "id": "8071787",
        "keyAccounts": Array [
          Object {
            "__typename": "KeyAccount",
            "email": "Chair Library Bed",
            "id": "1433814",
          },
        ],
        "lastName": "Parachute",
        "preferences": Object {
          "__typename": "Preference",
          "locale": "Circus Leg Slave",
        },
      }
    `);
  });
});
