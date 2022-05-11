import React, { ReactElement } from 'react';
import { DateTime } from 'luxon';
import { ContactDetailsHeaderFragmentDoc } from '../ContactDetailsHeader.generated';
import { ContactHeaderPartnerSection } from './ContactHeaderPartnerSection';
import { ContactHeaderStatusFragment } from './ContactHeaderStatus.generated';
import { gqlMock } from '__tests__/util/graphqlMocking';

export default {
  title: 'Contacts/ContactDetails/Header/PartnerSection',
};

const contact = gqlMock<ContactHeaderStatusFragment>(
  ContactDetailsHeaderFragmentDoc,
  {
    mocks: {
      pledgeCurrency: 'USD',
      lastDonation: {
        donationDate: DateTime.now().plus({ month: 5 }).toISO(),
      },
      lateAt: DateTime.now().minus({ month: 5 }).toISO(),
    },
  },
);

export const Default = (): ReactElement => {
  return <ContactHeaderPartnerSection loading={false} contact={contact} />;
};

export const Loading = (): ReactElement => {
  return <ContactHeaderPartnerSection loading={true} contact={contact} />;
};
