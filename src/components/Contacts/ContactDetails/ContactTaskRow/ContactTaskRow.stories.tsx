import React, { ReactElement } from 'react';
import { gqlMock } from '../../../../../__tests__/util/graphqlMocking';
import { ContactRowFragmentDoc } from '../../ContactRow.generated';
import { ContactTaskRow } from './ContactTaskRow';
import { ContactTaskRowFragment } from './ContactTaskRow.generated';

export default {
  title: 'Contacts/Tab/ContactTasksTab/Row',
  component: ContactTaskRow,
};

export const Default = (): ReactElement => {
  const task = gqlMock<ContactTaskRowFragment>(ContactRowFragmentDoc);

  return <ContactTaskRow task={task} />;
};
