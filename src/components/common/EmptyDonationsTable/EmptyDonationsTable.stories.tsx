import React, { ReactElement } from 'react';

import { EmptyDonationsTable } from './EmptyDonationsTable';

export default {
  title: 'Reports/ExpectedMonthlyTotal/Empty',
};

export const Default = (): ReactElement => {
  return (
    <EmptyDonationsTable title="You have no expected donations this month" />
  );
};
