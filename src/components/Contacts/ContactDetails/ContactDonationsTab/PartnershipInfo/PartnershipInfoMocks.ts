import { DateTime } from 'luxon';
import { gqlMock } from '__tests__/util/graphqlMocking';
import { PledgeFrequencyEnum, StatusEnum } from 'src/graphql/types.generated';
import {
  ContactDonorAccountsFragment,
  ContactDonorAccountsFragmentDoc,
} from '../ContactDonationsTab.generated';
import { SwitzerlandOrganizationName } from './PartnershipInfo';

export const contactMock = gqlMock<ContactDonorAccountsFragment>(
  ContactDonorAccountsFragmentDoc,
  {
    mocks: {
      status: StatusEnum.PartnerFinancial,
      nextAsk: DateTime.local().plus({ month: 3 }).toISO(),
      pledgeCurrency: 'CAD',
      pledgeStartDate: DateTime.local().toISO(),
      pledgeFrequency: PledgeFrequencyEnum.Annual,
      pledgeAmount: 55,
      lastDonation: {
        donationDate: DateTime.local().toISO(),
        amount: {
          currency: 'CAD',
        },
      },
    },
  },
);

export const contactEmptyMock = gqlMock<ContactDonorAccountsFragment>(
  ContactDonorAccountsFragmentDoc,
  {
    mocks: {
      status: null,
    },
  },
);

export const organizationAccountsMock = {
  userOrganizationAccounts: [
    {
      organization: {
        name: 'Cru - New Staff',
      },
      id: '123',
    },
  ],
};

export const organizationAccountsWithCruSwitzerlandMock = {
  userOrganizationAccounts: [
    {
      organization: {
        name: 'Cru - New Staff',
      },
      id: '123',
    },
    {
      organization: {
        name: SwitzerlandOrganizationName,
      },
      id: '456',
    },
  ],
};
