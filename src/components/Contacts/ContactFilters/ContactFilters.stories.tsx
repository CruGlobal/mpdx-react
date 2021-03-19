import React, { ReactElement } from 'react';
import { ContactFiltersQuery } from '../../../../pages/accountLists/[accountListId]/ContactFilters.generated';
import { ContactFilters } from './ContactFilters';

export default {
  title: 'ContactFilters',
};

const data: ContactFiltersQuery = {
  contactFilters: [
    { id: '1', name: 'Late Commitments' },
    { id: '2', name: 'Status' },
  ],
};

export const Default = (): ReactElement => {
  return (
    <ContactFilters
      data={null}
      loading={false}
      error={null}
      loadFilters={() => {}}
    />
  );
};

export const Loading = (): ReactElement => {
  return (
    <ContactFilters
      data={data}
      loading={true}
      error={null}
      loadFilters={() => {}}
    />
  );
};

export const WithData = (): ReactElement => {
  return (
    <ContactFilters
      data={data}
      loading={false}
      error={null}
      loadFilters={() => {}}
    />
  );
};

Default.story = {
  parameters: {
    chromatic: { delay: 1000 },
  },
};
