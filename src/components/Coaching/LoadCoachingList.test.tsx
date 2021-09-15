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
            "balance": 96.24312058416996,
            "currency": "Chess Board Kaleidoscope",
            "id": "9270408",
            "monthlyGoal": 17,
            "name": "Fan Restaurant Banana",
            "primaryAppeal": Object {
              "__typename": "CoachingAppeal",
              "active": false,
              "amount": 4.82861671145592,
              "amountCurrency": "Toilet",
              "id": "1175336",
              "name": "Dress Diamond Aeroplane",
              "pledgesAmountNotReceivedNotProcessed": 56.5412612876643,
              "pledgesAmountProcessed": 50.5421798295242,
              "pledgesAmountTotal": 32.43473297560938,
            },
            "receivedPledges": 87.04710092108752,
            "totalPledges": 91.08742025003369,
          },
          Object {
            "__typename": "CoachingAccountList",
            "balance": 58.43147193947532,
            "currency": "Man",
            "id": "523025",
            "monthlyGoal": 41,
            "name": "Fork Shower",
            "primaryAppeal": Object {
              "__typename": "CoachingAppeal",
              "active": false,
              "amount": 56.232779584655816,
              "amountCurrency": "Spoon Perfume",
              "id": "9497108",
              "name": "Spiral Compact Disc Bowl",
              "pledgesAmountNotReceivedNotProcessed": 52.80522286940007,
              "pledgesAmountProcessed": 80.99474139508712,
              "pledgesAmountTotal": 99.91215789626264,
            },
            "receivedPledges": 72.9193282109653,
            "totalPledges": 55.372985959350345,
          },
        ],
      }
    `);
  });
});
