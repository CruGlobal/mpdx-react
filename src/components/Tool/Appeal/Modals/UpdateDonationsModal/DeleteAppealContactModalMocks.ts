import { GetContactDonationsQuery } from 'src/components/Contacts/ContactDetails/ContactDonationsTab/ContactDonationsTab.generated';
import { ContactSourceEnum, StatusEnum } from 'src/graphql/types.generated';

export const defaultContact = {
  id: 'contact-1',
  name: 'Test Name',
};

export const contactNoDonationsMock = {
  contact: {
    id: defaultContact.id,
    name: defaultContact.name,
    lastDonation: null,
    nextAsk: null,
    pledgeReceived: false,
    pledgeStartDate: null,
    pledgeAmount: null,
    pledgeCurrency: 'USD',
    pledgeFrequency: null,
    totalDonations: 0,
    noAppeals: false,
    sendNewsletter: 'EMAIL',
    status: StatusEnum.AskInFuture,
    source: ContactSourceEnum.Mpdx,
    likelyToGive: null,
    contactReferralsToMe: {
      nodes: [],
    },
    contactDonorAccounts: {
      nodes: [],
    },
  },
} as GetContactDonationsQuery;

export const contactWithDonationsMock = {
  contact: {
    id: defaultContact.id,
    name: defaultContact.name,
    lastDonation: {
      id: '2d1838fd-f180-4ba3-b010-274f3fcf4576',
      donationDate: '2024-09-04',
      paymentMethod: null,
      amount: {
        amount: 150,
        convertedAmount: 150,
        currency: 'USD',
        convertedCurrency: 'USD',
      },
      appeal: {
        id: '9d660aed-1291-4c5b-874d-409a94b5ed3b',
        name: 'End Of Year Gift..',
      },
    },
    nextAsk: null,
    pledgeReceived: false,
    pledgeStartDate: '2024-09-04',
    pledgeAmount: 500,
    pledgeCurrency: 'USD',
    pledgeFrequency: null,
    totalDonations: 450,
    noAppeals: false,
    sendNewsletter: 'NONE',
    status: StatusEnum.PartnerSpecial,
    source: ContactSourceEnum.Mpdx,
    likelyToGive: null,
    contactReferralsToMe: {
      nodes: [],
    },
    contactDonorAccounts: {
      nodes: [
        {
          __typename: 'ContactDonorAccount',
          id: '2f8bdc33-86ea-4dd0-aeab-b3df802ff146',
          donorAccount: {
            __typename: 'DonorAccount',
            id: 'designation-1',
            displayName: 'A, Caleb (999)',
            accountNumber: '999',
          },
        },
      ],
    },
  },
} as GetContactDonationsQuery;
