import React, { ReactElement } from 'react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { SetContactStarredMutation } from './SetContactStarred.generated';
import { StarContactIconButton } from './StarContactIconButton';

export default {
  title: 'Contacts/ContactRow/Widgets/StarContactIconButton',
};

const accountListId = 'abc';
const contactId = '1';

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider<{ SetContactStarred: SetContactStarredMutation }>
      mocks={{
        updateContact: { contact: { id: contactId, starred: false } },
      }}
    >
      <StarContactIconButton
        accountListId={accountListId}
        contactId={contactId}
        isStarred={false}
      />
    </GqlMockedProvider>
  );
};

export const IsStarred = (): ReactElement => {
  return (
    <GqlMockedProvider<{ SetContactStarred: SetContactStarredMutation }>
      mocks={{ updateContact: { contact: { id: contactId, starred: true } } }}
    >
      <StarContactIconButton
        accountListId={accountListId}
        contactId={contactId}
        isStarred={true}
      />
    </GqlMockedProvider>
  );
};
