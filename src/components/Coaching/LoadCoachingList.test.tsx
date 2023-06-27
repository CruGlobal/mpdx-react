import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { GqlMockedProvider } from '../../../__tests__/util/graphqlMocking';
import { CoachingList } from './CoachingList';
import {
  LoadCoachingListQuery,
  useLoadCoachingListQuery,
} from './LoadCoachingList.generated';
import { render } from '__tests__/util/testingLibraryReactMock';

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
            "balance": 26.507845354363234,
            "currency": "Kitchen Star Restaurant",
            "id": "7671408",
            "monthlyGoal": 32,
            "name": "Diamond Sword Restaurant",
            "primaryAppeal": Object {
              "__typename": "CoachingAppeal",
              "active": false,
              "amount": 71.24003484887974,
              "amountCurrency": "Gloves Tennis racquet Pebble",
              "id": "8018947",
              "name": "Rifle Feather Videotape",
              "pledgesAmountNotReceivedNotProcessed": 18.46232645104087,
              "pledgesAmountProcessed": 12.197856859203839,
              "pledgesAmountTotal": 64.55430394702351,
            },
            "receivedPledges": 71.71677620866463,
            "totalPledges": 88.38895264618175,
          },
          Object {
            "__typename": "CoachingAccountList",
            "balance": 7.701867972597047,
            "currency": "Onion Pocket",
            "id": "5702668",
            "monthlyGoal": 67,
            "name": "Circle",
            "primaryAppeal": Object {
              "__typename": "CoachingAppeal",
              "active": true,
              "amount": 19.745889235377575,
              "amountCurrency": "Bird Typewriter",
              "id": "1270780",
              "name": "Saddle Chisel Circle",
              "pledgesAmountNotReceivedNotProcessed": 66.2952785316502,
              "pledgesAmountProcessed": 18.199816964540847,
              "pledgesAmountTotal": 72.72060834776661,
            },
            "receivedPledges": 49.79264398185141,
            "totalPledges": 54.25736018912712,
          },
          Object {
            "__typename": "CoachingAccountList",
            "balance": 2.9079667684670696,
            "currency": "Bible",
            "id": "1688878",
            "monthlyGoal": 23,
            "name": "Onion Church Car",
            "primaryAppeal": Object {
              "__typename": "CoachingAppeal",
              "active": true,
              "amount": 42.290111917719415,
              "amountCurrency": "Necklace Prison",
              "id": "761729",
              "name": "Software Drum",
              "pledgesAmountNotReceivedNotProcessed": 5.751591941256687,
              "pledgesAmountProcessed": 71.27233959202866,
              "pledgesAmountTotal": 88.88260916797685,
            },
            "receivedPledges": 90.38398155210061,
            "totalPledges": 54.133712713605604,
          },
        ],
        "pageInfo": Object {
          "__typename": "PageInfo",
          "endCursor": "Circus Map",
          "hasNextPage": false,
          "hasPreviousPage": false,
          "startCursor": "Boy Wheelchair Data Base",
        },
        "totalCount": 95,
        "totalPageCount": 23,
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
