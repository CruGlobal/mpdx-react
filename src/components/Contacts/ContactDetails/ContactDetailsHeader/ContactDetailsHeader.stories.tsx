import React, { ReactElement } from 'react';

import { gqlMock } from '../../../../../__tests__/util/graphqlMocking';
import {
  ContactDetailsFragment,
  ContactDetailsFragmentDoc,
} from '../ContactDetails.generated';
import { ContactDetailsHeader } from './ContactDetailsHeader';

export default {
  title: 'Contacts/ContactDetails/Header',
};

const contact = gqlMock<ContactDetailsFragment>(ContactDetailsFragmentDoc);

export const Default = (): ReactElement => {
  return <ContactDetailsHeader loading={false} contact={null} />;
};

export const Loading = (): ReactElement => {
  return <ContactDetailsHeader loading={true} contact={null} />;
};

export const WithContact = (): ReactElement => {
  return <ContactDetailsHeader loading={false} contact={contact} />;
};
