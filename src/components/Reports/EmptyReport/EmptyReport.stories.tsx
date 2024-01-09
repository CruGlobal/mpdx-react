import React, { ReactElement } from 'react';
import { EmptyReport } from './EmptyReport';

export default {
  title: 'Reports/EmptyReport',
};

export const Default = (): ReactElement => (
  <EmptyReport
    title="You have received no donations in the last thirteen months"
    subTitle="You can setup an organization account to import them or add a new donation."
  />
);
