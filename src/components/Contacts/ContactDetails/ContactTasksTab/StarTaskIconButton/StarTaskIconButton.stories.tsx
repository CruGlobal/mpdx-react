import React, { ReactElement } from 'react';
import { GqlMockedProvider } from '../../../../../../__tests__/util/graphqlMocking';
import { StarTaskIconButton } from './StarTaskIconButton';
import { SetTaskStarredMutation } from './SetTaskStarred.generated';

export default {
  title: 'Contacts/ContactRow/Widgets/StarContactIconButton',
};

const accountListId = 'abc';
const taskId = '1';

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider<SetTaskStarredMutation>
      mocks={{
        updateTask: { task: { id: taskId, starred: false } },
      }}
    >
      <StarTaskIconButton
        accountListId={accountListId}
        taskId={taskId}
        isStarred={false}
      />
    </GqlMockedProvider>
  );
};

export const IsStarred = (): ReactElement => {
  return (
    <GqlMockedProvider<SetTaskStarredMutation>
      mocks={{ updateTask: { task: { id: taskId, starred: true } } }}
    >
      <StarTaskIconButton
        accountListId={accountListId}
        taskId={taskId}
        isStarred={true}
      />
    </GqlMockedProvider>
  );
};
