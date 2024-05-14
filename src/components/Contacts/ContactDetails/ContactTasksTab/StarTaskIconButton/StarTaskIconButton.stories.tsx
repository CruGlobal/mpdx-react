import React, { ReactElement } from 'react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { SetTaskStarredMutation } from './SetTaskStarred.generated';
import { StarTaskIconButton } from './StarTaskIconButton';

export default {
  title: 'Contacts/ContactRow/Widgets/StarContactIconButton',
};

const accountListId = 'abc';
const taskId = '1';

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider<{ SetTaskStarred: SetTaskStarredMutation }>
      mocks={{
        SetTaskStarred: {
          updateTask: { task: { id: taskId, starred: false } },
        },
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
    <GqlMockedProvider<{ SetTaskStarred: SetTaskStarredMutation }>
      mocks={{
        SetTaskStarred: { updateTask: { task: { id: taskId, starred: true } } },
      }}
    >
      <StarTaskIconButton
        accountListId={accountListId}
        taskId={taskId}
        isStarred={true}
      />
    </GqlMockedProvider>
  );
};
