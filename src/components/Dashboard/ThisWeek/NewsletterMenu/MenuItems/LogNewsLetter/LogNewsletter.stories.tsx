import React, { ReactElement } from 'react';
import { GqlMockedProvider } from '../../../../../../../__tests__/util/graphqlMocking';
import LogNewsletter from './LogNewsletter';

export default {
  title: 'Dashboard/ThisWeek/NewsletterMenu/MenuItems/LogNewsletter',
};

const accountListId = '111';

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider>
      <LogNewsletter accountListId={accountListId} handleClose={() => {}} />
    </GqlMockedProvider>
  );
};
