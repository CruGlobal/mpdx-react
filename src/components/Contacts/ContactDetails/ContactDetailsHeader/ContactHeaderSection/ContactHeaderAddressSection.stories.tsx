import React, { ReactElement } from 'react';
import { DateTime } from 'luxon';
import { gqlMock } from '__tests__/util/graphqlMocking';
import {
  ContactDetailsHeaderFragment,
  ContactDetailsHeaderFragmentDoc,
} from '../ContactDetailsHeader.generated';
import { ContactHeaderAddressSection } from './ContactHeaderAddressSection';

export default {
  title: 'Contacts/ContactDetails/Header/AddressSection',
};

export const Default = (): ReactElement => {
  const contact = gqlMock<ContactDetailsHeaderFragment>(
    ContactDetailsHeaderFragmentDoc,
    {
      mocks: {
        lastDonation: {
          donationDate: DateTime.now().toISO(),
        },
      },
    },
  );

  return <ContactHeaderAddressSection loading={false} contact={contact} />;
};

export const Loading = (): ReactElement => {
  return <ContactHeaderAddressSection loading={true} contact={undefined} />;
};
