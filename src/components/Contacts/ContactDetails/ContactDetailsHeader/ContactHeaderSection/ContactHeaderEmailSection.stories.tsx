import React, { ReactElement } from 'react';
import { DateTime } from 'luxon';
import { gqlMock } from '__tests__/util/graphqlMocking';
import {
  ContactDetailsHeaderFragment,
  ContactDetailsHeaderFragmentDoc,
} from '../ContactDetailsHeader.generated';
import { ContactHeaderEmailSection } from './ContactHeaderEmailSection';

export default {
  title: 'Contacts/ContactDetails/Header/EmailSection',
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

  return <ContactHeaderEmailSection loading={false} contact={contact} />;
};

export const Loading = (): ReactElement => {
  return <ContactHeaderEmailSection loading={true} contact={undefined} />;
};
