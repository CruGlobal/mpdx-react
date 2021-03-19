import React, { ReactElement } from 'react';
import { StatusEnum } from '../../../../graphql/types.generated';
import { ContactRowFragment } from '../ContactRow.generated';
import { ContactsTable } from './ContactsTable';

export default {
  title: 'ContactsTable',
};

const contacts: ContactRowFragment[] = [
  {
    id: '1',
    name: 'Mouse, Mickey',
    status: StatusEnum.PartnerFinancial,
    people: undefined,
  },
  {
    id: '2',
    name: 'Duck, Donald',
    status: StatusEnum.PartnerPray,
    people: undefined,
  },
];

export const Default = (): ReactElement => {
  return <ContactsTable contacts={undefined} loading={false} error={null} />;
};

export const Loading = (): ReactElement => {
  return <ContactsTable contacts={contacts} loading={true} error={null} />;
};

export const WithData = (): ReactElement => {
  return <ContactsTable contacts={contacts} loading={false} error={null} />;
};

Default.story = {
  parameters: {
    chromatic: { delay: 1000 },
  },
};
