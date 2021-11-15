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
      () =>
        useLoadCoachingListQuery({
          variables: { accountListId: 'account-list-id' },
        }),
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
            "balance": 34.26317466463749,
            "currency": "Hieroglyph Film Bee",
            "id": "592940",
            "monthlyGoal": 30,
            "name": "Electricity Software Gas",
            "primaryAppeal": Object {
              "__typename": "CoachingAppeal",
              "active": false,
              "amount": 32.998363216356985,
              "amountCurrency": "Bottle",
              "id": "1761863",
              "name": "Swimming Pool Spectrum Guitar",
              "pledgesAmountNotReceivedNotProcessed": 28.11545226718781,
              "pledgesAmountProcessed": 99.6013504056267,
              "pledgesAmountTotal": 45.02466031725325,
            },
            "receivedPledges": 42.50102919344359,
            "totalPledges": 50.57005366921266,
          },
          Object {
            "__typename": "CoachingAccountList",
            "balance": 92.29303016350283,
            "currency": "Vampire Sports-car Pendulum",
            "id": "1929202",
            "monthlyGoal": 54,
            "name": "Gemstone Desk",
            "primaryAppeal": Object {
              "__typename": "CoachingAppeal",
              "active": false,
              "amount": 79.12708698915374,
              "amountCurrency": "Prison",
              "id": "3593866",
              "name": "Hose Toilet Floodlight",
              "pledgesAmountNotReceivedNotProcessed": 76.81029763332153,
              "pledgesAmountProcessed": 49.03798975266729,
              "pledgesAmountTotal": 59.6072966215264,
            },
            "receivedPledges": 55.55515513802136,
            "totalPledges": 97.44987458974347,
          },
          Object {
            "__typename": "CoachingAccountList",
            "balance": 38.89441907335861,
            "currency": "Fan Shoes Egg",
            "id": "2865087",
            "monthlyGoal": 71,
            "name": "Toilet",
            "primaryAppeal": Object {
              "__typename": "CoachingAppeal",
              "active": false,
              "amount": 93.67408252833354,
              "amountCurrency": "Kaleidoscope Dress",
              "id": "1935207",
              "name": "Bottle",
              "pledgesAmountNotReceivedNotProcessed": 35.56770389998287,
              "pledgesAmountProcessed": 75.75154833094962,
              "pledgesAmountTotal": 51.13964387010894,
            },
            "receivedPledges": 31.64847583203375,
            "totalPledges": 87.33712456080917,
          },
        ],
        "pageInfo": Object {
          "__typename": "PageInfo",
          "endCursor": "Kitchen Videotape",
          "hasNextPage": false,
          "hasPreviousPage": true,
          "startCursor": "Church",
        },
        "totalCount": 34,
        "totalPageCount": 54,
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
            accountList: {
              name: 'Current AccountList',
              currency: 'EUR',
              primaryAppeal: { amountCurrency: 'JPY' },
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
