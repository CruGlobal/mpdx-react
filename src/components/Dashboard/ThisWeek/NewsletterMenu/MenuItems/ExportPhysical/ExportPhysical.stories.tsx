import React, { ReactElement } from 'react';
import { GqlMockedProvider } from '../../../../../../../__tests__/util/graphqlMocking';
import ExportPhysical from './ExportPhysical';

export default {
  title: 'Dashboard/ThisWeek/NewsletterMenu/MenuItems/ExportPhysical',
};

const accountListId = '111';

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider>
      <ExportPhysical accountListId={accountListId} handleClose={() => {}} />
    </GqlMockedProvider>
  );
};
