import { MockedResponse } from '@apollo/client/testing';
import { DateTime } from 'luxon';
import {
  ActivityTypeEnum,
  TaskCreateInput,
} from '../../../../../../../graphql/types.generated';
import {
  CreateTasksDocument,
  CreateTasksMutation,
  TaskMutationResponseFragment,
} from '../../../../../Task/Modal/Form/TaskModal.generated';

export const createNewsletterTaskMutationMock = (
  id: string,
  activityType: ActivityTypeEnum,
): MockedResponse => {
  const task: TaskCreateInput = {
    activityType,
    completedAt: null,
    startAt: DateTime.local().plus({ hours: 1 }).startOf('hour').toISO(),
    subject: 'abc',
    comment: 'comment',
  };
  const data: CreateTasksMutation = {
    createTasks: {
      tasks: [{ ...task, id } as TaskMutationResponseFragment],
    },
  };

  return {
    request: {
      query: CreateTasksDocument,
      variables: {
        accountListId: 'abc',
        attributes: task,
      },
    },
    result: { data },
  };
};
