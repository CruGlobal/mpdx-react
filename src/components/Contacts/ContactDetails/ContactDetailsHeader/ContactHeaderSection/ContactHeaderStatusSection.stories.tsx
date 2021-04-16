import React, { ReactElement } from 'react';
import { gqlMock } from '../../../../../../__tests__/util/graphqlMocking';

import {
  ContactDetailsHeaderFragment,
  ContactDetailsHeaderFragmentDoc,
} from '../ContactDetailsHeader.generated';
import { ContactHeaderStatusSection } from './ContactHeaderStatusSection';

export default {
  title: 'Contacts/ContactDetails/Header/StatusSection',
};

export const Default = (): ReactElement => {
  const contact = gqlMock<ContactDetailsHeaderFragment>(
    ContactDetailsHeaderFragmentDoc,
  );

  return <ContactHeaderStatusSection loading={false} contact={contact} />;
};

export const Loading = (): ReactElement => {
  return <ContactHeaderStatusSection loading={true} contact={undefined} />;
};
