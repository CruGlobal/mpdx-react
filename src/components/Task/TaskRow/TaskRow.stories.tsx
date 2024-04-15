import React, { ReactElement } from 'react';
import { ContactUrl } from 'pages/accountLists/[accountListId]/tasks/[[...contactId]].page';
import { ResultEnum } from 'src/graphql/types.generated';
import { gqlMock } from '../../../../__tests__/util/graphqlMocking';
import { TaskRow } from './TaskRow';
import { TaskRowFragment, TaskRowFragmentDoc } from './TaskRow.generated';

export default {
  title: 'Task/Row',
  component: TaskRow,
};

const accountListId = 'abc';
const startAt = '2021-04-12';
const lateStartAt = '2019-10-12';
const onTaskCheckSelected = () => {};
const getContactUrl = () => ({} as ContactUrl);

export const Default = (): ReactElement => {
  const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
    mocks: {
      startAt,
      result: ResultEnum.None,
      starred: false,
    },
  });

  return (
    <TaskRow
      accountListId={accountListId}
      task={task}
      isChecked={false}
      getContactUrl={getContactUrl}
      onTaskCheckToggle={onTaskCheckSelected}
    />
  );
};

export const Starred = (): ReactElement => {
  const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
    mocks: {
      starred: true,
    },
  });

  return (
    <TaskRow
      accountListId={accountListId}
      task={task}
      isChecked={false}
      getContactUrl={getContactUrl}
      onTaskCheckToggle={onTaskCheckSelected}
    />
  );
};

export const Checked = (): ReactElement => {
  const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {});

  return (
    <TaskRow
      accountListId={accountListId}
      task={task}
      isChecked={true}
      getContactUrl={getContactUrl}
      onTaskCheckToggle={onTaskCheckSelected}
    />
  );
};

export const Complete = (): ReactElement => {
  const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
    mocks: {
      startAt,
      result: ResultEnum.Completed,
    },
  });

  return (
    <TaskRow
      accountListId={accountListId}
      task={task}
      isChecked={false}
      getContactUrl={getContactUrl}
      onTaskCheckToggle={onTaskCheckSelected}
    />
  );
};

export const Late = (): ReactElement => {
  const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
    mocks: {
      startAt: lateStartAt,
      result: ResultEnum.None,
    },
  });

  return (
    <TaskRow
      accountListId={accountListId}
      task={task}
      isChecked={false}
      getContactUrl={getContactUrl}
      onTaskCheckToggle={onTaskCheckSelected}
    />
  );
};

Default.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/zvqkcHImucOoPyXrYNqrkn/MPDX-Update-Material-UI?node-id=1845%3A545',
  },
};
