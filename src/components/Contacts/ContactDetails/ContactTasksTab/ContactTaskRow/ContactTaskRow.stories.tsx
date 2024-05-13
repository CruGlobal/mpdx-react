import React, { ReactElement } from 'react';
import { gqlMock } from '__tests__/util/graphqlMocking';
import { ResultEnum } from 'src/graphql/types.generated';
import {
  TaskRowFragment,
  TaskRowFragmentDoc,
} from '../../../../Task/TaskRow/TaskRow.generated';
import { ContactTaskRow } from './ContactTaskRow';

export default {
  title: 'Contacts/Tab/ContactTasksTab/Row',
  component: ContactTaskRow,
};

const accountListId = 'abc';
const startAt = '2021-04-12';
const lateStartAt = '2019-10-12';
const onTaskCheckToggle = () => {};

export const Default = (): ReactElement => {
  const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
    mocks: {
      startAt,
      result: ResultEnum.None,
    },
  });

  return (
    <ContactTaskRow
      accountListId={accountListId}
      task={task}
      isChecked={false}
      onTaskCheckToggle={onTaskCheckToggle}
    />
  );
};

export const Loading = (): ReactElement => {
  return (
    <ContactTaskRow
      accountListId={accountListId}
      task={undefined}
      isChecked={false}
      onTaskCheckToggle={onTaskCheckToggle}
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
    <ContactTaskRow
      accountListId={accountListId}
      task={task}
      isChecked={false}
      onTaskCheckToggle={onTaskCheckToggle}
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
    <ContactTaskRow
      accountListId={accountListId}
      task={task}
      isChecked={false}
      onTaskCheckToggle={onTaskCheckToggle}
    />
  );
};
