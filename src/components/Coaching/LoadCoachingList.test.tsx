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
            "balance": 48.080690632780225,
            "currency": "Brain",
            "id": "9800141",
            "monthlyGoal": 53,
            "name": "Highway Necklace",
            "primaryAppeal": Object {
              "__typename": "CoachingAppeal",
              "active": true,
              "amount": 64.67921400706308,
              "amountCurrency": "Explosive Insect",
              "id": "6388981",
              "name": "Fruit",
              "pledgesAmountNotReceivedNotProcessed": 75.92738282703814,
              "pledgesAmountProcessed": 21.136163232596218,
              "pledgesAmountTotal": 3.2296970662326636,
            },
            "receivedPledges": 26.051141960020495,
            "totalPledges": 18.863992421191654,
          },
          Object {
            "__typename": "CoachingAccountList",
            "balance": 71.55635451781613,
            "currency": "Clock Fire Sun",
            "id": "7402359",
            "monthlyGoal": 84,
            "name": "Shoes",
            "primaryAppeal": Object {
              "__typename": "CoachingAppeal",
              "active": false,
              "amount": 96.16854390953031,
              "amountCurrency": "Shop",
              "id": "1444268",
              "name": "Brain",
              "pledgesAmountNotReceivedNotProcessed": 32.320861499588574,
              "pledgesAmountProcessed": 3.9332194436493952,
              "pledgesAmountTotal": 31.817955049640773,
            },
            "receivedPledges": 26.51676171470489,
            "totalPledges": 16.737245655103422,
          },
          Object {
            "__typename": "CoachingAccountList",
            "balance": 96.80874469702522,
            "currency": "Circus Ring Barbecue",
            "id": "6535836",
            "monthlyGoal": 16,
            "name": "Car Wheelchair",
            "primaryAppeal": Object {
              "__typename": "CoachingAppeal",
              "active": true,
              "amount": 87.00317275393913,
              "amountCurrency": "Drill",
              "id": "1124880",
              "name": "Printer Alphabet Spectrum",
              "pledgesAmountNotReceivedNotProcessed": 59.42230714533539,
              "pledgesAmountProcessed": 17.987492244827084,
              "pledgesAmountTotal": 45.5454704279088,
            },
            "receivedPledges": 9.34118720282293,
            "totalPledges": 61.2225733939793,
          },
        ],
      }
    `);
  });
});
