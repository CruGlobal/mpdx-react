import { renderHook } from '@testing-library/react-hooks';
import { GqlMockedProvider } from '../../../__tests__/util/graphqlMocking';
import { useLoadCoachingListQuery } from './LoadCoachingList.generated';

describe('LoadCoaching', () => {
  it('query correct', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useLoadCoachingListQuery(),
      {
        wrapper: GqlMockedProvider,
      },
    );
    await waitForNextUpdate();
    expect(result.current.data?.coachingAccountLists).toMatchInlineSnapshot(`
      Object {
        "__typename": "CoachingAccountListConnection",
        "nodes": Array [
          Object {
            "__typename": "CoachingAccountList",
            "balance": 77.51432862938042,
            "currency": "Coffee Wheelchair",
            "id": "2554211",
            "monthlyGoal": 30,
            "name": "Leather jacket Chocolates",
            "primaryAppeal": Object {
              "__typename": "CoachingAppeal",
              "active": true,
              "amount": 3.624751967164462,
              "amountCurrency": "Satellite",
              "id": "6942855",
              "name": "Knife Videotape Family",
              "pledgesAmountNotReceivedNotProcessed": 76.0692130882271,
              "pledgesAmountProcessed": 64.03173024789429,
              "pledgesAmountTotal": 39.92491775873032,
            },
            "receivedPledges": 20.426679906305584,
            "totalPledges": 89.03079466077337,
          },
        ],
        "pageInfo": Object {
          "__typename": "PageInfo",
          "endCursor": "Button Maze Vulture",
          "hasNextPage": true,
          "hasPreviousPage": true,
          "startCursor": "Cave",
        },
        "totalCount": 95,
        "totalPageCount": 47,
      }
    `);
  });
});
