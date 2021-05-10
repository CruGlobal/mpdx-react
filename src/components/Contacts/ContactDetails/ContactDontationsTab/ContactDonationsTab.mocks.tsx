import { DateTime } from 'luxon';
import { gqlMock } from '../../../../../__tests__/util/graphqlMocking';
import {
  DonationsContactFragment,
  DonationsContactFragmentDoc,
} from './ContactDonationsTab.generated';

const donationsMocks = [...Array(24)].map((x, i) => {
  return {
    donationDate: DateTime.now().minus({ month: i }).toISO(),
  };
});

export const contactDonationsMock = gqlMock<DonationsContactFragment>(
  DonationsContactFragmentDoc,
  {
    mocks: {
      nodes: donationsMocks,
    },
  },
);
