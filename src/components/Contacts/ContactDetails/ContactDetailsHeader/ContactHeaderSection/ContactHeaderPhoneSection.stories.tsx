import React, { ReactElement } from 'react';
import { gqlMock } from '../../../../../../__tests__/util/graphqlMocking';

import {
  ContactDetailsHeaderFragment,
  ContactDetailsHeaderFragmentDoc,
} from '../ContactDetailsHeader.generated';
import { ContactHeaderPhoneSection } from './ContactHeaderPhoneSection';

export default {
  title: 'Contacts/ContactDetails/Header/PhoneSection',
};

export const Default = (): ReactElement => {
  const contact = gqlMock<ContactDetailsHeaderFragment>(
    ContactDetailsHeaderFragmentDoc,
  );

  return <ContactHeaderPhoneSection loading={false} contact={contact} />;
};

export const Loading = (): ReactElement => {
  return <ContactHeaderPhoneSection loading={true} contact={undefined} />;
};
