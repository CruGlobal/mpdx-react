import React, { ReactElement } from 'react';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import { StarContactIconButton } from './StarContactIconButton';
import { SetContactStarredMutation } from './SetContactStarred.generated';

export default {
  title: 'Contacts/ContactRow/Widgets/StarContactIcon',
};

const accountListId = 'abc';
const contactId = '1';

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider<SetContactStarredMutation>
      mocks={{ contact: { id: contactId, noAppeal: false } }}
    >
      <StarContactIconButton
        accountListId={accountListId}
        contactId={contactId}
        hasStar={false}
      />
    </GqlMockedProvider>
  );
};

export const IsStared = (): ReactElement => {
  return (
    <GqlMockedProvider<SetContactStarredMutation>
      mocks={{ contact: { id: contactId, noAppeal: true } }}
    >
      <StarContactIconButton
        accountListId={accountListId}
        contactId={contactId}
        hasStar={false}
      />
    </GqlMockedProvider>
  );
};
