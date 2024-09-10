import { PledgeFrequencyEnum, StatusEnum } from 'src/graphql/types.generated';
import { AppealContactInfoFragment } from '../../AppealsContext/contacts.generated';

export const defaultContact: AppealContactInfoFragment = {
  id: 'test-id',
  name: 'Test, Name',
  pledgeAmount: 500,
  pledgeCurrency: 'CAD',
  pledgeFrequency: PledgeFrequencyEnum.Monthly,
  pledgeReceived: true,
  status: StatusEnum.AskInFuture,
  starred: false,
  pledges: [
    {
      id: 'pledge-1',
      amount: 3000,
      amountCurrency: 'USD',
      appeal: {
        id: 'appealId',
      },
      expectedDate: '2024-08-08',
    },
    {
      id: 'pledge-2',
      amount: 5000,
      amountCurrency: 'USD',
      appeal: {
        id: 'appeal-2',
      },
      expectedDate: '2024-11-11',
    },
  ],
  donations: {
    nodes: [
      {
        id: 'donation-1',
        appeal: {
          id: 'appeal-1',
        },
        donationDate: '2024-08-23',
        amount: {
          amount: 200,
          convertedAmount: 200,
          convertedCurrency: 'USD',
        },
      },
      {
        id: 'donation-2',
        appeal: {
          id: 'appeal-2',
        },
        donationDate: '2024-08-22',
        amount: {
          amount: 150,
          convertedAmount: 150,
          convertedCurrency: 'USD',
        },
      },
      {
        id: 'donation-3',
        appeal: {
          id: 'appealId',
        },
        donationDate: '2019-06-25',
        amount: {
          amount: 50,
          convertedAmount: 50,
          convertedCurrency: 'USD',
        },
      },
    ],
  },
};
