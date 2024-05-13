import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import { CoachingList } from './CoachingList';
import {
  LoadCoachingListQuery,
  useLoadCoachingListQuery,
} from './LoadCoachingList.generated';

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
            "balance": 64.55430394702351,
            "currency": "CAD",
            "id": "7671408",
            "monthlyGoal": 12,
            "name": "Diamond Sword Restaurant",
            "primaryAppeal": Object {
              "__typename": "CoachingAppeal",
              "active": false,
              "amount": 71.24003484887974,
              "amountCurrency": "EUR",
              "id": "4377364",
              "name": "Pebble Solid Triangle",
              "pledgesAmountNotReceivedNotProcessed": 70.20389802275804,
              "pledgesAmountProcessed": 36.11248127960118,
              "pledgesAmountTotal": 96.17510597010335,
            },
            "receivedPledges": 79.3262861684276,
            "totalPledges": 50.50755229029304,
          },
          Object {
            "__typename": "CoachingAccountList",
            "balance": 20.84220615982889,
            "currency": "EUR",
            "id": "8465485",
            "monthlyGoal": 73,
            "name": "Egg Compass Rocket",
            "primaryAppeal": Object {
              "__typename": "CoachingAppeal",
              "active": true,
              "amount": 57.02668130320204,
              "amountCurrency": "CAD",
              "id": "2268928",
              "name": "Chess Board Mosquito",
              "pledgesAmountNotReceivedNotProcessed": 11.708288466314501,
              "pledgesAmountProcessed": 94.3774669075171,
              "pledgesAmountTotal": 12.70780215832432,
            },
            "receivedPledges": 22.600969051965148,
            "totalPledges": 66.2952785316502,
          },
          Object {
            "__typename": "CoachingAccountList",
            "balance": 66.76403183825539,
            "currency": "EUR",
            "id": "1819981",
            "monthlyGoal": 42,
            "name": "Leather jacket Onion Pocket",
            "primaryAppeal": Object {
              "__typename": "CoachingAppeal",
              "active": true,
              "amount": 7.701867972597047,
              "amountCurrency": "CAD",
              "id": "5425736",
              "name": "Snail",
              "pledgesAmountNotReceivedNotProcessed": 60.6603194388847,
              "pledgesAmountProcessed": 22.219772841760978,
              "pledgesAmountTotal": 16.959686277380897,
            },
            "receivedPledges": 59.9470658594177,
            "totalPledges": 67.6666019807398,
          },
        ],
        "pageInfo": Object {
          "__typename": "PageInfo",
          "endCursor": "Arm Bible Circus",
          "hasNextPage": false,
          "hasPreviousPage": true,
          "startCursor": "Drum Baby Rock",
        },
        "totalCount": 7,
        "totalPageCount": 59,
      }
    `);
  });
  it('test list view', () => {
    const { getAllByRole } = render(
      <GqlMockedProvider<{ LoadCoachingList: LoadCoachingListQuery }>
        mocks={{
          LoadCoachingList: {
            coachingAccountLists: {
              totalCount: 3,
              nodes: [
                { currency: 'USD', primaryAppeal: { amountCurrency: 'EUR' } },
                { currency: 'USD', primaryAppeal: { amountCurrency: 'EUR' } },
                { currency: 'USD', primaryAppeal: { amountCurrency: 'JPN' } },
              ],
            },
          },
        }}
      >
        <CoachingList accountListId="account-list-id" />
      </GqlMockedProvider>,
    );
    expect(getAllByRole('listitem').length).toMatchInlineSnapshot(`3`);
  });
});
