import React, { ReactElement } from 'react';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import { StarContactIconButton } from './StarContactIconButton';
import { SetContactStarredMutation } from './SetContactStarred.generated';

export default {
  title: 'Contacts/ContactRow/Widgets/StarContactIconButton',
};

const accountListId = 'abc';
const contactId = '1';

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider<SetContactStarredMutation>
      mocks={{
        updateContact: { contact: { id: contactId, starred: false } },
      }}
    >
      <StarContactIconButton
        accountListId={accountListId}
        contactId={contactId}
      />
    </GqlMockedProvider>
  );
};

export const IsStarred = (): ReactElement => {
  return (
    <GqlMockedProvider<SetContactStarredMutation>
      mocks={{ updateContact: { contact: { id: contactId, starred: true } } }}
    >
      <StarContactIconButton
        accountListId={accountListId}
        contactId={contactId}
      />
    </GqlMockedProvider>
  );
};
