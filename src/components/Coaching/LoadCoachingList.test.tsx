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
            "balance": 11.791526267834396,
            "currency": "Guitar Library Rifle",
            "id": "5832188",
            "monthlyGoal": 21,
            "name": "Carrot",
            "primaryAppeal": Object {
              "__typename": "CoachingAppeal",
              "active": false,
              "amount": 28.83519342649578,
              "amountCurrency": "Bottle",
              "id": "5458428",
              "name": "Eraser Highway Roof",
              "pledgesAmountNotReceivedNotProcessed": 37.112908798919825,
              "pledgesAmountProcessed": 63.56730814682465,
              "pledgesAmountTotal": 84.93122600789155,
            },
            "receivedPledges": 74.08939333065162,
            "totalPledges": 13.423852176053717,
          },
          Object {
            "__typename": "CoachingAccountList",
            "balance": 68.90732598759584,
            "currency": "Bible Pants Leg",
            "id": "7800041",
            "monthlyGoal": 19,
            "name": "Rock Chocolates",
            "primaryAppeal": Object {
              "__typename": "CoachingAppeal",
              "active": false,
              "amount": 77.42704485937709,
              "amountCurrency": "Milkshake Monster Robot",
              "id": "7613202",
              "name": "Swimming Pool",
              "pledgesAmountNotReceivedNotProcessed": 86.94387223784648,
              "pledgesAmountProcessed": 8.44492391072578,
              "pledgesAmountTotal": 35.208384953842604,
            },
            "receivedPledges": 53.58337866990284,
            "totalPledges": 93.81817854894618,
          },
          Object {
            "__typename": "CoachingAccountList",
            "balance": 49.162810569843316,
            "currency": "Triangle Aircraft Carrier",
            "id": "5967758",
            "monthlyGoal": 44,
            "name": "Surveyor",
            "primaryAppeal": Object {
              "__typename": "CoachingAppeal",
              "active": false,
              "amount": 5.9485487258884815,
              "amountCurrency": "Toilet Television Drum",
              "id": "9848811",
              "name": "Chair Kaleidoscope",
              "pledgesAmountNotReceivedNotProcessed": 82.60587627015204,
              "pledgesAmountProcessed": 87.25946719424971,
              "pledgesAmountTotal": 47.45366563568286,
            },
            "receivedPledges": 10.517159591365377,
            "totalPledges": 76.96025244782014,
          },
          Object {
            "__typename": "CoachingAccountList",
            "balance": 39.47558769062159,
            "currency": "Liquid",
            "id": "371742",
            "monthlyGoal": 54,
            "name": "Kaleidoscope Church",
            "primaryAppeal": Object {
              "__typename": "CoachingAppeal",
              "active": true,
              "amount": 28.47070061288337,
              "amountCurrency": "Milkshake",
              "id": "6828777",
              "name": "Solid Teeth Television",
              "pledgesAmountNotReceivedNotProcessed": 43.92947491213468,
              "pledgesAmountProcessed": 74.38029693077652,
              "pledgesAmountTotal": 55.35687511771611,
            },
            "receivedPledges": 13.700071114231635,
            "totalPledges": 91.89550085589752,
          },
        ],
        "pageInfo": Object {
          "__typename": "PageInfo",
          "endCursor": "Bomb Pebble Sports-car",
          "hasNextPage": false,
          "hasPreviousPage": false,
          "startCursor": "Monster Computer Bowl",
        },
        "totalCount": 35,
        "totalPageCount": 27,
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
