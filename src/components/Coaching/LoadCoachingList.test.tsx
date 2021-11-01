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
            "balance": 28.83828399920708,
            "currency": "Robot",
            "id": "9609107",
            "monthlyGoal": 71,
            "name": "Crystal",
            "primaryAppeal": Object {
              "__typename": "CoachingAppeal",
              "active": false,
              "amount": 72.97908357090395,
              "amountCurrency": "Ring Horse Leather jacket",
              "id": "6913282",
              "name": "Carrot Navy",
              "pledgesAmountNotReceivedNotProcessed": 55.9670258375373,
              "pledgesAmountProcessed": 69.30231818032739,
              "pledgesAmountTotal": 97.35871692350221,
            },
            "receivedPledges": 48.98278221231802,
            "totalPledges": 12.375508534198012,
          },
          Object {
            "__typename": "CoachingAccountList",
            "balance": 82.59705202795277,
            "currency": "Sphere Milkshake",
            "id": "9909036",
            "monthlyGoal": 58,
            "name": "Gloves Chocolates",
            "primaryAppeal": Object {
              "__typename": "CoachingAppeal",
              "active": true,
              "amount": 55.814046159333294,
              "amountCurrency": "Airport Air",
              "id": "9008566",
              "name": "Dress Leg",
              "pledgesAmountNotReceivedNotProcessed": 1.9488975869088798,
              "pledgesAmountProcessed": 54.362932972591985,
              "pledgesAmountTotal": 92.09446767055837,
            },
            "receivedPledges": 55.28369564629664,
            "totalPledges": 71.01665366956364,
          },
          Object {
            "__typename": "CoachingAccountList",
            "balance": 17.703589854011717,
            "currency": "Explosive Shoes Sandwich",
            "id": "989255",
            "monthlyGoal": 49,
            "name": "Meteor",
            "primaryAppeal": Object {
              "__typename": "CoachingAppeal",
              "active": false,
              "amount": 44.74141348375532,
              "amountCurrency": "Ring",
              "id": "8287839",
              "name": "Fork Stomach Guitar",
              "pledgesAmountNotReceivedNotProcessed": 73.25011998510836,
              "pledgesAmountProcessed": 24.88911730952273,
              "pledgesAmountTotal": 50.666135456153604,
            },
            "receivedPledges": 9.698339921670426,
            "totalPledges": 65.40143300626565,
          },
          Object {
            "__typename": "CoachingAccountList",
            "balance": 34.66343266565752,
            "currency": "Airport",
            "id": "7359784",
            "monthlyGoal": 57,
            "name": "Monster",
            "primaryAppeal": Object {
              "__typename": "CoachingAppeal",
              "active": false,
              "amount": 6.379974781427117,
              "amountCurrency": "Ears Balloon Salt",
              "id": "6907359",
              "name": "Wheelchair Skeleton Library",
              "pledgesAmountNotReceivedNotProcessed": 77.70216096006921,
              "pledgesAmountProcessed": 20.78145791164274,
              "pledgesAmountTotal": 3.312056618796022,
            },
            "receivedPledges": 18.9929074091097,
            "totalPledges": 45.4375268110156,
          },
        ],
        "pageInfo": Object {
          "__typename": "PageInfo",
          "endCursor": "Sphere",
          "hasNextPage": true,
          "hasPreviousPage": true,
          "startCursor": "Meat",
        },
        "totalCount": 60,
        "totalPageCount": 60,
      }
    `);
  });
  it('test list view', () => {
    const { getAllByRole } = render(
      <GqlMockedProvider<LoadCoachingListQuery>
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
